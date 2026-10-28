import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime

class SessionStateManager:
    """Thread-safe session state and agent event pub/sub manager."""
    
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._event_queues: Dict[str, List[asyncio.Queue]] = {}
        self._lock = asyncio.Lock()

    def get_session(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self._sessions:
            self._sessions[session_id] = {
                "session_id": session_id,
                "created_at": datetime.utcnow().isoformat(),
                "resume_data": None,
                "target_job": None,
                "analysis_results": None,
                "matched_jobs": [],
                "cover_letters": [],
                "interview_session": None,
                "agent_events": []
            }
        return self._sessions[session_id]

    def update_session(self, session_id: str, key: str, value: Any) -> None:
        session = self.get_session(session_id)
        session[key] = value

    async def broadcast_event(self, session_id: str, event_type: str, message: str, data: Optional[Dict[str, Any]] = None):
        """Record event and push to active SSE listeners."""
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "event_type": event_type,
            "message": message,
            "data": data or {}
        }
        
        session = self.get_session(session_id)
        session["agent_events"].append(event)
        
        # Broadcast to subscribed queues
        if session_id in self._event_queues:
            for queue in self._event_queues[session_id]:
                await queue.put(event)

    def subscribe(self, session_id: str) -> asyncio.Queue:
        """Subscribe an SSE client to session events."""
        if session_id not in self._event_queues:
            self._event_queues[session_id] = []
        queue = asyncio.Queue()
        self._event_queues[session_id].append(queue)
        return queue

    def unsubscribe(self, session_id: str, queue: asyncio.Queue):
        """Unsubscribe an SSE client."""
        if session_id in self._event_queues and queue in self._event_queues[session_id]:
            self._event_queues[session_id].remove(queue)

session_manager = SessionStateManager()
