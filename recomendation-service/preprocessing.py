import re

def clean_text(text: str) -> str:
    """
    Light preprocessing untuk SBERT/E5.

    Tahapan:
    1. Case Folding (lowercase)
    2. Menghapus karakter khusus
    3. Normalisasi spasi

    Tidak menggunakan:
    - Stopword Removal
    - Stemming
    """

    if not text:
        return ""

    # Case Folding
    text = text.lower()

    # Hapus karakter khusus, pertahankan huruf, angka, dan spasi
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)

    # Normalisasi spasi
    text = re.sub(r"\s+", " ", text).strip()

    return text