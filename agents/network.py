import random
from core.event import Event

class NetworkAgent:
    def __init__(self, sim, latency_fn, drop_prob=0.0):
        self.sim = sim
        self.latency_fn = latency_fn
        self.drop_prob = drop_prob

    def send(self, message):
        if random.random() < self.drop_prob:
            return

        delay = self.latency_fn()
        event = Event(
            time=self.sim.time + delay,
            callback=lambda: message.dst.handle_message(message)
        )
        self.sim.event_queue.push(event)