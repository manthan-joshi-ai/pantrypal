import json
import re
import os
import base64
import io
import requests
from dotenv import load_dotenv
from models import (
    ImageAnalysisItem,
    Ingredient,
    NutritionalInfo,
    Recipe,
    RecommendRequest,
    RecommendResponse,
    ChefChatRequest,
    ChefChatResponse
)

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_URL = (
    OLLAMA_BASE_URL
    if OLLAMA_BASE_URL.endswith("/api/generate")
    else f"{OLLAMA_BASE_URL}/api/generate"
)
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3:mini")
OLLAMA_VISION_MODEL = os.getenv("OLLAMA_VISION_MODEL", "llava:7b")

AWS_BEARER_TOKEN_BEDROCK = os.getenv("AWS_BEARER_TOKEN_BEDROCK", "")
AWS_BEDROCK_URL = os.getenv("AWS_BEDROCK_URL", "https://bedrock.us-east-1.amazonaws.com").rstrip("/")
AWS_BEDROCK_MODEL = os.getenv("AWS_BEDROCK_MODEL", "minimax.minimax-m2")
AWS_BEDROCK_ENDPOINT = f"{AWS_BEDROCK_URL}/models/{AWS_BEDROCK_MODEL}/invoke"


def _extract_json(raw: str) -> dict:
    raw = raw.strip()
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as first_error:
        json_text = _extract_json_object(raw)
        if not json_text:
            raise ValueError(
                f"Model returned invalid JSON and no JSON object could be extracted. "
                f"Preview: {raw[:400]}..."
            ) from first_error

        try:
            return json.loads(json_text)
        except json.JSONDecodeError as second_error:
            raise ValueError(
                f"Model returned invalid JSON after extraction. Extracted snippet: {json_text[:400]}..."
            ) from second_error


def _extract_json_object(raw: str) -> str | None:
    start = raw.find('{')
    if start == -1:
        return None

    depth = 0
    in_string = False
    escape = False

    for idx, char in enumerate(raw[start:], start):
        if escape:
            escape = False
            continue
        if char == '\\':
            escape = True
            continue
        if char == '"':
            in_string = not in_string
        if in_string:
            continue
        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0:
                return raw[start:idx + 1]
    return None


def _as_list(value) -> list:
    if isinstance(value, list):
        return value
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _as_string_list(value) -> list[str]:
    return [str(item).strip() for item in _as_list(value) if str(item).strip()]


def _as_int(value, fallback: int = 2) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _clean_name(value) -> str:
    return " ".join(str(value or "").strip().split())


def _prepare_image_for_vision(image_bytes: bytes) -> bytes:
    try:
        from PIL import Image
    except ImportError:
        return image_bytes

    try:
        with Image.open(io.BytesIO(image_bytes)) as image:
            image.thumbnail((1024, 1024))
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            output = io.BytesIO()
            image.save(output, format="JPEG", quality=82, optimize=True)
            return output.getvalue()
    except Exception:
        return image_bytes


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

Return exactly {req.recipe_count} healthy recipes using this exact JSON structure:
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

    data = _extract_json(raw)

    if not isinstance(data, dict):
        raise ValueError("Model returned an unexpected recipe format")

    raw_recipes = _as_list(data.get("recipes", []))
    if not raw_recipes:
        raise ValueError("Model returned no recipes")

    recipes = []
    for r in raw_recipes:
        if not isinstance(r, dict):
            continue

        ni = r.get("nutritional_info")
        nutrition = NutritionalInfo(**ni) if isinstance(ni, dict) else None
        recipes.append(Recipe(
            name=str(r.get("name") or "Recipe").strip(),
            cuisine=str(r.get("cuisine") or "Any").strip(),
            description=str(r.get("description") or "").strip(),
            health_benefits=_as_string_list(r.get("health_benefits", [])),
            why_good_for_you=str(r.get("why_good_for_you") or "").strip(),
            prep_time=str(r.get("prep_time") or "").strip(),
            cook_time=str(r.get("cook_time") or "").strip(),
            difficulty=str(r.get("difficulty") or "Medium").strip(),
            servings=_as_int(r.get("servings"), 2),
            ingredients_used=_as_string_list(r.get("ingredients_used", [])),
            additional_ingredients=_as_string_list(r.get("additional_ingredients", [])),
            instructions=_as_string_list(r.get("instructions", [])),
            nutritional_info=nutrition,
            health_tags=_as_string_list(r.get("health_tags", [])),
            tips=str(r.get("tips") or "").strip(),
        )
    )
    if not recipes:
        raise ValueError("Model returned no usable recipes")
    return RecommendResponse(recipes=recipes)

def chef_chat(req: ChefChatRequest) -> ChefChatResponse:
    r = req.recipe
    ingredients_all = (r.ingredients_used or []) + (r.additional_ingredients or [])
    system_prompt = (
        f"You are a friendly expert chef and nutritionist specializing in the recipe \"{r.name}\" "
        f"({r.cuisine} cuisine). The recipe serves {r.servings}, takes {r.prep_time} prep and {r.cook_time} to cook "
        f"(difficulty: {r.difficulty}). "
        f"Ingredients: {', '.join(ingredients_all)}. "
        f"Instructions: {' | '.join(r.instructions or [])}. "
        f"Health tags: {', '.join(r.health_tags or [])}. "
        f"Chef tip: {r.tips or 'none'}. "
        "Answer the user's questions about this recipe concisely and helpfully. "
        "If asked about substitutions, scaling, techniques, or nutrition, give practical advice. "
        "When the user asks how to make the dish spicier, recommend specific spicy ingredients or sauces, "
        "include approximate quantities, and explain how to add them without overwhelming the recipe. "
        "Stay focused on this recipe and cooking-related topics."
    )

    conversation = "\n".join(
        f"{msg.role.capitalize()}: {msg.content}" for msg in req.messages
    )

    prompt = f"{system_prompt}\n\n{conversation}\nAssistant:"

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
            },
            timeout=60,
        )
        resp.raise_for_status()
    except requests.exceptions.ConnectionError:
        raise ValueError("Ollama is not running. Start it with: ollama serve")
    except requests.exceptions.Timeout:
        raise ValueError("Chef chat timed out after 60s")
    except requests.exceptions.HTTPError as e:
        raise ValueError(f"Ollama chat error: {e.response.text}")

    raw = resp.json().get("response", "")
    if not raw:
        raise ValueError("Chef chat returned an empty response from Ollama.")

    if "<reasoning>" in raw and "</reasoning>" in raw:
        raw = raw[raw.index("</reasoning>") + len("</reasoning>"):].strip()

    return ChefChatResponse(reply=raw.strip())

def analyze_food_image(image_bytes: bytes) -> tuple[list[Ingredient], list[ImageAnalysisItem]]:
    vision_image = _prepare_image_for_vision(image_bytes)
    payload = {
        "model": OLLAMA_VISION_MODEL,
        "prompt": """You are analyzing a food, pantry, fridge, or plate image for a recipe app.
Identify visible edible ingredients and pantry items. Prefer raw ingredient names over dish names when possible.
Estimate quantity only when visually reasonable; otherwise leave it blank.

Respond with ONLY valid JSON, no markdown or extra text:
{
  "ingredients": [
    {
      "name": "tomato",
      "estimated_quantity": "2",
      "unit": "pcs",
      "confidence": "high",
      "category": "vegetable",
      "notes": "ripe red tomatoes"
    }
  ]
}
Only include items you can reasonably see. Use common ingredient names, not brand names.
Use confidence values: high, medium, or low.""",
        "images": [base64.b64encode(vision_image).decode("utf-8")],
        "stream": False,
        "format": "json",
    }

    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=120)
        resp.raise_for_status()
    except requests.exceptions.ConnectionError:
        raise ValueError("Ollama is not running. Start it with: ollama serve")
    except requests.exceptions.Timeout:
        raise ValueError("Image recognition timed out after 120s")
    except requests.exceptions.HTTPError as e:
        detail = e.response.text
        if "model runner has unexpectedly stopped" in detail:
            raise ValueError(
                "Ollama vision model crashed while analyzing the image. "
                "The app compressed the image, but the selected vision model may still be too heavy. "
                "Try a smaller Ollama vision model such as moondream, or use the manual photo-analysis editor."
            )
        raise ValueError(f"Ollama vision error: {detail}")

    raw = resp.json().get("response", "")
    data = _extract_json(raw)
    if isinstance(data, dict):
        raw_ingredients = data.get("ingredients", [])
    elif isinstance(data, list):
        raw_ingredients = data
    else:
        raw_ingredients = []

    seen = set()
    ingredients = []
    image_analysis = []
    for item in _as_list(raw_ingredients):
        if isinstance(item, str):
            name = item
            estimated_quantity = ""
            unit = ""
            confidence = ""
            category = ""
            notes = ""
        elif isinstance(item, dict):
            name = (
                item.get("name")
                or item.get("ingredient")
                or item.get("food")
                or item.get("item")
                or ""
            )
            estimated_quantity = item.get("estimated_quantity") or item.get("quantity") or ""
            unit = item.get("unit", "")
            confidence = item.get("confidence", "")
            category = item.get("category", "")
            notes = item.get("notes") or item.get("description") or ""
        else:
            continue

        cleaned = _clean_name(name)
        key = cleaned.lower()
        if not cleaned or key in seen:
            continue
        seen.add(key)
        quantity = _clean_name(estimated_quantity)
        clean_unit = _clean_name(unit)
        ingredients.append(Ingredient(
            id=f"img-{len(ingredients) + 1}",
            name=cleaned,
            quantity=quantity,
            unit=clean_unit,
        ))
        image_analysis.append(ImageAnalysisItem(
            name=cleaned,
            estimated_quantity=quantity,
            unit=clean_unit,
            confidence=_clean_name(confidence).lower(),
            category=_clean_name(category),
            notes=_clean_name(notes),
        ))

    if not ingredients:
        raise ValueError("No recognizable food items found in the image")
    return ingredients, image_analysis


def recognize_ingredients(image_bytes: bytes) -> list[Ingredient]:
    ingredients, _ = analyze_food_image(image_bytes)
    return ingredients
