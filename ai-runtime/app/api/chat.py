"""
Chat API endpoint with real AI inference via llama-cpp-python.
Supports both streaming (SSE) and non-streaming responses.
"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.core.model_loader import get_available_models

router = APIRouter()


class InferRequest(BaseModel):
    model: str
    prompt: str
    stream: bool = False


async def _stream_response(prompt: str, model: str):
    """Stream tokens from the inference engine as SSE events."""
    available = get_available_models()

    if not available:
        yield "data:No models found. Please download a .gguf model to the models/ directory.\n\n"
        return

    try:
        from app.core.inference_engine import generate_stream

        for token in generate_stream(model_name=model, prompt=prompt):
            # Send each token as an SSE data event
            yield f"data:{token}\n\n"
    except Exception as e:
        yield f"data:[Error: {str(e)}]\n\n"


@router.post("/send")
async def infer(request: InferRequest):
    if request.stream:
        return StreamingResponse(
            _stream_response(request.prompt, request.model),
            media_type="text/event-stream",
        )

    # Non-streaming fallback
    available = get_available_models()
    if not available:
        return {
            "model": request.model,
            "response": "No models found. Please download a .gguf model to the models/ directory.",
            "status": "error",
        }

    try:
        from app.core.inference_engine import generate_response

        response = generate_response(model_name=request.model, prompt=request.prompt)
        return {
            "model": request.model,
            "response": response,
            "status": "success",
        }
    except Exception as e:
        return {
            "model": request.model,
            "response": f"Error: {str(e)}",
            "status": "error",
        }
