from agents.base import BaseAgent
import random

class ChaosMonkeyAgent(BaseAgent):
    """
    An agent that randomly 'kills' other agents to test system self-healing.
    """
    def __init__(self, agent_id, sim, targets, kill_prob=0.05):
        super().__init__(agent_id, sim)
        self.targets = targets
        self.kill_prob = kill_prob
        self.schedule_next_attack()

    def schedule_next_attack(self):
        # Schedule next attack at a random interval
        interval = random.uniform(50, 200)
        from engine.event import Event
        event = Event(time=self.sim.time + interval, callback=self.attack)
        self.sim.event_queue.push(event)

    def attack(self):
        # Use self.targets (not self.nodes)
        if self.targets and random.random() < self.kill_prob:
            target = random.choice(self.targets)
            target.active = False
            print(f"[ChaosMonkey] Killed node {target.agent_id}")
        
        self.schedule_next_attack()

    async def handle_message(self, message):
        pass
