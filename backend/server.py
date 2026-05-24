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

# --- Rate Limiting ---
rate_limit_store = {}  # {ip: {endpoint: [timestamps]}}

def check_rate_limit(request: Request, endpoint: str, max_requests: int = 5, window_seconds: int = 60):
    now = datetime.now(timezone.utc)
    ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown").split(",")[0].strip()
    key = f"{ip}:{endpoint}"
    if key not in rate_limit_store:
        rate_limit_store[key] = []
    rate_limit_store[key] = [t for t in rate_limit_store[key] if (now - t).total_seconds() < window_seconds]
    if len(rate_limit_store[key]) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    rate_limit_store[key].append(now)

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
            "profile_image": "https://images.pexels.com/photos/8242769/pexels-photo-8242769.jpeg",
            "cta_primary": "VIEW WORK",
            "cta_secondary": "GET IN TOUCH",
            "badge_text": "AVAILABLE FOR HIRE",
            "marquee_text": "MOTION GRAPHIC DESIGNER \u2022 VISUAL STORYTELLER \u2022 CREATIVE DIRECTOR"
        },
        "about": {
            "section": "about",
            "heading": "About",
            "heading_accent": "Me",
            "bio": "I'm Rohith Puli, a Motion Graphic Designer passionate about bringing ideas to life through captivating visual storytelling. With expertise in animation, video editing, and visual effects, I create compelling content that engages and inspires.",
            "years_exp": "5+",
            "projects_count": "50+",
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
        "projects": {
            "section": "projects",
            "heading": "Projects",
            "label": "SELECTED WORK"
        },
        "gallery": {
            "section": "gallery",
            "heading": "Visual",
            "heading_accent": "Archive",
            "label": "GALLERY"
        },
        "resume": {
            "section": "resume",
            "heading": "My",
            "heading_accent": "Resume",
            "education": [
                {"degree": "Bachelor of Fine Arts", "school": "Design University", "year": "2018", "description": "Specialized in Digital Media & Animation"}
            ],
            "certifications": ["Adobe Certified Expert", "Cinema 4D Professional", "Google UX Design Certificate"],
            "resume_url": ""
        },
        "wheel": {
            "section": "wheel",
            "heading": "Lucky",
            "heading_accent": "Wheel",
            "subtitle": "Feeling lucky? Spin the wheel to win exclusive discounts on my design services!",
            "segments": [
                {"label": "10% OFF", "color": "#4A7A12"},
                {"label": "15% OFF", "color": "#E8E0D0"},
                {"label": "5% OFF", "color": "#4A7A12"},
                {"label": "20% OFF", "color": "#E8E0D0"},
                {"label": "FREE CONSULT", "color": "#4A7A12"},
                {"label": "25% OFF", "color": "#E8E0D0"},
                {"label": "LUCKY DIP", "color": "#4A7A12"},
                {"label": "30% OFF", "color": "#E8E0D0"}
            ]
        },
        "contact": {
            "section": "contact",
            "heading": "Get In",
            "heading_accent": "Touch",
            "subtitle": "Have a project in mind? Let's create something amazing together. Drop me a message and I'll get back to you soon.",
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
        },
        "feedback": {
            "section": "feedback",
            "heading": "Client",
            "heading_accent": "Reviews",
            "cta_text": "WRITE A REVIEW"
        },
        "footer": {
            "section": "footer",
            "tagline": "Motion Graphic Designer",
            "copyright": "Made with love by Rohith Puli"
        }
    }
    return defaults.get(section, {"section": section})

# --- Projects CRUD ---
DEFAULT_PROJECTS = [
    {"project_id": "p1", "title": "Brand Identity Motion", "description": "Dynamic logo animations for tech startup", "image": "https://static.prod-images.emergentagent.com/jobs/f74c8429-af4c-4f76-9bdb-65d785ad9650/images/af4ae5325f206aa077ae031385f35d8abefef2541619fff1bac263d1812f9a29.png", "tags": ["Motion", "Branding"], "link": "#", "video_url": "", "detail_text": "A comprehensive brand identity motion package created for a leading tech startup. The project involved designing dynamic logo animations, kinetic typography sequences, and branded motion templates for social media and presentations.", "detail_images": ["https://static.prod-images.emergentagent.com/jobs/f74c8429-af4c-4f76-9bdb-65d785ad9650/images/af4ae5325f206aa077ae031385f35d8abefef2541619fff1bac263d1812f9a29.png"]},
    {"project_id": "p2", "title": "Neon Abstract Loop", "description": "Seamless neon motion loop for event visuals", "image": "https://images.pexels.com/photos/18337643/pexels-photo-18337643.jpeg", "tags": ["VFX", "Loop"], "link": "#", "video_url": "", "detail_text": "Created a mesmerizing seamless neon motion loop designed for live event visuals. The animation features flowing abstract shapes with vibrant neon color palettes, optimized for large-scale LED displays and projection mapping.", "detail_images": ["https://images.pexels.com/photos/18337643/pexels-photo-18337643.jpeg"]},
    {"project_id": "p3", "title": "3D Typography Reel", "description": "Kinetic typography showcase with 3D elements", "image": "https://images.unsplash.com/photo-1597418895783-f7de85be2839", "tags": ["3D", "Typography"], "link": "#", "video_url": "", "detail_text": "A showcase reel featuring kinetic typography combined with 3D elements. Each sequence demonstrates different animation techniques — from extruded letterforms to particle-based text reveals.", "detail_images": ["https://images.unsplash.com/photo-1597418895783-f7de85be2839"]},
    {"project_id": "p4", "title": "Product Visualization", "description": "Photorealistic 3D product renders and animations", "image": "https://images.unsplash.com/photo-1651611243377-2c15b94ad613", "tags": ["3D", "Product"], "link": "#", "video_url": "", "detail_text": "Photorealistic 3D product renders and turntable animations created for an e-commerce brand. The project included studio lighting setups, material creation, and smooth camera animations.", "detail_images": ["https://images.unsplash.com/photo-1651611243377-2c15b94ad613"]},
    {"project_id": "p5", "title": "Event Visuals Pack", "description": "Complete visual identity for music festival", "image": "https://images.pexels.com/photos/18069238/pexels-photo-18069238.png", "tags": ["Event", "Design"], "link": "#", "video_url": "", "detail_text": "Complete visual identity package for a music festival including stage visuals, countdown sequences, artist intro animations, and social media motion templates.", "detail_images": ["https://images.pexels.com/photos/18069238/pexels-photo-18069238.png"]}
]

@api_router.get("/projects")
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    if not projects:
        # Seed defaults into DB so they become editable
        for p in DEFAULT_PROJECTS:
            await db.projects.update_one({"project_id": p["project_id"]}, {"$set": p}, upsert=True)
        projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    return projects

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await db.projects.find_one({"project_id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

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
    body["project_id"] = project_id
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one({"project_id": project_id}, {"$set": body}, upsert=True)
    return {"status": "updated"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user)):
    await db.projects.delete_one({"project_id": project_id})
    return {"status": "deleted"}

# --- Gallery CRUD ---
DEFAULT_GALLERY = [
    {"item_id": "g1", "title": "Neon Dreams", "type": "image", "url": "https://static.prod-images.emergentagent.com/jobs/f74c8429-af4c-4f76-9bdb-65d785ad9650/images/af4ae5325f206aa077ae031385f35d8abefef2541619fff1bac263d1812f9a29.png", "thumbnail": ""},
    {"item_id": "g2", "title": "Abstract Flow", "type": "image", "url": "https://images.pexels.com/photos/18337643/pexels-photo-18337643.jpeg", "thumbnail": ""},
    {"item_id": "g3", "title": "Motion Typography", "type": "image", "url": "https://images.unsplash.com/photo-1597418895783-f7de85be2839", "thumbnail": ""},
    {"item_id": "g4", "title": "3D Render", "type": "image", "url": "https://images.unsplash.com/photo-1651611243377-2c15b94ad613", "thumbnail": ""},
    {"item_id": "g5", "title": "Geometric Neon", "type": "image", "url": "https://images.pexels.com/photos/18069238/pexels-photo-18069238.png", "thumbnail": ""},
    {"item_id": "g6", "title": "Paper Texture", "type": "image", "url": "https://static.prod-images.emergentagent.com/jobs/f74c8429-af4c-4f76-9bdb-65d785ad9650/images/f49cc2295031c919d93c6568de25f0782c9f1e187b4c9714c8cf11162750c691.png", "thumbnail": ""}
]

@api_router.get("/gallery")
async def get_gallery():
    items = await db.gallery.find({}, {"_id": 0}).to_list(100)
    if not items:
        for g in DEFAULT_GALLERY:
            await db.gallery.update_one({"item_id": g["item_id"]}, {"$set": g}, upsert=True)
        items = await db.gallery.find({}, {"_id": 0}).to_list(100)
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
    check_rate_limit(request, "contact", max_requests=5, window_seconds=300)
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
async def spin_wheel(request: Request):
    check_rate_limit(request, "wheel_spin", max_requests=10, window_seconds=60)
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

# --- File Upload (disk-based for full quality) ---
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@api_router.post("/upload")
async def upload_file(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    file_data = body.get("file_data", "")
    file_name = body.get("file_name", "uploaded_file")
    file_type = body.get("file_type", "image")

    if not file_data:
        raise HTTPException(status_code=400, detail="No file data provided")

    # Extract binary from base64 data URL
    raw_b64 = file_data
    if "base64," in raw_b64:
        raw_b64 = raw_b64.split("base64,")[1]
    binary = base64.b64decode(raw_b64)

    # Detect extension from original filename or mime
    ext = Path(file_name).suffix.lower() or ".bin"
    file_id = f"f_{uuid.uuid4().hex[:12]}"
    stored_name = f"{file_id}{ext}"
    file_path = UPLOAD_DIR / stored_name

    # Write to disk at full quality
    with open(file_path, "wb") as f:
        f.write(binary)

    # Store metadata in DB (no binary data)
    file_doc = {
        "file_id": file_id,
        "file_name": file_name,
        "stored_name": stored_name,
        "file_type": file_type,
        "extension": ext,
        "size_bytes": len(binary),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.uploads.insert_one(file_doc)
    return {"file_id": file_id, "url": f"/api/files/{file_id}"}

@api_router.get("/files/{file_id}")
async def get_file(file_id: str):
    doc = await db.uploads.find_one({"file_id": file_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")

    # Check if file is on disk (new method)
    stored_name = doc.get("stored_name")
    if stored_name:
        file_path = UPLOAD_DIR / stored_name
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File missing from storage")
        import mimetypes
        from starlette.responses import FileResponse
        mime = mimetypes.guess_type(stored_name)[0] or "application/octet-stream"
        headers = {"Cache-Control": "public, max-age=31536000"}
        if mime == "application/pdf":
            headers["Content-Disposition"] = f'attachment; filename="{doc.get("file_name", "file.pdf")}"'
        return FileResponse(file_path, media_type=mime, headers=headers)

    # Legacy: base64 in DB (old uploads)
    data = doc.get("data", "")
    if "base64," in data:
        data = data.split("base64,")[1]
    import io
    from starlette.responses import StreamingResponse
    binary = base64.b64decode(data)
    content_type = "image/jpeg"
    if doc.get("file_type") == "video":
        content_type = "video/mp4"
    elif doc.get("file_type") == "pdf" or doc.get("file_name", "").endswith(".pdf"):
        content_type = "application/pdf"
    elif "png" in doc.get("file_name", ""):
        content_type = "image/png"
    elif "webp" in doc.get("file_name", ""):
        content_type = "image/webp"
    headers = {}
    if content_type == "application/pdf":
        headers["Content-Disposition"] = f'attachment; filename="{doc.get("file_name", "resume.pdf")}"'
    return StreamingResponse(io.BytesIO(binary), media_type=content_type, headers=headers)

# --- Contacts list for admin ---
@api_router.get("/contacts")
async def get_contacts(user=Depends(get_current_user)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return contacts

# --- Feedback / Ratings ---
@api_router.get("/feedback")
async def get_feedback():
    feedback = await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return feedback

@api_router.post("/feedback")
async def add_feedback(request: Request):
    check_rate_limit(request, "feedback", max_requests=3, window_seconds=300)
    body = await request.json()
    name = body.get("name", "").strip()
    rating = body.get("rating", 0)
    comment = body.get("comment", "").strip()
    company = body.get("company", "").strip()
    if not name or not comment or not rating:
        raise HTTPException(status_code=400, detail="Name, rating and comment are required")
    if not (1 <= rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    feedback_doc = {
        "feedback_id": f"fb_{uuid.uuid4().hex[:8]}",
        "name": name,
        "company": company,
        "rating": rating,
        "comment": comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.feedback.insert_one(feedback_doc)
    return {"status": "created", "feedback_id": feedback_doc["feedback_id"]}

@api_router.delete("/feedback/{feedback_id}")
async def delete_feedback(feedback_id: str, user=Depends(get_current_user)):
    await db.feedback.delete_one({"feedback_id": feedback_id})
    return {"status": "deleted"}

# --- Resume Upload ---
@api_router.post("/resume/upload")
async def upload_resume(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    file_data = body.get("file_data", "")
    file_name = body.get("file_name", "resume.pdf")
    if not file_data:
        raise HTTPException(status_code=400, detail="No file data")
    # Write to disk
    raw_b64 = file_data
    if "base64," in raw_b64:
        raw_b64 = raw_b64.split("base64,")[1]
    binary = base64.b64decode(raw_b64)
    ext = Path(file_name).suffix.lower() or ".pdf"
    stored_name = f"resume_latest{ext}"
    file_path = UPLOAD_DIR / stored_name
    with open(file_path, "wb") as f:
        f.write(binary)
    # Store metadata
    resume_doc = {
        "file_id": "resume_latest",
        "file_name": file_name,
        "stored_name": stored_name,
        "file_type": "pdf",
        "extension": ext,
        "size_bytes": len(binary),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.uploads.update_one({"file_id": "resume_latest"}, {"$set": resume_doc}, upsert=True)
    resume_url = f"/api/files/resume_latest"
    await db.portfolio_content.update_one(
        {"section": "resume"},
        {"$set": {"resume_url": resume_url}},
        upsert=True
    )
    return {"status": "uploaded", "url": resume_url}

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
