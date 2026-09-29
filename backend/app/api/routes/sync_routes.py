from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.john_deere_api import JohnDeereAPIClient

router = APIRouter(prefix="/api/sync", tags=["Data Sync"])


@router.post("/trigger")
def trigger_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Trigger data sync from John Deere API"""
    client = JohnDeereAPIClient()
    
    def sync_task():
        try:
            result = client.sync_all_data(db)
            print(f"✅ Sync completed: {result}")
        except Exception as e:
            print(f"❌ Sync failed: {str(e)}")
    
    background_tasks.add_task(sync_task)
    return {"status": "sync_started", "message": "Data sync triggered in background"}
