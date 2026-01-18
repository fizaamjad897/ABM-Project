# Project Report: Agent-Based Distributed Cache Simulator

## 1. Executive Summary
This project is an **Agent-Based Model (ABM)** that simulates a distributed caching architecture (like Redis or Memcached) sitting in front of a database.

Unlike traditional static simulations, this project acts like a "living lab" where independent agents (Clients, Cache Nodes, Database) make decisions in real-time. It visualizes emergent behaviors—like **thundering herds** or **cascading failures**—that occur in complex distributed systems.

## 2. What is Happening in the Simulation?
When you click **"Execute Model"**, the following invisible chain reaction occurs:

1.  **The Client Agent** wakes up and decides to read a piece of data (e.g., "User Profile 123").
2.  **The Load Balancer** receives this request and routes it to one of the **Cache Nodes** (e.g., `node_2`).
3.  **The Cache Node** checks its local memory (LRU Cache):
    *   **HIT (Green)**: The data is there! It returns immediately. This is fast and cheap.
    *   **MISS (Red)**: The data is missing. The node must fetch it from the **Database**.
4.  **The Database** is the ultimate source of truth. It returns the data to the Cache Node.
5.  **The Network** simulates delay. Every message takes time to travel. Sometimes, the **Chaos Monkey** agent cuts a wire or crashes a node.
6.  **The Observer** watches everything from above, calculating the **Hit Ratio** (how efficient the cache is) and sending these stats to your screen.

## 3. Architecture Detailed Analysis
For a deep dive into the code structure and files, please refer to the generated technical documents:

*   **[Backend Analysis](backend_structure.md)**: Explains the Python simulation engine, agents, and API.
*   **[Frontend Analysis](frontend_structure.md)**: Explains the Next.js dashboard, visualization logic, and WebSocket handling.

## 4. How to Run the Project

### Prerequisites
*   **Python 3.8+** (for the backend)
*   **Node.js 18+** (for the frontend)
*   (Optional) An OpenAI/Google API key if you want to use the AI Analyst feature.

### Step 1: Start the Backend (The Engine)
1.  Open a terminal in the project root `d:\abm\ABM-Project`.
2.  Navigate to the backend:
    ```bash
    cd backend
    ```
3.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Start the server:
    ```bash
    python src/main.py
    ```
    *You should see: `Uvicorn running on http://0.0.0.0:8000`*

### Step 2: Start the Frontend (The Dashboard)
1.  Open a **new** terminal window.
2.  Navigate to the frontend:
    ```bash
    cd frontend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    *You should see: `Ready in 2.3s`*

### Step 3: Run the Simulation
1.  Open your browser to `http://localhost:3000`.
2.  You will see the "CacheNet" dashboard.
3.  The status indicator in the top right should say **"System Online"** (green). If it is red, check your backend terminal.
4.  Adjust thesliders (e.g., increase Nodes to 5).
5.  Click **"Execute Model"**.
6.  Watch the topology diagram come alive!

## 5. Troubleshooting
*   **"System Offline"**: Ensure the backend server is running on port 8000.
*   **"Module not found"**: Make sure you activated the virtual environment and ran `pip install` in the backend folder.
*   **Charts not updating**: Check the browser console (F12) for WebSocket errors.
