
import os

# Define the models directory
# Assuming the service is run from "ai-runtime" directory
MODELS_DIR = os.path.join(os.getcwd(), "models")

# Ensure the directory exists
os.makedirs(MODELS_DIR, exist_ok=True)
