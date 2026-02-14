
"""
Image Model Catalog.
Registry of GGUF/Quantized Stable Diffusion models compatible with stable-diffusion.cpp.
"""

IMAGE_MODEL_CATALOG = [
    {
        "id": "sd-v1-4",
        "name": "Stable Diffusion v1.4",
        "filename": "sd-v1-4-f16.gguf",
        "size": "4.0 GB",
        "sizeBytes": 4000000000,
        "description": "Original SD 1.4. Good general purpose, reliable baseline.",
        "url": "https://huggingface.co/gpustack/stable-diffusion-v1-4-GGUF/resolve/main/sd-v1-4-f16.gguf",
        "tier": "standard",
        "default_width": 512,
        "default_height": 512,
        "default_steps": 20
    },
    {
        "id": "sd-v1-5",
        "name": "Stable Diffusion v1.5",
        "filename": "stable-diffusion-v1-5-Q4_1.gguf",
        "size": "2.4 GB",
        "sizeBytes": 2400000000,
        "description": "The community favorite SD 1.5, quantized for efficiency.",
        "url": "https://huggingface.co/gpustack/stable-diffusion-v1-5-GGUF/resolve/main/stable-diffusion-v1-5-Q4_1.gguf",
        "tier": "standard",
        "default_width": 512,
        "default_height": 512,
        "default_steps": 20
    },
    {
        "id": "sdxl-turbo",
        "name": "SDXL Turbo",
        "filename": "stable-diffusion-xl-1.0-turbo-Q4_0.gguf",
        "size": "3.7 GB",
        "sizeBytes": 4000000000,
        "description": "Real-time generation. 1-step inference. High quality and super fast.",
        "url": "https://huggingface.co/gpustack/stable-diffusion-xl-1.0-turbo-GGUF/resolve/main/stable-diffusion-xl-1.0-turbo-Q4_0.gguf",
        "tier": "turbo",
        "default_width": 512,
        "default_height": 512,
        "default_steps": 1
    },
    {
        "id": "moondream2",
        "name": "Moondream 2 (Vision)",
        "filename": "moondream2-text-model-f16.gguf",
        "size": "2.6 GB",
        "sizeBytes": 2800000000,
        "description": "Small but capable vision model. Excellent for image analysis.",
        "url": "https://huggingface.co/moondream/moondream2-gguf/resolve/main/moondream2-text-model-f16.gguf",
        "tier": "small",
        "default_width": 512,
        "default_height": 512,
        "default_steps": 25,
        "supportsVision": True
    }
]

def get_image_catalog():
    return IMAGE_MODEL_CATALOG

def find_image_model(model_id: str):
    for m in IMAGE_MODEL_CATALOG:
        if m["id"] == model_id:
            return m
    return None
