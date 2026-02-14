import os
from typing import List, Dict, Any, Union
from langchain.agents import initialize_agent, AgentType
from langchain_community.llms import LlamaCpp
from app.agent.tools import FilesystemTool, TerminalTool, SystemTool

class AgentExecutor:
    def __init__(self, model_path: str = None):
        self.tools = [FilesystemTool(), TerminalTool(), SystemTool()]
        self.tool_map = {t.name: t for t in self.tools}
        self.llm = None 
        # In real implementation, initialize LLM here if model_path is provided

    def check_permission(self, tool_name: str) -> bool:
        """
        Middleware to check tool permissions.
        """
        tool = self.tool_map.get(tool_name)
        if not tool:
            return False
            
        # Permission Logic
        # Read: Allow
        # Write: Allow (would prompt user in full UI)
        # Execute: Restricted (would prompt user stringently)
        
        if tool.permission == "execute":
            # For this MVP, we log a warning or require a specific flag
            # In a real system, we'd check a request-scoped approval token
            print(f"[SECURITY WARNING] Executing high-risk tool: {tool_name}")
            return True # Allowing for now, but strictly logged
            
        return True

    def execute_task(self, task: str, tools_whitelist: List[str] = None) -> str:
        # Use simple routing for now as we don't have the 7GB model loaded
        
        target_tool = None
        args = {}

        # Heuristic routing (replaces LLM decision for MVP)
        if "write" in task.lower() and "file" in task.lower():
            target_tool = "filesystem_write"
            # Simple parsing for demo
            args = {"file_path": "/tmp/agent_test.txt", "content": "Created by strict agent"}
            
        elif "list" in task.lower() or "ls" in task.lower():
            target_tool = "terminal_execute"
            args = {"command": "ls -la"}
            
        elif "system" in task.lower():
            target_tool = "system_info"
            args = {}

        if target_tool:
            # 1. Check if tool exists and is whitelisted in request
            if tools_whitelist and target_tool not in tools_whitelist:
                 return f"Error: Tool '{target_tool}' is not allowed for this request."

            # 2. Permission Middleware
            if not self.check_permission(target_tool):
                return f"Error: Permission denied for tool '{target_tool}'"

            # 3. Execute
            tool_instance = self.tool_map[target_tool]
            try:
                # LangChain tools expect a single string or dict depending on schema.
                # _run method signature varies.
                if target_tool == "filesystem_write":
                    return tool_instance._run(args["file_path"], args["content"])
                elif target_tool == "terminal_execute":
                    return tool_instance._run(args["command"])
                else:
                    return tool_instance._run()
            except Exception as e:
                return f"Tool Execution Error: {str(e)}"
        
        return "Agent received task but could not determine tool (LLM placeholder active)."

