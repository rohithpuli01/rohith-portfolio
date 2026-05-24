"""Backend API tests for Rohith Puli Portfolio"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
SESSION_TOKEN = "test_session_admin_fixed"

@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

@pytest.fixture
def auth_client(client):
    client.headers.update({"Authorization": f"Bearer {SESSION_TOKEN}"})
    return client

# --- Public Content Endpoints ---
class TestContentEndpoints:
    """GET /api/content/{section}"""

    def test_hero_content(self, client):
        r = client.get(f"{BASE_URL}/api/content/hero")
        assert r.status_code == 200
        data = r.json()
        assert "name" in data
        assert data["name"] == "ROHITH PULI"
        print("PASS: hero content")

    def test_about_content(self, client):
        r = client.get(f"{BASE_URL}/api/content/about")
        assert r.status_code == 200
        data = r.json()
        assert "bio" in data
        assert "skills" in data
        assert "tools" in data
        print("PASS: about content")

    def test_resume_content(self, client):
        r = client.get(f"{BASE_URL}/api/content/resume")
        assert r.status_code == 200
        data = r.json()
        assert "education" in data
        print("PASS: resume content")

    def test_wheel_content(self, client):
        r = client.get(f"{BASE_URL}/api/content/wheel")
        assert r.status_code == 200
        data = r.json()
        assert "segments" in data
        assert len(data["segments"]) > 0
        print("PASS: wheel content")

    def test_contact_content(self, client):
        r = client.get(f"{BASE_URL}/api/content/contact")
        assert r.status_code == 200
        data = r.json()
        assert "email" in data
        print("PASS: contact content")

# --- Projects ---
class TestProjects:
    def test_get_projects(self, client):
        r = client.get(f"{BASE_URL}/api/projects")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: got {len(data)} projects")

# --- Gallery ---
class TestGallery:
    def test_get_gallery(self, client):
        r = client.get(f"{BASE_URL}/api/gallery")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"PASS: got {len(data)} gallery items")

# --- Wheel Spin ---
class TestWheelSpin:
    def test_spin_wheel(self, client):
        r = client.post(f"{BASE_URL}/api/wheel/spin")
        assert r.status_code == 200
        data = r.json()
        assert "result" in data
        assert "index" in data
        print(f"PASS: wheel spin result: {data['result']}")

# --- Contact Form ---
class TestContact:
    def test_contact_submit(self, client):
        payload = {"name": "TEST_User", "email": "test@example.com", "message": "TEST message from pytest"}
        r = client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "sent"
        print("PASS: contact form submitted")

    def test_contact_missing_fields(self, client):
        r = client.post(f"{BASE_URL}/api/contact", json={"name": "Only Name"})
        assert r.status_code == 400
        print("PASS: contact validation working")

# --- Auth ---
class TestAuth:
    def test_auth_me_with_session(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert "email" in data
        print(f"PASS: auth/me: {data['email']}")

    def test_auth_me_no_session(self, client):
        r = client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401
        print("PASS: 401 without auth")

    def test_get_contacts_auth(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/contacts")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print("PASS: contacts list retrieved")

    def test_content_update_requires_auth(self, client):
        r = client.put(f"{BASE_URL}/api/content/hero", json={"name": "ROHITH PULI"})
        assert r.status_code == 401
        print("PASS: update requires auth")
