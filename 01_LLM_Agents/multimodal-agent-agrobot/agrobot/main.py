"""
AgroBot — Sistem IoT de irigare inteligentă cu Machine Learning.

Funcționare:
  1. Antrenează un model RandomForest pe date IoT sintetice.
  2. Rulează predicții pe exemple reprezentative.
  3. Poate fi extins cu date reale de la senzori fizici.

Utilizare:
  cd agrobot/
  python main.py
"""

from datetime import datetime
from src.train_model import train_model
from src.predict import predict


def main() -> None:
    print("=" * 55)
    print(f"  AgroBot — Sistem Irigare IoT + ML")
    print(f"  Start: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 55)

    # 1) Antrenare model (generare date + fit + salvare)
    print("\n[1/2] Antrenare model ML...")
    train_model()

    # 2) Predicții de demonstrație pe scenarii reale
    print("\n[2/2] Predicții pe scenarii IoT:")
    print("-" * 55)

    scenarii = [
        {"temp": 30, "hum": 25, "rain": 0,
         "descriere": "Cald, sol uscat, fără ploaie"},
        {"temp": 22, "hum": 78, "rain": 1,
         "descriere": "Răcoros, sol umed, plouă"},
        {"temp": 35, "hum": 18, "rain": 0,
         "descriere": "Caniculă, sol foarte uscat"},
        {"temp": 20, "hum": 60, "rain": 0,
         "descriere": "Timp moderat, umiditate medie"},
        {"temp": 29, "hum": 38, "rain": 0,
         "descriere": "Cald, sol aproape uscat"},
    ]

    for s in scenarii:
        rezultat = predict(
            temperatura=s["temp"],
            umiditate_sol=s["hum"],
            ploaie=s["rain"],
        )
        print(f"  📡 {s['descriere']}")
        print(f"     Temp={s['temp']}°C | Umid={s['hum']}% | Ploaie={'DA' if s['rain'] else 'NU'}")
        print(f"     → {rezultat}")
        print()

    print("=" * 55)
    print("  AgroBot finalizat cu succes.")
    print("=" * 55)


if __name__ == "__main__":
    main()
