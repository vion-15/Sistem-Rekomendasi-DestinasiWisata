from sentence_transformers import SentenceTransformer, util
import torch
import requests
from preprocessing import clean_text
import os

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

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://localhost:8080"
)

# =========================
# KAMUS FILTER
# =========================

KOTA_MAPPING = {
    "jakarta selatan": "jakarta selatan",
    "south jakarta": "jakarta selatan",

    "jakarta pusat": "jakarta pusat",
    "central jakarta": "jakarta pusat",

    "jakarta utara": "jakarta utara",
    "north jakarta": "jakarta utara",

    "jakarta timur": "jakarta timur",
    "east jakarta": "jakarta timur",

    "jakarta barat": "jakarta barat",
    "west jakarta": "jakarta barat",
}

KATEGORI_MAPPING = {
    "jogging": ["olahraga", "alam", "arsitektur"],
    "lari": ["olahraga", "alam", "arsitektur"],
    "sepeda": ["olahraga", "alam", "arsitektur"],
    "olahraga": ["olahraga", "alam", "arsitektur"],

    "taman": ["alam", "olahraga", "arsitektur", "hiburan"],

    "makan": ["kuliner", "perbelanjaan", "hiburan", "akomodasi"],
    "minum": ["kuliner", "perbelanjaan", "hiburan", "akomodasi"],
    "restoran": ["kuliner", "akomodasi"],
    "cafe": ["kuliner", "perbelanjaan", "hiburan"],
    "nongkrong": ["kuliner", "alam", "perbelanjaan", "hiburan"],

    "belanja": ["perbelanjaan", "hiburan", "budaya"],
    "mall": ["perbelanjaan", "hiburan", "kuliner"],

    "sejarah": ["sejarah", "budaya", "arsitektur", "religi"],
    "museum": ["sejarah", "arsitektur", "budaya", "pameran"],

    "seni": ["pameran", "budaya", "arsitektur"],
    "ibadah": ["religi", "sejarah", "arsitektur"],

    "estetik": ["arsitektur", "alam", "pameran", "budaya"],
    "foto": ["alam", "arsitektur", "sejarah", "budaya", "pameran", "hiburan"],

    "staycation": ["akomodasi", "hiburan"],
    
    # olahraga
    "jogging": ["olahraga", "alam", "arsitektur"],
    "running": ["olahraga", "alam", "arsitektur"],
    "run": ["olahraga", "alam", "arsitektur"],
    "sports": ["olahraga", "alam", "arsitektur"],
    "sport": ["olahraga", "alam", "arsitektur"],
    "cycling": ["olahraga", "alam", "arsitektur"],
    "bike": ["olahraga", "alam", "arsitektur"],

    # taman
    "park": ["alam", "olahraga", "arsitektur", "hiburan"],
    "garden": ["alam", "olahraga", "arsitektur", "hiburan"],

    # kuliner
    "food": ["kuliner", "perbelanjaan", "hiburan", "akomodasi"],
    "eat": ["kuliner", "perbelanjaan", "hiburan", "akomodasi"],
    "drink": ["kuliner", "perbelanjaan", "hiburan", "akomodasi"],
    "restaurant": ["kuliner", "akomodasi"],
    "coffee": ["kuliner", "perbelanjaan", "hiburan"],
    "cafe": ["kuliner", "perbelanjaan", "hiburan"],

    # belanja
    "shopping": ["perbelanjaan", "hiburan", "budaya"],
    "shop": ["perbelanjaan", "hiburan", "budaya"],
    "mall": ["perbelanjaan", "hiburan", "kuliner"],

    # sejarah
    "history": ["sejarah", "budaya", "arsitektur", "religi"],
    "historical": ["sejarah", "budaya", "arsitektur", "religi"],
    "museum": ["sejarah", "arsitektur", "budaya", "pameran"],

    # seni
    "art": ["pameran", "budaya", "arsitektur"],
    "gallery": ["pameran", "budaya", "arsitektur"],
    "exhibition": ["pameran", "budaya", "arsitektur"],

    # religi
    "worship": ["religi", "sejarah", "arsitektur"],
    "mosque": ["religi", "sejarah", "arsitektur"],
    "church": ["religi", "sejarah", "arsitektur"],
    "temple": ["religi", "sejarah", "arsitektur"],

    # foto
    "photo": ["alam", "arsitektur", "sejarah", "budaya", "pameran", "hiburan"],
    "photography": ["alam", "arsitektur", "sejarah", "budaya", "pameran", "hiburan"],
    "instagrammable": ["arsitektur", "alam", "pameran", "budaya"],
    "scenic": ["arsitektur", "alam", "pameran", "budaya"],

    # staycation
    "staycation": ["akomodasi", "hiburan"],
    "hotel": ["akomodasi", "hiburan"],
}

# =========================
# LOAD DATA DESTINASI DARI GO
# =========================

def load_destinations_from_backend():

    response = requests.get(
        f"{BACKEND_URL}/api/ai/destinasi"
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

    dest_texts = []

    for d in destinations:

        text = (
            f"Nama: {d['nama']}. "
            f"Kategori: {d['kategori']}. "
            f"Kota: {d['kota']}. "
            f"Aktivitas: {d['aktivitas']}. "
            f"Deskripsi: {d['deskripsi']}"
        )

        text = clean_text(text)

        dest_texts.append(
            f"passage: {text}"
        )

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

    query_lower = user_history_text.lower()
    cleaned_query = clean_text(user_history_text)
    
    kota_ditemukan = None

    for keyword, kota_asli in KOTA_MAPPING.items():
        if keyword in query_lower:
            kota_ditemukan = kota_asli
            break
        
    kategori_ditemukan = []

    for keyword, daftar in KATEGORI_MAPPING.items():
        if keyword in cleaned_query:
            kategori_ditemukan.extend(daftar)
            break
    
    query_embedding = model.encode(
        f"query: {cleaned_query}",
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    cosine_scores = util.cos_sim(
        query_embedding,
        DESTINATION_EMBEDDINGS
    )[0]

    # top_results = torch.topk(
    #     cosine_scores,
    #     k=min(top_n, len(DESTINATIONS_CACHE))
    # )

    results = []

    for idx, score in enumerate(cosine_scores):

        similarity_score = float(score)

        if similarity_score < MIN_SIMILARITY:
            continue

        dest = DESTINATIONS_CACHE[idx]

        results.append({
            "id": dest["id"],
            "nama": dest["nama"],
            "kategori": dest["kategori"],
            "kota": dest["kota"],
            "aktivitas": dest["aktivitas"],
            "deskripsi": dest["deskripsi"],
            "latitude": dest["latitude"],
            "longitude": dest["longitude"],
            "similarity_score": round(
                similarity_score,
                4
            )
        })

    # ==========================================
    # FILTER KOTA
    # ==========================================

    if kota_ditemukan:

        results = [
            r for r in results
            if r["kota"].lower() == kota_ditemukan
        ]

    # ==========================================
    # FILTER KATEGORI
    # ==========================================

    if kategori_ditemukan:

        kategori_unik = list(set(kategori_ditemukan))

        results = [
            r for r in results
            if r["kategori"].lower() in kategori_unik
        ]

    # ==========================================
    # SORTING
    # ==========================================

    results.sort(
        key=lambda x: x["similarity_score"],
        reverse=True
    )

    return results[:top_n]