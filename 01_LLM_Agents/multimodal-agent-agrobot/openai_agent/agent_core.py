"""
agent_core.py — Logica centrală a agentului AI multimodal.

Capabilități:
  - Analiză imagine (brightness, culori dominante, dimensiuni)
  - Transcriere audio voce → text (Google Speech Recognition)
  - Generare răspuns text contextual
  - Sinteză vocală text → audio (gTTS)

Exportă funcția principală: multimodal_ai(image, audio_path, text_query)
"""

import os
import tempfile
import traceback
from typing import Optional, Tuple

import numpy as np


# ---------------------------------------------------------------------------
# Analiză imagine
# ---------------------------------------------------------------------------

def _analyze_image(image_array: np.ndarray) -> str:
    """Returnează o descriere text a imaginii primite ca array numpy."""
    if image_array is None:
        return "Nicio imagine furnizată."

    h, w = image_array.shape[:2]
    channels = image_array.shape[2] if image_array.ndim == 3 else 1

    # Luminozitate medie (0-255)
    brightness = float(np.mean(image_array))

    if channels >= 3:
        r_mean = float(np.mean(image_array[:, :, 0]))
        g_mean = float(np.mean(image_array[:, :, 1]))
        b_mean = float(np.mean(image_array[:, :, 2]))
        dominant = max(
            [("roșu", r_mean), ("verde", g_mean), ("albastru", b_mean)],
            key=lambda x: x[1],
        )[0]
        color_info = f"Canal dominant: {dominant} (R={r_mean:.0f}, G={g_mean:.0f}, B={b_mean:.0f})"
    else:
        color_info = "Imagine grayscale"

    bright_label = (
        "întunecată" if brightness < 80
        else "moderată" if brightness < 170
        else "luminoasă"
    )

    return (
        f"Imagine {w}x{h}px | Luminozitate: {bright_label} ({brightness:.0f}/255) | {color_info}"
    )


def _annotate_image(image_array: np.ndarray, label: str) -> np.ndarray:
    """Adaugă o bandă de text simplă în partea de jos a imaginii."""
    try:
        from PIL import Image, ImageDraw, ImageFont

        img = Image.fromarray(image_array.astype(np.uint8))
        draw = ImageDraw.Draw(img)
        # Bandă neagră semitransparentă la baza imaginii
        w, h = img.size
        draw.rectangle([(0, h - 30), (w, h)], fill=(0, 0, 0, 180))
        draw.text((5, h - 25), label, fill=(255, 255, 255))
        return np.array(img)
    except Exception:
        return image_array


# ---------------------------------------------------------------------------
# Transcriere audio
# ---------------------------------------------------------------------------

def _transcribe_audio(audio_path: Optional[str]) -> str:
    """Transcrie un fișier audio în text folosind Google Speech Recognition."""
    if not audio_path or not os.path.exists(audio_path):
        return ""

    try:
        import speech_recognition as sr  # type: ignore

        r = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = r.record(source)
        return r.recognize_google(audio_data, language="ro-RO")
    except ImportError:
        return "[speech_recognition indisponibil]"
    except Exception as exc:
        return f"[Eroare transcriere: {exc}]"


# ---------------------------------------------------------------------------
# Generare răspuns
# ---------------------------------------------------------------------------

def _generate_response(image_desc: str, question: str) -> str:
    """
    Generează un răspuns contextual bazat pe descrierea imaginii și întrebare.
    Fallback local — nu necesită API extern.
    """
    question_lower = question.lower()

    # Răspunsuri simple contextuale
    if any(kw in question_lower for kw in ["luminozitate", "luminos", "întunecat", "bright"]):
        return f"Analizând imaginea: {image_desc}"

    if any(kw in question_lower for kw in ["culoare", "color", "roșu", "verde", "albastru"]):
        return f"Distribuție de culori detectată — {image_desc}"

    if any(kw in question_lower for kw in ["dimensiune", "rezoluție", "mărime", "size"]):
        return f"Dimensiuni imagine: {image_desc}"

    if any(kw in question_lower for kw in ["ce", "what", "descrie", "describe", "arată", "show"]):
        return f"Am analizat imaginea. {image_desc}"

    if question.strip():
        return f"Întrebare primită: '{question}'. Analiză imagine: {image_desc}"

    return f"Analiză completă: {image_desc}"


# ---------------------------------------------------------------------------
# Sinteză vocală
# ---------------------------------------------------------------------------

def _text_to_speech(text: str) -> Optional[str]:
    """Convertește text în audio MP3. Returnează calea fișierului sau None."""
    # Truncheam la 500 caractere pentru TTS
    text_short = text[:500]

    # Încearcă gTTS (necesită internet)
    try:
        from gtts import gTTS  # type: ignore

        tts = gTTS(text=text_short, lang="ro")
        out_path = os.path.join(tempfile.gettempdir(), "agrobot_response.mp3")
        tts.save(out_path)
        return out_path
    except ImportError:
        pass
    except Exception:
        pass

    # Fallback: say (macOS, fără fișier output → None)
    try:
        import subprocess
        subprocess.run(["say", text_short[:200]], check=False, timeout=10)
    except Exception:
        pass

    return None


# ---------------------------------------------------------------------------
# Funcția principală exportată
# ---------------------------------------------------------------------------

def multimodal_ai(
    image: Optional[np.ndarray],
    audio_path: Optional[str],
    text_query: str,
) -> Tuple[Optional[np.ndarray], str, Optional[str]]:
    """
    Agent AI multimodal — vede, ascultă și răspunde.

    Args:
        image:      Array numpy (H×W×3) sau None dacă nu s-a furnizat imagine.
        audio_path: Cale fișier audio (WAV/MP3) sau None.
        text_query: Întrebare în text (poate fi goală).

    Returns:
        (imagine_adnotată, răspuns_text, cale_audio_răspuns)
    """
    try:
        # 1. Analiză imagine
        image_desc = _analyze_image(image)

        # 2. Transcriere audio (dacă există)
        audio_text = _transcribe_audio(audio_path)
        question = audio_text if audio_text and not audio_text.startswith("[") else text_query

        # 3. Generare răspuns
        response = _generate_response(image_desc, question)

        # 4. Adnotare imagine
        annotated = _annotate_image(image, "AI Analizat") if image is not None else image

        # 5. Sinteză vocală
        audio_out = _text_to_speech(response)

        return annotated, response, audio_out

    except Exception:
        err = traceback.format_exc()
        return image, f"[Eroare internă]\n{err}", None
