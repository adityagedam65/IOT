from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="CropConnect 3D API")
api_router = APIRouter(prefix="/api")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class SavedView(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    camera: Optional[Any] = None          # {position:[x,y,z], target:[x,y,z]}
    explodeFactor: float = 0.0
    selectedId: Optional[str] = None
    showConnections: bool = False
    showFlow: bool = False
    notes: Optional[str] = ""
    createdAt: str = Field(default_factory=now_iso)


class SavedViewCreate(BaseModel):
    name: str
    camera: Optional[Any] = None
    explodeFactor: float = 0.0
    selectedId: Optional[str] = None
    showConnections: bool = False
    showFlow: bool = False
    notes: Optional[str] = ""


class ComponentNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    componentId: str
    text: str
    createdAt: str = Field(default_factory=now_iso)


class ComponentNoteCreate(BaseModel):
    componentId: str
    text: str


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "CropConnect Smart Farming IoT — 3D API"}


@api_router.post("/views", response_model=SavedView)
async def create_view(payload: SavedViewCreate):
    view = SavedView(**payload.model_dump())
    await db.saved_views.insert_one(view.model_dump())
    return view


@api_router.get("/views", response_model=List[SavedView])
async def list_views():
    docs = await db.saved_views.find({}, {"_id": 0}).sort("createdAt", -1).to_list(200)
    return docs


@api_router.delete("/views/{view_id}")
async def delete_view(view_id: str):
    res = await db.saved_views.delete_one({"id": view_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="View not found")
    return {"deleted": view_id}


@api_router.post("/notes", response_model=ComponentNote)
async def create_note(payload: ComponentNoteCreate):
    note = ComponentNote(**payload.model_dump())
    await db.component_notes.insert_one(note.model_dump())
    return note


@api_router.get("/notes", response_model=List[ComponentNote])
async def list_notes(componentId: Optional[str] = None):
    query = {"componentId": componentId} if componentId else {}
    docs = await db.component_notes.find(query, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return docs


@api_router.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    res = await db.component_notes.delete_one({"id": note_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"deleted": note_id}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
