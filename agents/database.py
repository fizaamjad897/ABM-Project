from agents.base import BaseAgent
from messages.message import Message

class Database(BaseAgent):
    def __init__(self, agent_id, sim, network):
        super().__init__(agent_id, sim)
        self.network = network
        self.data = {}
        self.version_counter = 0
        self.service_nodes = []

    def handle_message(self, message):
        payload = message.payload
        if payload["type"] == "WRITE":
            key = payload["key"]
            value = payload["value"]
            self.version_counter += 1
            self.data[key] = (value, self.version_counter)
            # Send invalidate to all service nodes
            for node in self.service_nodes:
                invalidate_msg = Message(src=self, dst=node, payload={"type": "INVALIDATE", "key": key, "version": self.version_counter})
                self.network.send(invalidate_msg)
        elif payload["type"] == "READ_DB":
            key = payload["key"]
            if key in self.data:
                value, version = self.data[key]
                response = Message(src=self, dst=message.src, payload={"type": "READ_RESPONSE", "key": key, "value": value, "version": version})
                self.network.send(response)