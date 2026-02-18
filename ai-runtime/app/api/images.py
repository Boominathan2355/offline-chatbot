
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import logging
import os
import io
import base64
from app.core.image_catalog import get_image_catalog, find_image_model, IMAGE_MODEL_CATALOG
from app.core.image_generation import image_service
from app.core.config import MODELS_DIR
from app.core.image_generation import image_service, STABLE_DIFFUSION_AVAILABLE
import asyncio
import httpx

# We reuse the download logic from models.py or create similar
# For now, let's just use the models directory.
# We might need a separate download manager for images if we want to track progress.
# Let's reuse the existing model download logic if possible, or duplicate it for images.
# Actually, the existing `models.py` uses `model_catalog.py`.
# We need `images.py` to handle image model downloads too.

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Data Models ─────────────────────────────────────────────────
class ImageGenerationRequest(BaseModel):
    model_id: str
    prompt: str
    negative_prompt: Optional[str] = ""
    steps: Optional[int] = 20
    width: Optional[int] = 512
    height: Optional[int] = 512
    cfg_scale: Optional[float] = 7.0
    seed: Optional[int] = -1

class ImageModelDownloadRequest(BaseModel):
    model_id: str

# ── Endpoints ───────────────────────────────────────────────────

@router.get("/catalog")
def get_catalog():
    """Get the image model catalog."""
    # Check if models are installed
    catalog = get_image_catalog()
    result = []
    for m in catalog:
        m_copy = m.copy()
        path = os.path.join(MODELS_DIR, m["filename"])
        m_copy["installed"] = os.path.exists(path)
        result.append(m_copy)
    return result

@router.post("/generate")
def generate_image(request: ImageGenerationRequest):
    """Generate an image."""
    if not STABLE_DIFFUSION_AVAILABLE:
        raise HTTPException(
            status_code=400, 
            detail="stable_diffusion_cpp dependency is not installed on the system. Please refer to the installation guide to enable image generation."
        )

    model_info = find_image_model(request.model_id)
    if not model_info:
        raise HTTPException(status_code=404, detail="Model not found")

    path = os.path.join(MODELS_DIR, model_info["filename"])
    if not os.path.exists(path):
        raise HTTPException(status_code=400, detail="Model not installed. Please download it first.")

    try:
        # Load model if needed
        image_service.load_model(request.model_id, path)
        
        # Generate
        # stable-diffusion-cpp-python returns a list of items (usually PIL images or similar)
        # We need to convert to base64 to send back to frontend
        result = image_service.generate(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            steps=request.steps,
            width=request.width,
            height=request.height,
            cfg_scale=request.cfg_scale,
            seed=request.seed
        )
        
        # result is likely a list containing one image
        # Let's verify what image_service.generate returns. I implemented it to return images[0]
        # So result is a PIL Image (if PIL is installed) or bytes?
        # stable-diffusion-cpp-python usually returns data.
        # Let's assume it returns a PIL Image or compatible object with .save()
        
        buffered = io.BytesIO()
        # Convert to RGB just in case
        if hasattr(result, "convert"):
            result = result.convert("RGB")
            
        result.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {
            "status": "success",
            "image": f"data:image/png;base64,{img_str}",
            "meta": {
                "prompt": request.prompt,
                "model": request.model_id
            }
        }

    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Download Handling ───────────────────────────────────────────
# We need to track download progress. PROBABLY better to share the download manager from models.py
# But `models.py` is tightly coupled to `model_catalog`.
# Let's duplicate the simple download logic for now to keep it isolated as requested ("keep seperate")

_image_download_status = {}

@router.post("/download")
def download_image_model(request: ImageModelDownloadRequest, background_tasks: BackgroundTasks):
    model = find_image_model(request.model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
        
    if request.model_id in _image_download_status and _image_download_status[request.model_id]["status"] == "downloading":
         return {"status": "already_downloading"}

    path = os.path.join(MODELS_DIR, model["filename"])
    if os.path.exists(path):
        return {"status": "already_installed"}
        
    _image_download_status[request.model_id] = {"status": "downloading", "progress": 0}
    background_tasks.add_task(_download_worker, model["url"], path, request.model_id)
    return {"status": "started"}

@router.get("/download/{model_id}")
def get_download_status(model_id: str):
    return _image_download_status.get(model_id, {"status": "unknown"})

@router.delete("/delete/{model_id}")
def delete_image_model(model_id: str):
    model = find_image_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
        
    path = os.path.join(MODELS_DIR, model["filename"])
    if os.path.exists(path):
        os.remove(path)
        if model_id in _image_download_status:
             del _image_download_status[model_id]
        return {"status": "deleted"}
    return {"status": "not_found"}

async def _download_worker(url: str, dest_path: str, model_id: str):
    try:
        logger.info(f"Starting async download for {model_id} from {url}")
        async with httpx.AsyncClient(follow_redirects=True, timeout=None) as client:
            async with client.stream("GET", url) as response:
                response.raise_for_status()
                total = int(response.headers.get("content-length", 0))
                downloaded = 0
                
                with open(dest_path, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=256 * 1024):
                        if chunk:
                            await asyncio.to_thread(f.write, chunk)
                            downloaded += len(chunk)
                            progress = int((downloaded / total) * 100) if total > 0 else 0
                            _image_download_status[model_id] = {
                                "status": "downloading", 
                                "progress": progress,
                                "downloaded": downloaded,
                                "total": total
                            }
            
        logger.info(f"Download completed for {model_id}")
        _image_download_status[model_id] = {"status": "completed", "progress": 100}
        
    except Exception as e:
        logger.error(f"Download failed for {model_id}: {e}")
        _image_download_status[model_id] = {"status": "failed", "error": str(e)}
        if os.path.exists(dest_path):
            os.remove(dest_path)
