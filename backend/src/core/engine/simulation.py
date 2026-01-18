from .event import EventQueue

class Simulation:
    def __init__(self):
        self.time = 0
        self.event_queue = EventQueue()
        self.agents = []
        self._event_count = 0

    async def run(self, until_time):
        # Process all events up to until_time
        events_processed = 0
        while not self.event_queue.empty():
            event = self.event_queue.pop()
            if event.time > until_time:
                self.event_queue.push(event) # Push back if it's for future
                break
            self.time = event.time
            try:
                # Execute event callback (supports both sync and async)
                result = event.callback()
                if hasattr(result, '__await__'):  # Check if it's a coroutine
                    await result
                events_processed += 1
                self._event_count += 1
            except Exception as e:
                print(f"[Simulation] Error executing event at time {self.time}: {e}")
                import traceback
                traceback.print_exc()
        
        # Log progress periodically
        if events_processed > 0 and self._event_count % 50 == 0:
            print(f"[Simulation Engine] Processed {events_processed} events this chunk, {self._event_count} total, time now {self.time:.2f}")
        
        # Ensure time advances to at least until_time even if no events
        if self.time < until_time:
            self.time = until_time