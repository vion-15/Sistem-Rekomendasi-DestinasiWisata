from sentence_transformers import SentenceTransformer, util
import torch
import requests
from preprocessing import clean_text

# =========================
# LOAD MODEL SEKALI
# =========================

model = SentenceTransformer(
    "intfloat/multilingual-e5-small"
)

print("MODEL LOADED")

# =========================
# GLOBAL CACHE
# =========================

DESTINATION_EMBEDDINGS = None
DESTINATIONS_CACHE = []

MIN_SIMILARITY = 0.35


# =========================
# LOAD DATA DESTINASI DARI GO
# =========================

def load_destinations_from_backend():

    response = requests.get(
        "http://localhost:8080/api/ai/destinasi"
    )

    response.raise_for_status()

    return response.json()


# =========================
# BUILD EMBEDDING SEKALI
# =========================

def build_destination_embeddings():

    global DESTINATION_EMBEDDINGS
    global DESTINATIONS_CACHE

    destinations = load_destinations_from_backend()

    if not destinations:
        raise Exception(
            "Data destinasi kosong"
        )

    DESTINATIONS_CACHE = destinations

    dest_texts = [
        f"passage: {clean_text(d['deskripsi'])}"
        for d in destinations
    ]

    DESTINATION_EMBEDDINGS = model.encode(
        dest_texts,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    print(
        f"SUCCESS: {len(destinations)} destinasi berhasil di-cache"
    )


# =========================
# REKOMENDASI
# =========================

def get_cbf_recommendations(
    user_history_text: str,
    top_n: int = 10
):

    if not user_history_text.strip():
        return []

    if DESTINATION_EMBEDDINGS is None:
        raise Exception(
            "Destination embeddings belum dibangun"
        )

    cleaned_query = clean_text(user_history_text)
    
    query_embedding = model.encode(
        f"query: {cleaned_query}",
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    cosine_scores = util.cos_sim(
        query_embedding,
        DESTINATION_EMBEDDINGS
    )[0]

    top_results = torch.topk(
        cosine_scores,
        k=min(top_n, len(DESTINATIONS_CACHE))
    )

    results = []

    for score, idx in zip(
        top_results[0],
        top_results[1]
    ):

        similarity_score = float(score)

        if similarity_score < MIN_SIMILARITY:
            continue

        dest = DESTINATIONS_CACHE[
            idx.item()
        ]

        results.append({
            "id": dest["id"],
            "nama": dest["nama"],
            "kategori": dest["kategori"],
            "deskripsi": dest["deskripsi"],
            "latitude": dest["latitude"],
            "longitude": dest["longitude"],
            "similarity_score": round(
                similarity_score,
                4
            )
        })

    return results