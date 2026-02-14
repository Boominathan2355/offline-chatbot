"""
Models API - catalog, listing, and download management.
"""
import os
import shutil
import platform
import asyncio
from typing import Any, Dict, List
import httpx
from fastapi import APIRouter, BackgroundTasks
from app.core.model_loader import get_available_models, get_current_model_name, MODELS_DIR
from app.core.model_catalog import get_catalog, find_model
from app.core.image_catalog import find_image_model, get_image_catalog

router = APIRouter()

# Track active downloads: { model_id: { status, progress, downloaded, total, error } }
_download_status: Dict[str, Dict[str, Any]] = {}
# Track active tasks: { model_id: asyncio.Task }
_download_tasks: Dict[str, asyncio.Task] = {}


@router.get("/catalog")
async def catalog():
    """Return all models available for download, with installed status."""
    from app.core.image_catalog import get_image_catalog
    
    installed = [f.lower() for f in get_available_models()]
    models: List[Dict[str, Any]] = []
    
    # Text Models
    for m in get_catalog():
        is_installed = m["filename"].lower() in installed
        # Add download status if active
        d_status = _download_status.get(str(m["id"]), {"status": "idle", "progress": 0})
        models.append({**m, "installed": is_installed, "type": "text", "download_status": d_status})
        
    # Image Models
    for m in get_image_catalog():
        is_installed = m["filename"].lower() in installed
        # Add download status if active
        d_status = _download_status.get(str(m["id"]), {"status": "idle", "progress": 0})
        models.append({**m, "installed": is_installed, "type": "image", "download_status": d_status})
        
    return {"models": models}


@router.get("/list")
async def list_models():
    """List locally installed models."""
    available = get_available_models()
    current = get_current_model_name()
    return {
        "loaded_models": [current] if current else [],
        "available_models": available,
    }


@router.get("/download/status/{model_id}")
async def download_status(model_id: str):
    """Get download progress for a model."""
    if model_id in _download_status:
        return _download_status[model_id]
    return {"status": "idle", "progress": 0}


@router.post("/download/{model_id}")
async def download_model(model_id: str):
    """Start downloading a model by ID from the catalog."""
    # Try text models first
    model = find_model(model_id)
    
    # Try image models if not found in text models
    if not model:
        model = find_image_model(model_id)
        
    if not model:
        return {"status": "error", "message": f"Model '{model_id}' not found in catalog"}

    # Check if already downloaded
    target_path = os.path.join(MODELS_DIR, model["filename"])
    if os.path.exists(target_path):
        return {"status": "already_installed", "message": "Model already downloaded"}

    # Check if already downloading
    if model_id in _download_status and _download_status[model_id]["status"] == "downloading":
        return {"status": "already_downloading", "message": "Download already in progress"}

    _download_status[model_id] = {
        "status": "downloading",
        "progress": 0,
        "downloaded": 0,
        "total": model.get("sizeBytes", 0),
        "error": None
    }

    task = asyncio.create_task(_do_download(model_id, model["url"], target_path, model.get("sizeBytes", 0)))
    _download_tasks[model_id] = task
    
    return {"status": "started", "message": f"Downloading {model['name']}..."}


@router.post("/download/cancel/{model_id}")
async def cancel_download(model_id: str):
    """Cancel an active download."""
    if model_id in _download_tasks:
        task = _download_tasks[model_id]
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
        
        # Cleanup is handled in _do_download via finally/except
        if model_id in _download_tasks:
            _download_tasks.pop(model_id, None)

        _download_status[model_id] = {"status": "cancelled", "progress": 0, "error": "Cancelled by user"}
        return {"status": "cancelled", "message": f"Download for {model_id} cancelled"}
    
    return {"status": "error", "message": "No active download found for this model"}


async def _do_download(model_id: str, url: str, target_path: str, expected_size: int):
    """Background task to download a model file with progress tracking."""
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    temp_path = target_path + ".part"

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=None) as client:
            async with client.stream("GET", url) as response:
                response.raise_for_status()
                total = int(response.headers.get("content-length", expected_size))
                downloaded: int = 0

                with open(temp_path, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=1024 * 1024):  # 1MB chunks
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)
                            progress = int((downloaded / total) * 100) if total > 0 else 0
                            _download_status[model_id] = {
                                "status": "downloading",
                                "progress": progress,
                                "downloaded": downloaded,
                                "total": total,
                                "error": None,
                            }

        # Rename temp to final
        os.rename(temp_path, target_path)
        _download_status[model_id] = {"status": "completed", "progress": 100, "error": None}

    except asyncio.CancelledError:
        _download_status[model_id] = {"status": "cancelled", "progress": 0, "error": "Cancelled"}
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise

    except Exception as e:
        _download_status[model_id] = {"status": "failed", "progress": 0, "error": str(e)}
        # Clean up partial download
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    finally:
        if model_id in _download_tasks:
            _download_tasks.pop(model_id, None)


@router.delete("/delete/{model_id}")
async def delete_model(model_id: str):
    """Delete a downloaded model."""
    model = find_model(model_id)
    if not model:
        model = find_image_model(model_id)
        
    if not model:
        return {"status": "error", "message": "Model not found in catalog"}

    target_path = os.path.join(MODELS_DIR, model["filename"])
    if os.path.exists(target_path):
        os.remove(target_path)
        if model_id in _download_status:
            _download_status.pop(model_id, None)
        return {"status": "deleted"}
    return {"status": "not_found", "message": "Model file not found"}


@router.post("/benchmark/{model_name}")
async def run_benchmark(model_name: str):
    from app.core.benchmark import Benchmark
    bench = Benchmark(model_path=model_name)
    results = bench.run_benchmark()
    return {"status": "success", "results": results.get("aggregated", results)}


def get_system_ram_gb():
    """Get system RAM in GB using os.sysconf (POSIX) or fallback."""
    try:
        # Pysico pages * Page size
        total_bytes = os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES')
        return total_bytes / (1024**3)
    except (ValueError, AttributeError):
        # Fallback or non-POSIX
        return 8.0  # Conservative default

def has_gpu():
    """Check for GPU availability (NVIDIA or Metal)."""
    # 1. Check for NVIDIA (nvidia-smi)
    if shutil.which("nvidia-smi"):
        return True
    
    # 2. Check for macOS Metal (MPS)
    # Pytorch check would be better but we want to avoid importing torch just for this
    # if platform.system() == "Darwin" and platform.processor() == "arm":
    if platform.system() == "Darwin" and platform.machine() == "arm64":
        return True

    return False

@router.get("/recommend")
async def recommend_models():
    """
    Return a list of recommended model IDs dynamically based on system hardware.
    
    Logic:
    - RAM < 8GB: Recommend Tiny/Small models.
    - RAM 8-16GB: Recommend Small/Medium models.
    - RAM > 16GB: Recommend Medium/Large models.
    - GPU Available: Boost Image Generation and larger models.
    - CPU Only: Prioritize smaller, faster models (LCM/Turbo for images).
    """
    ram_gb = get_system_ram_gb()
    gpu_available = has_gpu()
    
    recommendations = []

    # ── Strategy Selection ─────────────────────────────────────────
    
    # TINY SYSTEM (< 8GB RAM)
    if ram_gb < 8:
        recommendations = [
            "phi-3-mini-4k",          # Tiny Chat
            "tinyllama-1.1b-chat",    # Tiny Chat (Fallback)
            "qwen2.5-0.5b-instruct",  # Ultra-light
            "deepseek-r1-distill-qwen-1.5b", # Tiny Reasoning
            "moondream2",             # Tiny Vision
            "nanollava",              # Tiny Vision (Fallback)
        ]
        # Images: Only fast/small ones
        if gpu_available:
            recommendations.append("dreamshaper-8-lcm") # Fast LCM
        else:
            recommendations.append("sdxl-turbo-q8")     # Turbo (1 step) might be heavy on RAM but fast
            recommendations.append("dreamshaper-8-lcm")

    # SMALL/MEDIUM SYSTEM (8GB - 16GB RAM)
    elif ram_gb < 16:
        recommendations = [
            "llama-3-8b-instruct",    # Standard Chat
            "mistral-7b-instruct",    # Reliable Chat
            "deepseek-r1-distill-llama-8b", # Reasoning
            "qwen2.5-coder-7b-instruct", # Coding
            "llava-v1.6-mistral-7b",  # Vision
        ]
        
        if gpu_available:
            recommendations.extend([
                "gemma-2-9b-instruct", # Heavier chat
                "sd-v1-5-f16",         # Standard SD
                "photon-v1",           # Photorealistic
            ])
        else:
            # CPU optimized images
            recommendations.append("dreamshaper-8-lcm")
            recommendations.append("sdxl-turbo-q8")

    # LARGE SYSTEM (> 16GB RAM)
    else:
        recommendations = [
            "mixtral-8x7b-instruct",  # Top tier (MoE)
            "qwen2.5-14b-instruct",   # Strong Chat
            "deepseek-r1-distill-qwen-32b", # Strong Reasoning
            "deepseek-coder-v2-lite", # Strong Coding
            "minicpm-v-2_6",          # Strong Vision
        ]
        
        # Add some fast smaller models too
        recommendations.append("llama-3.1-8b-instruct")
        
        if gpu_available:
            recommendations.extend([
                "sdxl-turbo-q8",
                "photon-v1",
                "inst-pix2pix"
            ])
        else:
            recommendations.append("dreamshaper-8-lcm")

    return recommendations
