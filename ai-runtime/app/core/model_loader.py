"""
Model loader for GGUF models using llama-cpp-python.
Manages loading, caching, and switching between models.
"""
import os
import glob
from typing import Any, Optional

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")

_loaded_models = {}
_current_model_name: Optional[str] = None


def get_available_models() -> list[str]:
    """List all .gguf model files in the models directory."""
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR, exist_ok=True)
        return []
    
    models = []
    for f in glob.glob(os.path.join(MODELS_DIR, "*.gguf")):
        models.append(os.path.basename(f))
    return sorted(models)


def load_model(model_name: str):
    """Load a GGUF model by name. Returns the Llama instance."""
    global _current_model_name
    
    if model_name in _loaded_models:
        _current_model_name = model_name
        return _loaded_models[model_name]
    
    model_path = os.path.join(MODELS_DIR, model_name)
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    
    from llama_cpp import Llama
    
    print(f"[ModelLoader] Loading model: {model_name}...")
    llm = Llama(
        model_path=model_path,
        n_ctx=2048,       # Context window
        n_threads=4,      # CPU threads
        n_gpu_layers=0,   # CPU-only by default
        verbose=False,
    )
    print(f"[ModelLoader] Model loaded: {model_name}")
    
    _loaded_models[model_name] = llm
    _current_model_name = model_name
    return llm


def get_current_model():
    """Get the currently loaded model, or None."""
    if _current_model_name and _current_model_name in _loaded_models:
        return _loaded_models[_current_model_name]
    return None


def get_current_model_name() -> Optional[str]:
    """Get the name of the currently loaded model."""
    return _current_model_name


def unload_model(model_name: str):
    """Unload a model from memory."""
    global _current_model_name
    if model_name in _loaded_models:
        _loaded_models.pop(model_name)
        if _current_model_name == model_name:
            _current_model_name = None
