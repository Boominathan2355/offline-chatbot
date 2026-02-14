from fastapi import FastAPI
from app.api import chat, agent, models, images

app = FastAPI(title="AI Runtime Microservice")

app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(agent.router, prefix="/agent", tags=["agent"])
app.include_router(models.router, prefix="/models", tags=["models"])
app.include_router(images.router, prefix="/images", tags=["images"])

@app.get("/")
async def root():
    return {"status": "running", "service": "AI Runtime"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
