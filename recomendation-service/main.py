from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

from preprocessing import clean_text
from recommendation import (get_cbf_recommendations, build_destination_embeddings)

import recommendation

app = FastAPI(
    title="Service Rekomendasi Destinasi (CBF)",
    description="Microservice Python untuk Sistem Rekomendasi dengan SBERT dan Cosine Similarity",
    version="1.0.0"
)


# =========================
# MODEL
# =========================

class DestinasiItem(BaseModel):
    id: str
    nama: str
    kategori: str
    deskripsi: str
    latitude: float
    longitude: float


class RecommendationRequest(BaseModel):
    user_history_text: str
    top_n: int = 6


class CleanRequest(BaseModel):
    text: str


# =========================
# ENDPOINT ROOT
# =========================

@app.get("/")
def read_root():
    return {
        "status": "aktif",
        "message": "Service Rekomendasi FastAPI Berjalan!"
    }


# =========================
# TEST PREPROCESSING
# =========================

@app.post("/clean-text")
def test_preprocessing(req: CleanRequest):

    cleaned_text = clean_text(req.text)

    return {
        "cleaned_text": cleaned_text
    }


# =========================
# RECOMMENDATION ENDPOINT
# =========================

@app.post("/recommend")
def get_recommendations(request: RecommendationRequest):

    try:
        
        if recommendation.DESTINATION_EMBEDDINGS is None:
            build_destination_embeddings()

        recommendations = get_cbf_recommendations(
            user_history_text=request.user_history_text,
            top_n=request.top_n
        )

        return {
            "recommendations": recommendations
        }

    except Exception as e:

        print("ERROR RECOMMENDATION:")
        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
@app.post("/reload-destinations")
def reload_destinations():

    build_destination_embeddings()

    return {
        "message": "cache berhasil direload"
    }