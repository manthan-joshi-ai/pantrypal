import json
import re
import os
import requests
from models import RecommendRequest, RecommendResponse, Recipe, NutritionalInfo

OLLAMA_URL = "http://host.docker.internal:11434/api/generate"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:mini")


def _build_prompt(req: RecommendRequest) -> str:
    ingredients = ", ".join(
        f"{i.name}{' (' + i.quantity + ' ' + i.unit + ')' if i.quantity else ''}"
        for i in req.ingredients
    )

    health_parts = []
    if req.health_profile.chronic:
        health_parts.append(f"Conditions: {', '.join(req.health_profile.chronic)}")
    if req.health_profile.dietary:
        health_parts.append(f"Dietary restrictions: {', '.join(req.health_profile.dietary)}")
    if req.health_profile.lifestyle:
        health_parts.append(f"Lifestyle: {', '.join(req.health_profile.lifestyle)}")
    if req.health_profile.notes:
        health_parts.append(f"Notes: {req.health_profile.notes}")
    health_info = "; ".join(health_parts) if health_parts else "None"

    return f"""You are a professional nutritionist and chef. Respond with ONLY a valid JSON object — no markdown, no explanation, no extra text.

Ingredients available: {ingredients}
Health profile: {health_info}

Return exactly 3 healthy recipes using this exact JSON structure:
{{
"recipes": [
    {{
    "name": "string",
    "cuisine": "string",
    "description": "string",
    "health_benefits": ["string"],
    "why_good_for_you": "string",
    "prep_time": "string",
    "cook_time": "string",
    "difficulty": "Easy",
    "servings": 2,
    "ingredients_used": ["string"],
    "additional_ingredients": ["string"],
    "instructions": ["Step 1: ...", "Step 2: ..."],
    "nutritional_info": {{
        "calories": "350 kcal",
        "protein": "25g",
        "carbs": "30g",
        "fat": "10g",
        "fiber": "5g"
    }},
    "health_tags": ["string"],
    "tips": "string"
    }}
]
}}"""


def get_recommendations(req: RecommendRequest) -> RecommendResponse:
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": _build_prompt(req),
        "stream": False,
        "format": "json",
    }

    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=120)
        resp.raise_for_status()
    except requests.exceptions.ConnectionError:
        raise ValueError(
            "Ollama is not running. Start it with: ollama serve"
        )
    except requests.exceptions.Timeout:
        raise ValueError("Ollama request timed out after 120s")
    except requests.exceptions.HTTPError as e:
        raise ValueError(f"Ollama error: {e.response.text}")

    raw = resp.json().get("response", "")

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not match:
            raise ValueError(f"Model returned invalid JSON: {raw[:300]}")
        data = json.loads(match.group())

    raw_recipes = data.get("recipes", [])
    if not raw_recipes:
        raise ValueError("Model returned no recipes")

    recipes = []
    for r in raw_recipes:
        ni = r.get("nutritional_info")
        recipes.append(Recipe(
            name=r.get("name", ""),
            cuisine=r.get("cuisine", ""),
            description=r.get("description", ""),
            health_benefits=r.get("health_benefits", []),
            why_good_for_you=r.get("why_good_for_you", ""),
            prep_time=r.get("prep_time", ""),
            cook_time=r.get("cook_time", ""),
            difficulty=r.get("difficulty", "Medium"),
            servings=int(r.get("servings", 2)),
            ingredients_used=r.get("ingredients_used", []),
            additional_ingredients=r.get("additional_ingredients", []),
            instructions=r.get("instructions", []),
            nutritional_info=NutritionalInfo(**ni) if ni else None,
            health_tags=r.get("health_tags", []),
            tips=r.get("tips", ""),
        )
    )
    return RecommendResponse(recipes=recipes)
