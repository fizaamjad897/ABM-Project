from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import uuid
from typing import Dict, List, Any

import sys
import os
from dotenv import load_dotenv

# Load .env from backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Add core simulation path
sys.path.append(os.path.join(os.path.dirname(__file__), "core"))

from simulation_manager import SimulationManager
from ai_analyst import AIAnalyst
from pydantic import BaseModel

app = FastAPI(title="CacheNet AI Simulator API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()
sim_manager = SimulationManager(manager)
ai_analyst = AIAnalyst()

class SimConfig(BaseModel):
    nodes: int = 3
    cache_size: int = 100
    duration: int = 1000
    byzantine_nodes: int = 1
    chaos_enabled: bool = True

class ChatRequest(BaseModel):
    query: str
    metrics: Dict[str, Any]

@app.post("/simulate/start")
async def start_simulation(config: SimConfig):
    print(f"[API] Starting simulation with config: {config.dict()}")
    asyncio.create_task(sim_manager.run_simulation(config.dict()))
    return {"status": "started"}

@app.post("/simulate/stop")
async def stop_simulation():
    sim_manager.stop()
    return {"status": "stopped"}

@app.post("/ai/analyze")
async def analyze_traffic(req: ChatRequest):
    try:
        print(f"[API] Received chat request: {req.query}")
        print(f"[API] Metrics received: {req.metrics}")
        response = await ai_analyst.analyze_simulation(req.metrics, req.query)
        print(f"[API] Sending response: {response[:100]}...")
        return {"response": response}
    except Exception as e:
        print(f"[API] Error in analyze_traffic: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"response": f"AI Analyst currently offline: {str(e)}"}

@app.get("/")
async def root():
    return {"message": "CacheNet AI Simulator API is running"}

@app.websocket("/ws/simulation")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming commands from UI
            command = json.loads(data)
            print(f"[WS] Received command: {command}")
            
            if command.get("type") == "START_SIM":
                config = command.get("config", {})
                # Match pydantic field names if necessary (e.g., cacheSize -> cache_size)
                clean_config = {
                    "nodes": config.get("nodes", 3),
                    "cache_size": config.get("cacheSize", 100),
                    "duration": config.get("duration", 1000),
                    "chaos_enabled": config.get("chaos", True)
                }
                asyncio.create_task(sim_manager.run_simulation(clean_config))
            elif command.get("type") == "STOP_SIM":
                sim_manager.stop()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
