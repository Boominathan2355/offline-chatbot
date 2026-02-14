from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.core.mcp_config import manager as mcp_manager

router = APIRouter()

class AgentRequest(BaseModel):
    task: str
    tools: List[str]

class ToggleMCPRequest(BaseModel):
    mcp_id: str
    enabled: bool

class AddMCPRequest(BaseModel):
    id: str
    name: str
    command: str
    args: List[str]
    env: Dict[str, str]
    description: Optional[str] = ""

@router.get("/mcp/list")
async def list_mcps():
    """List all available MCP servers and their status."""
    return {"mcps": mcp_manager.get_all_mcps()}

@router.post("/mcp/toggle")
async def toggle_mcp(request: ToggleMCPRequest):
    """Enable or disable an MCP server."""
    success = mcp_manager.toggle_mcp(request.mcp_id, request.enabled)
    if not success:
        return {"status": "error", "message": "MCP not found"}
    return {"status": "success", "mcp_id": request.mcp_id, "enabled": request.enabled}

@router.post("/mcp/add")
async def add_mcp(request: AddMCPRequest):
    """Add a new MCP server."""
    success = mcp_manager.add_mcp(
        request.id, 
        request.name, 
        request.command, 
        request.args, 
        request.env, 
        request.description
    )
    return {"status": "success", "mcp_id": request.id}

@router.delete("/mcp/{mcp_id}")
async def delete_mcp(mcp_id: str):
    """Delete an MCP server."""
    success = mcp_manager.delete_mcp(mcp_id)
    if not success:
        return {"status": "error", "message": "MCP not found"}
    return {"status": "success", "mcp_id": mcp_id}

@router.post("/execute")
async def execute_agent(request: AgentRequest):
    # Placeholder for agent execution
    return {
        "task": request.task,
        "result": "Agent task executed (placeholder)",
        "status": "success"
    }
