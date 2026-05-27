from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import RecommendRequest, RecommendResponse, ChefChatRequest, ChefChatResponse
from bedrock import get_recommendations, chef_chat

app = FastAPI(title="PantryPal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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


@app.post("/api/chat", response_model=ChefChatResponse)
def chat(req: ChefChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")
    try:
        return chef_chat(req)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
