import os
import subprocess
import platform
import psutil
from typing import List, Optional, Type
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

# --- Base Tool Mixin for Permissions ---
class ToolPermissionMixin:
    # Default permission
    permission: str = "read" 

# --- Filesystem Tool ---
class WriteFileInput(BaseModel):
    file_path: str = Field(description="The absolute path to the file to write to")
    content: str = Field(description="The content to write to the file")

class FilesystemTool(BaseTool, ToolPermissionMixin):
    name: str = "filesystem_write"
    description: str = "Writes content to a file. Use with caution."
    args_schema: Type[BaseModel] = WriteFileInput
    permission: str = "write"

    def _run(self, file_path: str, content: str) -> str:
        try:
            # Basic sandbox check: ensure path is within allowed directory (e.g., /tmp or user project)
            # For now, allowing all for demonstration, but IN REALITY, restricting to a workspace is critical.
            # allowed_root = "/home/boominathan-alagirisamy/Projects/ChatBot"
            # if not file_path.startswith(allowed_root):
            #     return f"Error: Access denied. Can only write to {allowed_root}"
            
            with open(file_path, "w") as f:
                f.write(content)
            return f"Successfully wrote to {file_path}"
        except Exception as e:
            return f"Error writing file: {str(e)}"

# --- Terminal Tool ---
class TerminalInput(BaseModel):
    command: str = Field(description="The shell command to execute")

class TerminalTool(BaseTool, ToolPermissionMixin):
    name: str = "terminal_execute"
    description: str = "Executes a shell command. Use with EXTREME caution."
    args_schema: Type[BaseModel] = TerminalInput
    permission: str = "execute"
    
    # Whitelist of allowed commands
    ALLOWED_COMMANDS: List[str] = ["ls", "echo", "pwd", "whoami", "date", "cat", "grep"]

    def _run(self, command: str) -> str:
        # Strict Whitelist Check
        cmd_base = command.split(" ")[0]
        if cmd_base not in self.ALLOWED_COMMANDS:
             return f"Error: Command '{cmd_base}' is not in the allowed whitelist: {self.ALLOWED_COMMANDS}"

        # Blacklist check (extra safety)
        forbidden_substrings = [";", "&&", "|", ">", "rm ", "sudo", "mv"]
        if any(bad in command for bad in forbidden_substrings):
            return "Error: Complex command chaining or dangerous operations are forbidden."

        try:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                timeout=10
            )
            return f"Stdout: {result.stdout}\nStderr: {result.stderr}"
        except Exception as e:
            return f"Error executing command: {str(e)}"

# --- System Tool ---
class SystemTool(BaseTool, ToolPermissionMixin):
    name: str = "system_info"
    description: str = "Retrieves current system resource usage (RAM, CPU)."
    permission: str = "read"

    def _run(self, query: Optional[str] = None) -> str:
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            info = (
                f"CPU Usage: {cpu_percent}%\n"
                f"RAM Total: {mem.total / (1024**3):.2f} GB\n"
                f"RAM Available: {mem.available / (1024**3):.2f} GB\n"
                f"Disk Free: {disk.free / (1024**3):.2f} GB"
            )
            return info
        except Exception as e:
            return f"Error getting system info: {str(e)}"
