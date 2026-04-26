import pandas as pd
import numpy as np
import os
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# --- CONFIGURARE CĂI (ROBUSTĂ) ---
# Detectează automat folderul Proiect_Agro_AI
current_folder = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(current_folder)

DATA_FILE = os.path.join(base_dir, 'data', 'Crop_recommendationV2.csv') 
MODEL_FILE = os.path.join(base_dir, 'models', 'agro_recomanda.pkl')
ENCODER_FILE = os.path.join(base_dir, 'models', 'encoder_recomanda.pkl')
MATRIX_FILE = os.path.join(base_dir, 'models', 'matrice_confuzie_recomanda.png')

print("--- [START] ANTRENARE MODEL PROFESIONAL ---")

# --- 1. ÎNCĂRCARE DATE ---
if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(f"[EROARE] Nu găsesc fișierul de date la: {DATA_FILE}")

df = pd.read_csv(DATA_FILE)

# --- 2. DEFINIRE COLOANE ---
# 22 de parametri de intrare (Intrări)
features = [
    'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'soil_moisture',
    'soil_type', 'sunlight_exposure', 'wind_speed', 'co2_concentration', 
    'organic_matter', 'irrigation_frequency', 'crop_density', 'pest_pressure', 
    'fertilizer_usage', 'growth_stage', 'urban_area_proximity', 'water_source_type', 
    'frost_risk', 'water_usage_efficiency'
]
target = 'label' 

X = df[features]
y = df[target]

# Codare: text (ex: 'rice') -> număr (ex: 0)
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# --- 3. PIPELINE ȘTIINȚIFIC ---
# Combină Scalarea datelor + Modelul AI
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1))
])

# --- 4. ANTRENARE ---
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
pipeline.fit(X_train, y_train)
print("[OK] Model antrenat.")

# --- 5. EVALUARE ȘI SALVARE GRAFIC ---
y_pred = pipeline.predict(X_test)
print(f"\n[REZULTAT] Acuratețea Modelului: {accuracy_score(y_test, y_pred) * 100:.2f}%")

try:
    # Matricea de Confuzie pentru prezentare
    plt.figure(figsize=(18, 16))
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Greens', 
                xticklabels=encoder.classes_, yticklabels=encoder.classes_)
    plt.title('Matrice de Confuzie (Clasificare Multi-Clasă)')
    plt.savefig(MATRIX_FILE)
    plt.close()
    print(f"[OK] Grafic salvat în: {MATRIX_FILE}")
    
except Exception as e:
    print(f"[AVERTISMENT] Eroare la salvarea graficului (verifică librăriile vizuale).")
    
# --- 6. SALVARE FINALĂ ---
joblib.dump(pipeline, MODEL_FILE)
joblib.dump(encoder, ENCODER_FILE) 
print(f"\n[SUCCES TOTAL] Sistemul AI (Pipeline & Encoder) salvat în 'models/'. Gata pentru Pasul 3.")