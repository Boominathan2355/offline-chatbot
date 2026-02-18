
import logging
try:
    from stable_diffusion_cpp import StableDiffusion
    STABLE_DIFFUSION_AVAILABLE = True
except ImportError:
    StableDiffusion = None
    STABLE_DIFFUSION_AVAILABLE = False
    import logging
    logging.getLogger(__name__).warning("stable_diffusion_cpp not found, image generation will be unavailable")
from app.core.config import MODELS_DIR
import os

logger = logging.getLogger(__name__)

class ImageGenerator:
    def __init__(self):
        self.model = None
        self.current_model_id = None
        self.model_path = None

    def load_model(self, model_id: str, model_path: str):
        """Load the SD model if not already loaded."""
        if self.current_model_id == model_id and self.model is not None:
            return

        logger.info(f"Loading image model: {model_id} from {model_path}")
        try:
            # Check if file exists
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")

            # Instruct stable-diffusion.cpp to use CPU (default) or GPU if available (auto)
            # stable-diffusion-cpp-python automatically binds to the C++ lib
            # We can pass n_threads. w/o explicit gpu usage it defaults to what's available or CPU
            self.model = StableDiffusion(
                model_path=model_path,
                n_threads=os.cpu_count() - 2 if os.cpu_count() > 2 else 1,
            )
            self.current_model_id = model_id
            self.model_path = model_path
            logger.info("Image model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load image model: {e}")
            self.model = None
            self.current_model_id = None
            raise e

    def generate(self, prompt: str, negative_prompt: str = "", steps: int = 20, cfg_scale: float = 7.0, width: int = 512, height: int = 512, seed: int = -1):
        """
        Generate an image from prompt.
        Returns: PIL Image or bytes
        """
        if not self.model:
            raise ValueError("No model loaded. Please load a model first.")

        logger.info(f"Generating image. Prompt: {prompt}, Steps: {steps}")
        
        # stable-diffusion-cpp-python output
        # It usually returns a list of PIL Images
        start_request = {"prompt": prompt, "negative_prompt": negative_prompt, "steps": steps, "cfg_scale": cfg_scale, "width": width, "height": height, "seed": seed}
        
        # The library API: model.txt2img(...)
        images = self.model.txt2img(
            prompt=prompt,
            negative_prompt=negative_prompt,
            steps=steps, 
            cfg_scale=cfg_scale,
            width=width,
            height=height,
            seed=seed
        )
        
        return images[0]

image_service = ImageGenerator()
