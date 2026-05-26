import json

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from models import HealthProfile, ImageRecommendResponse, RecommendRequest, RecommendResponse
from bedrock import analyze_food_image, get_recommendations

app = FastAPI(title="PantryPal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "PantryPal API"}


@app.post("/api/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    if not req.ingredients:
        raise HTTPException(status_code=400, detail="Please add at least one ingredient.")
    try:
        return get_recommendations(req)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")


@app.post("/api/recommend/image", response_model=ImageRecommendResponse)
async def recommend_from_image(
    image: UploadFile = File(...),
    health_profile: str = Form("{}"),
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    try:
        parsed_health = HealthProfile(**json.loads(health_profile))
    except (json.JSONDecodeError, ValidationError):
        raise HTTPException(status_code=400, detail="Invalid health profile.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")
    if len(image_bytes) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be smaller than 8 MB.")

    try:
        ingredients, image_analysis = analyze_food_image(image_bytes)
        recommendations = get_recommendations(
            RecommendRequest(ingredients=ingredients, health_profile=parsed_health)
        )
        return ImageRecommendResponse(
            ingredients=ingredients,
            image_analysis=image_analysis,
            recipes=recommendations.recipes,
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image recommendation failed: {str(e)}")
