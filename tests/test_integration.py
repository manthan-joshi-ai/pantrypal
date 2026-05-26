import io
import json

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.models import (
    Ingredient,
    HealthProfile,
    RecommendRequest,
    RecommendResponse,
    Recipe,
    NutritionalInfo,
)

client = TestClient(app)


def test_health_check():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_recommend_missing_ingredients():
    payload = {"ingredients": [], "health_profile": {"chronic": [], "dietary": [], "lifestyle": [], "notes": ""}}
    r = client.post("/api/recommend", json=payload)
    assert r.status_code == 400


def test_recommend_success(monkeypatch):
    sample_recipe = {
        "name": "Test",
        "cuisine": "Test",
        "description": "desc",
        "health_benefits": ["a"],
        "why_good_for_you": "b",
        "prep_time": "10m",
        "cook_time": "10m",
        "difficulty": "Easy",
        "servings": 2,
        "ingredients_used": ["x"],
        "additional_ingredients": ["y"],
        "instructions": ["Step 1"],
        "nutritional_info": {"calories": "100 kcal"},
        "health_tags": ["tag"],
        "tips": "tip",
    }

    def fake_get_recommendations(req):
        return RecommendResponse(recipes=[Recipe(**sample_recipe)])

    monkeypatch.setattr("backend.main.get_recommendations", fake_get_recommendations)

    payload = {"ingredients": [{"id": "1", "name": "apple"}], "health_profile": {"chronic": [], "dietary": [], "lifestyle": [], "notes": ""}}
    r = client.post("/api/recommend", json=payload)
    assert r.status_code == 200
    assert r.json()["recipes"][0]["name"] == "Test"


def test_recommend_image_invalid_file():
    r = client.post(
        "/api/recommend/image",
        files={"image": ("test.txt", b"notimage", "text/plain")},
        data={"health_profile": "{}"},
    )
    assert r.status_code == 400


def test_recommend_image_success(monkeypatch):
    def fake_analyze_food_image(image_bytes):
        return ([Ingredient(id="1", name="tomato")], [])

    monkeypatch.setattr("backend.main.analyze_food_image", fake_analyze_food_image)

    def fake_get_recommendations(req):
        sample = {
            "name": "FromImage",
            "cuisine": "Test",
            "description": "desc",
            "health_benefits": ["a"],
            "why_good_for_you": "b",
            "prep_time": "10m",
            "cook_time": "10m",
            "difficulty": "Easy",
            "servings": 2,
            "ingredients_used": ["x"],
            "additional_ingredients": ["y"],
            "instructions": ["Step 1"],
            "nutritional_info": {"calories": "100 kcal"},
            "health_tags": ["tag"],
            "tips": "tip",
        }
        return RecommendResponse(recipes=[Recipe(**sample)])

    monkeypatch.setattr("backend.main.get_recommendations", fake_get_recommendations)

    file_bytes = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00")
    r = client.post(
        "/api/recommend/image",
        files={"image": ("image.png", file_bytes, "image/png")},
        data={"health_profile": "{}"},
    )
    assert r.status_code == 200
    assert r.json()["recipes"][0]["name"] == "FromImage"
