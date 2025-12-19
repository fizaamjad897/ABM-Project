from .event import EventQueue

class Simulation:
    def __init__(self):
        self.time = 0
        self.event_queue = EventQueue()
        self.agents = []

    def run(self, until_time):
        while not self.event_queue.empty():
            event = self.event_queue.pop()
            if event.time > until_time:
                break
            self.time = event.time
            event.callback()