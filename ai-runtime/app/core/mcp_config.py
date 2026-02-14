
import json
import os
from typing import Dict, List, Any

MCP_CONFIG_FILE = "mcp_config.json"

class MCPConfigManager:
    def __init__(self):
        self.config_file = MCP_CONFIG_FILE
        self._ensure_config()

    def _ensure_config(self):
        """Create default config if not exists or migrate old config."""
        if not os.path.exists(self.config_file):
            default_config = {
                "mcpServers": {
                    "filesystem": {
                        "command": "builtin",
                        "args": [],
                        "env": {},
                        "enabled": True,
                        "description": "Access to local filesystem"
                    },
                    "terminal": {
                        "command": "builtin",
                        "args": [],
                        "env": {},
                        "enabled": True,
                        "description": "Execute terminal commands"
                    },
                    "browser": {
                        "command": "builtin",
                        "args": [],
                        "env": {},
                        "enabled": False,
                        "description": "Web browsing capabilities"
                    },
                    "sequential-thinking": {
                        "command": "builtin",
                        "args": [],
                        "env": {},
                        "enabled": True,
                        "description": "Advanced problem solving"
                    }
                }
            }
            self._save_config(default_config)
        else:
            # Migration check: if 'servers' exists but not 'mcpServers', migrate it
            config = self._load_config()
            if "servers" in config and "mcpServers" not in config:
                new_servers = {}
                for name, data in config["servers"].items():
                    new_servers[name] = {
                        "command": "builtin",
                        "args": [],
                        "env": {},
                        "enabled": data.get("enabled", False),
                        "description": data.get("description", "")
                    }
                config["mcpServers"] = new_servers
                config.pop("servers", None)
                self._save_config(config)

    def _load_config(self) -> Dict[str, Any]:
        try:
            with open(self.config_file, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {"mcpServers": {}}

    def _save_config(self, config: Dict[str, Any]):
        with open(self.config_file, "w") as f:
            json.dump(config, f, indent=4)

    def get_all_mcps(self) -> List[Dict[str, Any]]:
        config = self._load_config()
        servers = []
        for name, data in config.get("mcpServers", {}).items():
            servers.append({
                "id": name,
                "name": name.replace("-", " ").title(),
                "enabled": data.get("enabled", False),
                "description": data.get("description", ""),
                "command": data.get("command", ""),
                "args": data.get("args", []),
                "env": data.get("env", {}),
                "isCustom": data.get("command") != "builtin"
            })
        return servers

    def toggle_mcp(self, mcp_id: str, enabled: bool):
        config = self._load_config()
        if mcp_id in config.get("mcpServers", {}):
            config["mcpServers"][mcp_id]["enabled"] = enabled
            self._save_config(config)
            return True
        return False

    def add_mcp(self, mcp_id: str, name: str, command: str, args: List[str], env: Dict[str, str], description: str):
        config = self._load_config()
        config["mcpServers"][mcp_id] = {
            "command": command,
            "args": args,
            "env": env,
            "enabled": True,
            "description": description
        }
        self._save_config(config)
        return True

    def delete_mcp(self, mcp_id: str):
        config = self._load_config()
        if mcp_id in config.get("mcpServers", {}):
            config["mcpServers"].pop(mcp_id, None)
            self._save_config(config)
            return True
        return False

manager = MCPConfigManager()
