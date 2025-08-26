import os
import json
import importlib
from datetime import datetime
from memory.agents.summarize_agent import summarize
from memory.memory_agents.decay_agent.decay_agent import run_decay

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)


# Load the registry
REGISTRY_PATH = os.path.join("memory", "memory_agents", "registry", "memory_agent_registry.json")
with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
    AGENT_REGISTRY = json.load(f)

# Paths
LOG_PATH = os.path.join("memory", "logs", "memory_agent_routes.md")
os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

def log_route(agent_name, query):
    """Log the routing decision to a file."""
    timestamp = datetime.now().strftime("%m/%d - %I:%M%p")
    entry = f"[{timestamp}] Routed to: {agent_name} \\u2014 Query: {query}\n"
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(entry)

def route(query: str) -> str:
    """Route a query to the appropriate memory-related agent based on the registry."""
    for agent_name, agent_info in AGENT_REGISTRY.items():
        trigger_keywords = agent_info.get("trigger_keywords", [])
        if any(keyword in query.lower() for keyword in trigger_keywords):
            log_route(agent_name, query)

            # Dynamically import the agent's function
            module_path = agent_info["path"].replace("/", ".").rstrip(".py")
            function_name = agent_info.get("function", "recall")  # Default to 'recall'
            module = importlib.import_module(module_path)
            agent_function = getattr(module, function_name)

            # Call the agent's function
            result = agent_function(query)
            return f"[{agent_name.capitalize()}]\n{result}"

    if any(keyword in query.lower() for keyword in ["summarize", "summary", "what's this about"]):
        log_route("summarize_agent", query)
        # Temporary placeholder path — you can replace it with dynamic filepath logic later
        result = summarize("memory/working_memory/working_today/working_log.md")
        return f"[SummarizeAgent]\n{result}"

    if any(keyword in query.lower() for keyword in ["decay", "archive", "promote memory", "clean up"]):
        log_route("decay_agent", query)
        result = run_decay()
        return f"[DecayAgent]\n{result}"

    return "No matching agent found for the query."

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python memory_agent_router.py \"search phrase\"")
        sys.exit(1)

    query = sys.argv[1]
    output = route(query)
    print(output)

---
**Last Auto-Updated:** 2025-07-30 23:14:34


## Autonomous Improvements

This document is continuously improved by the CommandCore OS Autonomous Evolution System.

### Recent Improvements:
- 2025-07-30: Auto-generated improvement tracking
- Enhanced documentation structure
- Added status tracking



**Last Updated:** 2025-07-30 23:16:05
