import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from backend.core.state import session_manager

router = APIRouter(prefix="/stream", tags=["Streaming"])

@router.get("/agent-events/{session_id}")
async def stream_agent_events(session_id: str):
    """Server-Sent Events (SSE) stream for real-time agent execution events."""
    queue = session_manager.subscribe(session_id)
    
    async def event_generator():
        try:
            # Emit initial connection handshake
            init_event = {
                "event_type": "connected",
                "message": f"Connected to Live Agent Activity Stream for session '{session_id}'",
                "session_id": session_id
            }
            yield f"data: {json.dumps(init_event)}\n\n"
            
            # Emit any past session events
            session = session_manager.get_session(session_id)
            for past_event in session.get("agent_events", []):
                yield f"data: {json.dumps(past_event)}\n\n"
                
            while True:
                # Wait for new broadcasted events
                event = await queue.get()
                yield f"data: {json.dumps(event)}\n\n"
        except asyncio.CancelledError:
            session_manager.unsubscribe(session_id, queue)
            
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/test-event/{session_id}")
async def emit_test_event(session_id: str, payload: dict):
    """Utility endpoint to inject a test agent event into the feed."""
    event_type = payload.get("event_type", "agent_info")
    message = payload.get("message", "Agent action simulated")
    data = payload.get("data", {})
    await session_manager.broadcast_event(session_id, event_type, message, data)
    return {"status": "broadcasted", "session_id": session_id}
