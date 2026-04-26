import gradio as gr
import requests
import json
from datetime import datetime

# --- CONFIGURARE API ---
# Folosim Open-Meteo pentru date agrometeorologice (gratuit, nu cere cheie API)
# Acesta simuleaza date satelitare pentru umiditate sol, ploaie, temperatura
API_URL = "https://api.open-meteo.com/v1/forecast"

def get_agri_data(lat, long, ph_input):
    """
    Functia care preia date reale de la satelit/meteo si ia decizia de irigare.
    """
    try:
        # 1. Cerere catre API (Date Reale)
        params = {
            "latitude": lat,
            "longitude": long,
            "current": ["temperature_2m", "relative_humidity_2m", "rain", "soil_moisture_3_9cm"],
            "timezone": "auto"
        }
        
        response = requests.get(API_URL, params=params)
        data = response.json()
        
        # 2. Extragere Date
        current = data['current']
        temp = current['temperature_2m']        # Temperatura (°C)
        rain = current['rain']                  # Ploaie (mm)
        soil_moisture = current['soil_moisture_3_9cm'] # Umiditate sol (m³/m³)
        
        # Convertim umiditatea solului in procente (aprox)
        soil_moisture_pct = soil_moisture * 100 
        
        # 3. Logica de Decizie (AI Simplificat)
        # Regula: Irigam daca pamantul e uscat (<20%), nu ploua si pH-ul e in limite decente
        status = ""
        action = ""
        color = ""
        
        analyze_text = f"""
        📊 Raport Analiză Sol & Meteo:
        ------------------------------
        🌡️ Temperatură: {temp} °C
        💧 Umiditate Sol (Satelit): {soil_moisture_pct:.1f}%
        🌧️ Ploaie Acum: {rain} mm
        🧪 pH Sol (Măsurat/Introdus): {ph_input}
        """
        
        should_irrigate = False
        
        # Logica pH
        if ph_input < 5.5:
            analyze_text += "\n⚠️ ATENȚIE: Sol prea acid! Necesită tratament cu var."
        elif ph_input > 7.5:
            analyze_text += "\n⚠️ ATENȚIE: Sol prea alcalin! Necesită sulf."
        else:
            analyze_text += "\n✅ pH-ul este optim."

        # Logica Apa
        if rain > 0.5:
            status = "PLOUĂ"
            action = "⛔ NU IRIGA (Plouă deja)"
            color = "red"
        elif soil_moisture_pct > 40:
            status = "SOL UMED"
            action = "⛔ NU IRIGA (Umiditate suficientă)"
            color = "green"
        elif soil_moisture_pct < 25:
            status = "SOL USCAT"
            action = "💦 PORNEȘTE IRIGAREA"
            color = "orange"
            should_irrigate = True
        else:
            status = "OPTIM"
            action = "✅ Monitorizează (Nivel mediu)"
            color = "blue"

        # Mesaj final
        result_message = f"Decizie Sistem: {action}"
        
        return analyze_text, result_message

    except Exception as e:
        return "Eroare conexiune API", f"Eroare: {str(e)}"

# --- INTERFATA GRADIO ---

def build_interface():
    with gr.Blocks(theme=gr.themes.Soft(), title="AgroSmart Satellite System") as demo:
        gr.Markdown("""
        # 🛰️ Sistem Agricol Inteligent - Conexiune Satelit
        Acest sistem preia date meteo și de sol în timp real via API și analizează necesarul de apă.
        """)
        
        with gr.Row():
            with gr.Column():
                gr.Markdown("### 📍 Configurare Locație & Senzori")
                lat_input = gr.Number(label="Latitudine", value=44.4268) # Default Bucuresti
                long_input = gr.Number(label="Longitudine", value=26.1025)
                # pH-ul nu poate fi citit din satelit, il simulam ca si cum ar veni de la un senzor IoT
                ph_slider = gr.Slider(minimum=0, maximum=14, value=6.5, label="Valoare pH Sol (Senzor IoT)")
                analyze_btn = gr.Button("📡 Analizează Date Satelit", variant="primary")
            
            with gr.Column():
                gr.Markdown("### 📉 Rezultate Analiză")
                output_log = gr.Textbox(label="Jurnal Date", lines=6)
                output_decision = gr.Label(label="Acțiune Recomandată")

        # Eveniment Click
        analyze_btn.click(
            fn=get_agri_data, 
            inputs=[lat_input, long_input, ph_slider], 
            outputs=[output_log, output_decision]
        )
        
        gr.Markdown("--- \n*Powered by Open-Meteo API & Python Gradio*")

    return demo

# --- LANSARE ---
if __name__ == "__main__":
    app = build_interface()
    # Lansam interfata in browser
    app.launch(inbrowser=True)