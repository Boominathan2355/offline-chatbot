"""
Inference engine for running GGUF models via llama-cpp-python.
Supports both streaming and non-streaming generation.
"""
from typing import Generator
from app.core.model_loader import load_model, get_available_models


def _resolve_model(model_name: str) -> str:
    """Find the best matching .gguf file for the given model name."""
    available = get_available_models()
    if not available:
        raise RuntimeError(
            "No models found in models/ directory. "
            "Please download a .gguf model file."
        )

    for m in available:
        if model_name.lower() in m.lower():
            return m

    return available[0]


def generate_response(
    model_name: str,
    prompt: str,
    max_tokens: int = 512,
    temperature: float = 0.7,
    top_p: float = 0.9,
) -> str:
    """Generate a complete (non-streaming) response."""
    matched = _resolve_model(model_name)
    llm = load_model(matched)

    output = llm(
        f"### User:\n{prompt}\n\n### Assistant:\n",
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        stop=["### User:", "\n\n\n"],
    )
    return output["choices"][0]["text"].strip()


def generate_stream(
    model_name: str,
    prompt: str,
    max_tokens: int = 512,
    temperature: float = 0.7,
    top_p: float = 0.9,
) -> Generator[str, None, None]:
    """Generate a streaming response, yielding token-by-token."""
    matched = _resolve_model(model_name)
    llm = load_model(matched)

    stream = llm(
        f"### User:\n{prompt}\n\n### Assistant:\n",
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        stop=["### User:", "\n\n\n"],
        stream=True,
    )

    for chunk in stream:
        token = chunk["choices"][0]["text"]
        if token:
            yield token
