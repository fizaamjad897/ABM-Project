import random
from engine.event import Event
import asyncio

class NetworkAgent:
    def __init__(self, sim, latency_fn, drop_prob=0.0):
        self.sim = sim
        self.latency_fn = latency_fn
        self.drop_prob = drop_prob

    def send(self, message):
        if random.random() < self.drop_prob:
            return

        delay = self.latency_fn()
        
        # Create async callback wrapper to properly handle async handle_message
        async def deliver_message():
            try:
                await message.dst.handle_message(message)
            except Exception as e:
                print(f"[Network] Error delivering message to {message.dst.agent_id}: {e}")
        
        event = Event(
            time=self.sim.time + delay,
            callback=deliver_message
        )
        self.sim.event_queue.push(event)