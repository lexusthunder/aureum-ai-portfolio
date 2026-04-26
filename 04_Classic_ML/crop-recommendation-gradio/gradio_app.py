import gradio as gr
import joblib
import numpy as np
import os
import time

# --- 1. CONFIGURARE CĂI & ÎNCĂRCARE ---
current_folder = os.path.dirname(os.path.abspath(__file__))
base_dir = os.path.dirname(current_folder)

model_path = os.path.join(base_dir, 'models', 'agro_recomanda.pkl')
encoder_path = os.path.join(base_dir, 'models', 'encoder_recomanda.pkl')
matrix_path = os.path.join(base_dir, 'models', 'matrice_confuzie_recomanda.png')

try:
    pipeline = joblib.load(model_path)
    encoder = joblib.load(encoder_path)
except FileNotFoundError:
    print("[EROARE FATALĂ] Modelul sau Encoder-ul nu au fost găsite în folderul 'models'.")
    print("SOLUȚIE: Rulează întâi scriptul '2_antrenare_model.py'!")
    exit()

# --- 2. FUNCȚIA CENTRALĂ DECIZIE ---
def analizeaza_recolta(N, P, K, temp, hum, ph, rain, soil_moisture, soil_type, sunlight, wind, co2, 
                       organic, irrigation_freq, crop_density, pest_pressure, fert_usage, 
                       growth_stage, urban_proximity, water_source, frost_risk, water_efficiency):
    
    # 22 de intrări (Input-urile din Gradio)
    input_values = [N, P, K, temp, hum, ph, rain, soil_moisture, soil_type, sunlight, wind, co2, 
                    organic, irrigation_freq, crop_density, pest_pressure, fert_usage, 
                    growth_stage, urban_proximity, water_source, frost_risk, water_efficiency]
    
    # Pregătim datele pentru Pipeline (care aplică Scalarea automat)
    input_data = np.array(input_values).reshape(1, -1)
    
    # Rulăm predicția AI
    predictie_numar = pipeline.predict(input_data)[0]
    rezultat_text = encoder.inverse_transform([predictie_numar])[0]
    
    # --- Logica Inginerescă (Decizia finală) ---
    actiune = ""
    
    # Extragem valorile cheie: N (Index 0), P (Index 1), K (Index 2), Umiditate Sol (Index 7)
    umiditate = input_values[7] 
    nitrogen = input_values[0]
    potasiu = input_values[2]
    
    if rezultat_text == 'rice' and umiditate < 50:
        actiune = "🔴 ALERTA CRITICĂ: Irigare imediată necesară (Risc Uscăciune OREZ)!"
        status_vizual = "RISC CRITIC"
    elif nitrogen < 30 or potasiu < 30:
        actiune = "🟡 AVERTISMENT: Nivel Nutrienți scăzute. Aplică fertilizator imediat!"
        status_vizual = "RISC NUTRIȚIONAL"
    else:
        actiune = f"🟢 RECOMANDAT: Cultura '{rezultat_text.upper()}' este ideală. Fără acțiune urgentă."
        status_vizual = "SISTEM OPTIM"
        
    # Adăugăm o mică întârziere pentru efect vizual de "procesare"
    time.sleep(0.5) 
    
    return status_vizual, actiune, rezultat_text.capitalize()

# --- 3. CREAREA INTERFEȚEI WEB (Gradio) ---

# Definim cele 22 de componente de intrare (identice cu cele din antrenare)
inputs = [
    gr.Slider(0, 140, label="1. Nitrogen (N)", value=90),
    gr.Slider(0, 145, label="2. Phosphorous (P)", value=42),
    gr.Slider(0, 205, label="3. Potassium (K)", value=43),
    gr.Slider(0, 50, label="4. Temperatura (°C)", value=25.0),
    gr.Slider(0, 100, label="5. Umiditate (%)", value=80.0),
    gr.Slider(0, 14, label="6. pH Sol", value=6.5),
    gr.Slider(0, 300, label="7. Precipitații (mm)", value=200.0),
    gr.Slider(0, 100, label="8. Umiditate Sol (%)", value=29.0),
    gr.Slider(1, 5, step=1, label="9. Tip Sol (1-5)", value=2),
    gr.Slider(0, 10, label="10. Expunere la Soare (Ore/zi)", value=8.0),
    gr.Slider(0, 30, label="11. Viteză Vânt (km/h)", value=10.0),
    gr.Slider(200, 600, label="12. Concentrație CO2 (ppm)", value=400),
    gr.Slider(0, 10, label="13. Materie Organică (%)", value=3.0),
    gr.Slider(0, 7, step=1, label="14. Frecvență Irigare (Zile)", value=4),
    gr.Slider(0, 30, label="15. Densitate Cultură", value=15.0),
    gr.Slider(0, 100, label="16. Presiune Dăunători (%)", value=50.0),
    gr.Slider(0, 250, label="17. Utilizare Fertilizator", value=180.0),
    gr.Slider(1, 5, step=1, label="18. Etapă Creștere", value=2),
    gr.Slider(0, 100, label="19. Proximitate Urbană (%)", value=30.0),
    gr.Slider(1, 5, step=1, label="20. Sursă Apă (1-5)", value=3),
    gr.Slider(0, 100, label="21. Risc Îngheț (%)", value=20.0),
    gr.Slider(0, 5, label="22. Eficiență Apă", value=1.5),
]

with gr.Blocks(theme=gr.themes.Soft(), title="Agro AI Decision System") as interfata:
    gr.Markdown("# 🚜 Sistem Avansat de Decizie AI (Proiect Comisie)")
    gr.Markdown("Demonstrație: Combină datele de la 22 de senzori pentru a recomanda cultura ideală și acțiunile de urgență.")
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### 1. Parametrii Senzorilor (Input)")
            gr.Group(inputs)
            btn = gr.Button("Analizează & Recomandă", variant="primary")
            
            gr.Markdown("---")
            gr.Image(
                matrix_path, 
                label="Dovada Performanței AI (Matrice Confuzie)",
                interactive=False,
                width="auto"
            )

        with gr.Column(scale=2):
            gr.Markdown("### 2. Output & Acțiune Inginerescă")
            output_status = gr.Textbox(label="Status AI (Risc)", interactive=False)
            output_cultura = gr.Textbox(label="Cultură Recomandată de AI", interactive=False)
            output_decizie = gr.Textbox(
                label="⚡️ Acțiune Automatizată (Decizia Sistemului)", 
                interactive=False
            )
            
            gr.Markdown("---")
            gr.Textbox(label="Log Server", value="Apasă 'Analizează & Recomandă' pentru a rula pipeline-ul.", interactive=False)
            
    # Conectarea logicii: Butonul 'btn' apelează funcția 'analizeaza_recolta'
    btn.click(
        fn=analizeaza_recolta,
        inputs=inputs,
        outputs=[output_status, output_decizie, output_cultura]
    )

if __name__ == "__main__":
    interfata.launch(share=True)