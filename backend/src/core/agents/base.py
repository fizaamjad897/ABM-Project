class BaseAgent:
    def __init__(self, agent_id, sim):
        self.agent_id = agent_id
        self.sim = sim

    async def handle_message(self, message):
        raise NotImplementedError