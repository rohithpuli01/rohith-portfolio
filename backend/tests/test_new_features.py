"""Tests for new features: feedback, rate limiting, resume upload"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestFeedbackAPI:
    """Feedback CRUD tests"""

    def test_get_feedback(self):
        r = requests.get(f"{BASE_URL}/api/feedback")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"GET /api/feedback: {len(data)} items")

    def test_post_feedback_valid(self):
        payload = {"name": "TEST_Client", "rating": 5, "comment": "Great work!", "company": "Test Co"}
        r = requests.post(f"{BASE_URL}/api/feedback", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "created"
        assert "feedback_id" in data
        print(f"POST /api/feedback created: {data['feedback_id']}")

    def test_post_feedback_invalid_rating(self):
        payload = {"name": "Test", "rating": 6, "comment": "Too high"}
        r = requests.post(f"{BASE_URL}/api/feedback", json=payload)
        assert r.status_code in [400, 422]
        print(f"Invalid rating returns {r.status_code}")

    def test_post_feedback_missing_required(self):
        payload = {"name": "Test"}  # missing rating and comment
        r = requests.post(f"{BASE_URL}/api/feedback", json=payload)
        assert r.status_code in [400, 422]
        print(f"Missing fields returns {r.status_code}")

    def test_delete_feedback_requires_auth(self):
        r = requests.delete(f"{BASE_URL}/api/feedback/nonexistent_id")
        assert r.status_code in [401, 403]
        print(f"DELETE without auth returns {r.status_code}")

    def test_delete_feedback_with_auth(self):
        # First create a feedback
        payload = {"name": "TEST_ToDelete", "rating": 3, "comment": "Will delete", "company": ""}
        create_r = requests.post(f"{BASE_URL}/api/feedback", json=payload)
        if create_r.status_code != 200:
            pytest.skip("Could not create feedback to delete")
        fb_id = create_r.json()["feedback_id"]

        # Delete with auth
        headers = {"Cookie": "session_token=test_session_admin_fixed"}
        del_r = requests.delete(f"{BASE_URL}/api/feedback/{fb_id}", headers=headers)
        assert del_r.status_code in [200, 204]
        print(f"DELETE with auth: {del_r.status_code}")


class TestRateLimiting:
    """Rate limiting tests"""

    def test_contact_rate_limit(self):
        """POST /api/contact - 5 per 5 min"""
        payload = {"name": "RLTest", "email": "rl@test.com", "message": "rate limit test"}
        responses = []
        for i in range(7):
            r = requests.post(f"{BASE_URL}/api/contact", json=payload)
            responses.append(r.status_code)
        print(f"Contact rate limit responses: {responses}")
        assert 429 in responses, f"Expected 429 in {responses}"

    def test_feedback_rate_limit(self):
        """POST /api/feedback - 3 per 5 min"""
        payload = {"name": "RL_Test", "rating": 4, "comment": "rate limit test"}
        responses = []
        for i in range(5):
            r = requests.post(f"{BASE_URL}/api/feedback", json=payload)
            responses.append(r.status_code)
        print(f"Feedback rate limit responses: {responses}")
        assert 429 in responses, f"Expected 429 in {responses}"


class TestResumeUpload:
    """Resume upload tests"""

    def test_upload_requires_auth(self):
        payload = {"file_name": "test.pdf", "file_data": "dGVzdA=="}
        r = requests.post(f"{BASE_URL}/api/resume/upload", json=payload)
        assert r.status_code in [401, 403]
        print(f"Resume upload without auth: {r.status_code}")

    def test_upload_with_auth(self):
        import base64
        pdf_data = base64.b64encode(b"%PDF-1.4 test").decode()
        payload = {"file_name": "test_resume.pdf", "file_data": pdf_data}
        headers = {"Cookie": "session_token=test_session_admin_fixed"}
        r = requests.post(f"{BASE_URL}/api/resume/upload", json=payload, headers=headers)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "uploaded"
        assert "url" in data
        print(f"Resume upload success: {data}")
