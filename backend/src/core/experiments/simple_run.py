import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.simulation import Simulation
from core.event import Event
from agents.network import NetworkAgent
from agents.service_node import ServiceNode
from agents.client import Client
from agents.database import Database
from cache.lru_cache import LRUCache
from messages.message import Message

sim = Simulation()
network = NetworkAgent(sim, latency_fn=lambda: 5)

# Create agents
db = Database("db", sim, network)
cache = LRUCache(capacity=10)
service_node = ServiceNode("node1", sim, cache, network, db)
client = Client("client1", sim, network, service_node)

# Set service nodes for DB
db.service_nodes = [service_node]

# Schedule initial events
def write_to_db():
    message = Message(src=client, dst=db, payload={"type": "WRITE", "key": "test_key", "value": "test_value"})
    network.send(message)

event1 = Event(time=0, callback=write_to_db)
sim.event_queue.push(event1)

def read_from_client():
    client.send_read("test_key")

event2 = Event(time=10, callback=read_from_client)
sim.event_queue.push(event2)

sim.run(until_time=1000)