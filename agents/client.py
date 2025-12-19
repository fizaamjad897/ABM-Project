from agents.base import BaseAgent
from messages.message import Message

class Client(BaseAgent):
    def __init__(self, agent_id, sim, network, service_node):
        super().__init__(agent_id, sim)
        self.network = network
        self.service_node = service_node

    def send_read(self, key):
        message = Message(src=self, dst=self.service_node, payload={"type": "READ", "key": key})
        self.network.send(message)

    def handle_message(self, message):
        payload = message.payload
        if payload["type"] == "READ_RESPONSE":
            print(f"Client {self.agent_id} received: {payload['key']} = {payload['value']} (v{payload['version']}) at time {self.sim.time}")