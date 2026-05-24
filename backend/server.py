from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import uuid
import base64
import resend
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend setup
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Auth Helpers ---
async def get_current_user(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return user_doc

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# --- Auth Endpoints ---
@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    try:
        resp = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        data = resp.json()
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

    email = data.get("email")
    name = data.get("name")
    picture = data.get("picture", "")
    session_token = data.get("session_token", str(uuid.uuid4()))

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc)
        })

    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })

    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none",
        path="/", max_age=7*24*60*60
    )
    return {"user_id": user_id, "email": email, "name": name, "picture": picture}

@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}

# --- Content Endpoints (editable portfolio sections) ---
@api_router.get("/content/{section}")
async def get_content(section: str):
    doc = await db.portfolio_content.find_one({"section": section}, {"_id": 0})
    if not doc:
        defaults = get_default_content(section)
        return defaults
    return doc

@api_router.put("/content/{section}")
async def update_content(section: str, request: Request, user=Depends(get_current_user)):
    body = await request.json()
    body["section"] = section
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.portfolio_content.update_one(
        {"section": section}, {"$set": body}, upsert=True
    )
    return {"status": "updated"}

def get_default_content(section):
    defaults = {
        "hero": {
            "section": "hero",
            "name": "ROHITH PULI",
            "title": "MOTION GRAPHIC DESIGNER",
            "subtitle": "Crafting visual stories through motion & design",
            "profile_image": "https://images.pexels.com/photos/8242769/pexels-photo-8242769.jpeg"
        },
        "about": {
            "section": "about",
            "bio": "I'm Rohith Puli, a Motion Graphic Designer passionate about bringing ideas to life through captivating visual storytelling. With expertise in animation, video editing, and visual effects, I create compelling content that engages and inspires.",
            "tools": ["After Effects", "Premiere Pro", "Cinema 4D", "Blender", "Photoshop", "Illustrator", "Figma", "DaVinci Resolve"],
            "skills": [
                {"name": "Motion Graphics", "level": 95},
                {"name": "Video Editing", "level": 90},
                {"name": "3D Animation", "level": 85},
                {"name": "Visual Effects", "level": 88},
                {"name": "UI Animation", "level": 82},
                {"name": "Color Grading", "level": 87}
            ],
            "experience": [
                {"role": "Senior Motion Designer", "company": "Creative Studio", "period": "2022 - Present", "description": "Leading motion design projects for major brands"},
                {"role": "Motion Graphic Designer", "company": "Digital Agency", "period": "2020 - 2022", "description": "Created animations and visual content for diverse clients"},
                {"role": "Junior Designer", "company": "Media House", "period": "2018 - 2020", "description": "Started career creating social media animations"}
            ]
        },
        "resume": {
            "section": "resume",
            "education": [
                {"degree": "Bachelor of Fine Arts", "school": "Design University", "year": "2018", "description": "Specialized in Digital Media & Animation"}
            ],
            "certifications": ["Adobe Certified Expert", "Cinema 4D Professional", "Google UX Design Certificate"],
            "resume_url": ""
        },
        "wheel": {
            "section": "wheel",
            "segments": [
                {"label": "10% OFF", "color": "#CCFF00"},
                {"label": "15% OFF", "color": "#23232C"},
                {"label": "5% OFF", "color": "#CCFF00"},
                {"label": "20% OFF", "color": "#23232C"},
                {"label": "FREE CONSULT", "color": "#CCFF00"},
                {"label": "25% OFF", "color": "#23232C"},
                {"label": "LUCKY DIP", "color": "#CCFF00"},
                {"label": "30% OFF", "color": "#23232C"}
            ]
        },
        "contact": {
            "section": "contact",
            "email": "rohith@example.com",
            "phone": "+1 234 567 890",
            "location": "New York, USA",
            "socials": {
                "instagram": "https://instagram.com/rohithpuli",
                "behance": "https://behance.net/rohithpuli",
                "dribbble": "https://dribbble.com/rohithpuli",
                "linkedin": "https://linkedin.com/in/rohithpuli",
                "youtube": "https://youtube.com/@rohithpuli"
            }
        }
    }
    return defaults.get(section, {"section": section})

# --- Projects CRUD ---
@api_router.get("/projects")
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    if not projects:
        return [
            {"project_id": "p1", "title": "Brand Identity Motion", "description": "Dynamic logo animations for tech startup", "image": "https://static.prod-images.emergentagent.com/jobs/f74c8429-af4c-4f76-9bdb-65d785ad9650/images/af4ae5325f206aa077ae031385f35d8abefef2541619fff1bac263d1812f9a29.png", "tags": ["Motion", "Branding"], "link": "#", "video_url": ""},
            {"project_id": "p2", "title": "Neon Abstract Loop", "description": "Seamless neon motion loop for event visuals", "image": "https://images.pexels.com/photos/18337643/pexels-photo-18337643.jpeg", "tags": ["VFX", "Loop"], "link": "#", "video_url": ""},
            {"project_id": "p3", "title": "3D Typography Reel", "description": "Kinetic typography showcase with 3D elements", "image": "https://images.unsplash.com/photo-1597418895783-f7de85be2839", "tags": ["3D", "Typography"], "link": "#", "video_url": ""},
            {"project_id": "p4", "title": "Product Visualization", "description": "Photorealistic 3D product renders and animations", "image": "https://images.unsplash.com/photo-1651611243377-2c15b94ad613", "tags": ["3D", "Product"], "link": "#", "video_url": ""},
            {"project_id": "p5", "title": "Event Visuals Pack", "description": "Complete visual identity for music festival", "image": "https://images.pexels.com/photos/18069238/pexels-photo-18069238.png", "tags": ["Event", "Design"], "link": "#", "video_url": ""}
        ]
    return projects

@api_router.post("/projects")
async def create_project(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    body["project_id"] = f"p_{uuid.uuid4().hex[:8]}"
    body["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.projects.insert_one(body)
    return {"status": "created", "project_id": body["project_id"]}

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, request: Request, user=Depends(get_current_user)):
    body = await request.json()
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one({"project_id": project_id}, {"$set": body})
    return {"status": "updated"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user)):
    await db.projects.delete_one({"project_id": project_id})
    return {"status": "deleted"}

# --- Gallery CRUD ---
@api_router.get("/gallery")
async def get_gallery():
    items = await db.gallery.find({}, {"_id": 0}).to_list(100)
    if not items:
        return [
            {"item_id": "g1", "title": "Neon Dreams", "type": "image", "url": "https://static.prod-images.emergentagent.com/jobs/f74c8429-af4c-4f76-9bdb-65d785ad9650/images/af4ae5325f206aa077ae031385f35d8abefef2541619fff1bac263d1812f9a29.png", "thumbnail": ""},
            {"item_id": "g2", "title": "Abstract Flow", "type": "image", "url": "https://images.pexels.com/photos/18337643/pexels-photo-18337643.jpeg", "thumbnail": ""},
            {"item_id": "g3", "title": "Motion Typography", "type": "image", "url": "https://images.unsplash.com/photo-1597418895783-f7de85be2839", "thumbnail": ""},
            {"item_id": "g4", "title": "3D Render", "type": "image", "url": "https://images.unsplash.com/photo-1651611243377-2c15b94ad613", "thumbnail": ""},
            {"item_id": "g5", "title": "Geometric Neon", "type": "image", "url": "https://images.pexels.com/photos/18069238/pexels-photo-18069238.png", "thumbnail": ""},
            {"item_id": "g6", "title": "Paper Texture", "type": "image", "url": "https://static.prod-images.emergentagent.com/jobs/f74c8429-af4c-4f76-9bdb-65d785ad9650/images/f49cc2295031c919d93c6568de25f0782c9f1e187b4c9714c8cf11162750c691.png", "thumbnail": ""}
        ]
    return items

@api_router.post("/gallery")
async def add_gallery_item(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    body["item_id"] = f"g_{uuid.uuid4().hex[:8]}"
    body["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.gallery.insert_one(body)
    return {"status": "created", "item_id": body["item_id"]}

@api_router.delete("/gallery/{item_id}")
async def delete_gallery_item(item_id: str, user=Depends(get_current_user)):
    await db.gallery.delete_one({"item_id": item_id})
    return {"status": "deleted"}

# --- Contact Form ---
@api_router.post("/contact")
async def send_contact(request: Request):
    body = await request.json()
    name = body.get("name", "")
    email = body.get("email", "")
    message = body.get("message", "")
    if not name or not email or not message:
        raise HTTPException(status_code=400, detail="All fields required")

    # Store in DB
    contact_doc = {
        "contact_id": f"c_{uuid.uuid4().hex[:8]}",
        "name": name,
        "email": email,
        "message": message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contacts.insert_one(contact_doc)

    # Send email via Resend
    try:
        html_content = f"""
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#CCFF00;background:#0B0B0D;padding:20px;margin:0;">New Portfolio Contact</h2>
            <div style="background:#17171C;color:#FAFAFA;padding:20px;">
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Message:</strong></p>
                <p>{message}</p>
            </div>
        </div>
        """
        # Get portfolio owner email from contact settings
        owner_contact = await db.portfolio_content.find_one({"section": "contact"}, {"_id": 0})
        owner_email = owner_contact.get("email", email) if owner_contact else email
        params = {
            "from": SENDER_EMAIL,
            "to": [owner_email],
            "subject": f"Portfolio Contact from {name}",
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logger.error(f"Email send failed: {e}")

    return {"status": "sent", "message": "Your message has been received!"}

# --- Lucky Wheel Spin ---
@api_router.post("/wheel/spin")
async def spin_wheel():
    import random
    content = await db.portfolio_content.find_one({"section": "wheel"}, {"_id": 0})
    if not content:
        content = get_default_content("wheel")
    segments = content.get("segments", [])
    if not segments:
        raise HTTPException(status_code=400, detail="No wheel segments configured")
    winner = random.choice(segments)
    spin_doc = {
        "spin_id": f"s_{uuid.uuid4().hex[:8]}",
        "result": winner["label"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.spins.insert_one(spin_doc)
    return {"result": winner["label"], "index": segments.index(winner)}

# --- File Upload (base64) ---
@api_router.post("/upload")
async def upload_file(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    file_data = body.get("file_data", "")
    file_name = body.get("file_name", "uploaded_file")
    file_type = body.get("file_type", "image")

    if not file_data:
        raise HTTPException(status_code=400, detail="No file data provided")

    file_doc = {
        "file_id": f"f_{uuid.uuid4().hex[:8]}",
        "file_name": file_name,
        "file_type": file_type,
        "data": file_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.uploads.insert_one(file_doc)
    return {"file_id": file_doc["file_id"], "url": f"/api/files/{file_doc['file_id']}"}

@api_router.get("/files/{file_id}")
async def get_file(file_id: str):
    doc = await db.uploads.find_one({"file_id": file_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    data = doc["data"]
    if "base64," in data:
        data = data.split("base64,")[1]
    import io
    from starlette.responses import StreamingResponse
    binary = base64.b64decode(data)
    content_type = "image/jpeg"
    if doc.get("file_type") == "video":
        content_type = "video/mp4"
    elif "png" in doc.get("file_name", ""):
        content_type = "image/png"
    return StreamingResponse(io.BytesIO(binary), media_type=content_type)

# --- Contacts list for admin ---
@api_router.get("/contacts")
async def get_contacts(user=Depends(get_current_user)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return contacts

# Include router & middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
