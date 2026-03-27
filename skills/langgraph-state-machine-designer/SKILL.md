---
name: LangGraph State Machine Designer
description: Converts a workflow description into a LangGraph node/edge graph with typed state, conditional routing, and human-in-the-loop checkpoints.
category: coding
tags:
  - langgraph
  - agents
  - state-machine
  - langchain
  - orchestration
author: simplyutils
---

# LangGraph State Machine Designer

## What this skill does

This skill takes a plain-language description of an agentic workflow and designs the corresponding LangGraph state machine: typed state schema, node functions, conditional edges, and checkpoint configuration. It handles the hard parts — state typing, routing logic, error recovery, and human-in-the-loop interrupts.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/langgraph-state-machine-designer/SKILL.md` in your project root.

Then ask:
- *"Use the LangGraph State Machine Designer to build a research-then-write workflow."*
- *"Design a LangGraph agent that routes between a SQL tool and a web search tool."*

Provide:
- What the agent should do (in plain English)
- What tools or actions it has available
- Whether humans need to approve any steps
- Your LangGraph version (v0.2+ assumed)

### Cursor / Codex

Describe the workflow and paste these instructions. Ask for the full graph code.

## The Prompt / Instructions for the Agent

When asked to design a LangGraph state machine, produce the following:

### Step 1 — Define the TypedDict state

Every LangGraph graph has a single shared state object. Define it as a TypedDict with `Annotated` fields for lists (so they append rather than overwrite):

```python
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    # Add task-specific fields:
    query: str
    search_results: list[str]
    draft: str
    approved: bool
    error: str | None
```

Rules for state design:
- Use `Annotated[list, operator.add]` for any field that accumulates over time (messages, results)
- Use plain types for fields that get overwritten each step (current_step, status)
- Add an `error` field to every state — nodes should write errors here instead of raising

### Step 2 — Design the nodes

Each node is a function that takes state and returns a partial state update:

```python
def call_model(state: AgentState) -> dict:
    """Main LLM reasoning node."""
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def run_tool(state: AgentState) -> dict:
    """Execute the tool the model requested."""
    last_message = state["messages"][-1]
    tool_result = execute_tool(last_message.tool_calls[0])
    return {"messages": [ToolMessage(content=tool_result)]}

def handle_error(state: AgentState) -> dict:
    """Graceful error recovery node."""
    return {"messages": [AIMessage(content="I encountered an error. Let me try a different approach.")], "error": None}
```

Node design rules:
- Nodes should do ONE thing (single responsibility)
- Always return a dict — never mutate state directly
- Catch exceptions inside nodes and write to `state["error"]`
- Keep nodes stateless — all context comes from state

### Step 3 — Design the edges and routing

```python
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

builder = StateGraph(AgentState)

# Add nodes
builder.add_node("agent", call_model)
builder.add_node("tools", ToolNode(tools))
builder.add_node("error_handler", handle_error)

# Set entry point
builder.set_entry_point("agent")

# Conditional routing
def should_continue(state: AgentState) -> str:
    last = state["messages"][-1]
    if state.get("error"):
        return "error_handler"
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return END

builder.add_conditional_edges("agent", should_continue, {
    "tools": "tools",
    "error_handler": "error_handler",
    END: END
})
builder.add_edge("tools", "agent")
builder.add_edge("error_handler", "agent")
```

### Step 4 — Add human-in-the-loop (if needed)

For workflows requiring human approval before destructive actions:

```python
from langgraph.checkpoint.memory import MemorySaver

# Compile with checkpointer
memory = MemorySaver()
graph = builder.compile(
    checkpointer=memory,
    interrupt_before=["execute_action"]  # pause before this node
)

# Run until interrupt
config = {"configurable": {"thread_id": "thread_001"}}
result = graph.invoke({"messages": [HumanMessage(content=user_query)]}, config)

# Resume after human approval
graph.invoke(None, config)  # continues from checkpoint
```

### Step 5 — Standard graph patterns

**Pattern: ReAct agent (reason → act → observe loop)**
```
entry → agent → [tools | END]
              ↑_______|
```

**Pattern: Multi-step pipeline (sequential)**
```
entry → step_1 → step_2 → step_3 → END
```

**Pattern: Supervisor with sub-agents**
```
entry → supervisor → [researcher | writer | reviewer | END]
                   ↑___________________________|
```

**Pattern: Retry with fallback**
```
entry → primary_agent → [success: END | failure: fallback_agent → END]
```

### Step 6 — Output the complete graph

Always produce:
1. Full `AgentState` TypedDict
2. All node functions with docstrings
3. Complete graph builder with edges
4. Compiled graph with appropriate checkpointer
5. Example invocation with config

## Example

**Input:**
> "Design a LangGraph agent that takes a user question, searches the web, then writes a summarized answer. No human approval needed."

**Output:**
```python
from typing import TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

class ResearchState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    query: str

def research_agent(state: ResearchState) -> dict:
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def should_continue(state: ResearchState) -> str:
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "search"
    return END

builder = StateGraph(ResearchState)
builder.add_node("agent", research_agent)
builder.add_node("search", ToolNode([web_search_tool]))
builder.set_entry_point("agent")
builder.add_conditional_edges("agent", should_continue, {"search": "search", END: END})
builder.add_edge("search", "agent")

graph = builder.compile()
```
