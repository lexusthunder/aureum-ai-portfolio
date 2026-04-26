print('✅ main.py s-a rulat')
from ultralytics import YOLO
from transformers import pipeline
import gradio as gr
import speech_recognition as sr
import easyocr
import cv2
import os

# ====== MODELE ======
model = YOLO("yolov8n.pt")
chatgpt = pipeline("text-generation", model="gpt2")
reader = easyocr.Reader(['ro'])

# ====== FUNCȚIE VOCE MAC ======
def speak(text):
    print("🔊 AI spune:", text)
    os.system(f"say '{text}'")

# ====== FUNCȚIE OCR ======
def extract_text_from_image(img):
    results = reader.readtext(img)
    for (bbox, text, prob) in results:
        print(f"🔍 Text detectat: {text}")
    return " ".join([text for _, text, _ in results])

# ====== GPT răspuns + voce ======
def ai_chat_response(question):
    result = chatgpt(question, max_length=50, do_sample=True)
    reply = result[0]['generated_text']
    speak(reply)
    return reply

# ====== FUNCȚIE DETECTARE IMAGINE ======
def detect_objects_and_chat(img, text_input):
    results = model(img)
    result_img = results[0].plot()

    labels = set()
    for box in results[0].boxes.cls:
        label = model.names[int(box)]
        labels.add(label)

    detected = ", ".join(labels)
    ocr_text = extract_text_from_image(img)

    if text_input:
        response = ai_chat_response(
            text_input + f". Obiecte detectate: {detected}. Text extras: {ocr_text}"
        )
    else:
        response = f"Am detectat: {detected}. Text citit: {ocr_text}"
        speak(response)

    return result_img, response

# ====== FUNCȚIE COMANDĂ VOCE ======
def listen():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎤 Ascult...")
        audio = recognizer.listen(source)
    try:
        command = recognizer.recognize_google(audio, language="ro-RO")
        print("Ai spus:", command)
        return command.lower()
    except:
        speak("Nu am înțeles. Mai încearcă.")
        return ""

# ====== FUNCȚIE CAMERĂ ======
def detect_from_camera():
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    if not ret:
        speak("Nu pot accesa camera.")
        return
    results = model(frame)
    labels = set()
    for box in results[0].boxes.cls:
        label = model.names[int(box)]
        labels.add(label)
    detected = ", ".join(labels)
    text = extract_text_from_image(frame)
    speak(f"Am detectat: {detected}. Text citit: {text}")

# ====== ASISTENT VOCAL ======
def run_voice_assistant():
    while True:
        command = listen()
        if "ce vezi" in command:
            speak("Analizez imaginea...")
            detect_from_camera()
        elif "oprește" in command or "ieșire" in command:
            speak("La revedere.")
            break
        elif command:
            ai_chat_response(command)

# ====== INTERFAȚĂ GRADIO ======
gr.Interface(
    fn=detect_objects_and_chat,
    inputs=[
        gr.Image(type="filepath", label="Încarcă o imagine"),
        gr.Textbox(lines=2, placeholder="Întreabă AI-ul...")
    ],
    outputs=[
        gr.Image(label="Imagine analizată"),
        gr.Textbox(label="Răspuns AI")
    ],
    title="SmartVision AI",
    description="🧠 AI care detectează obiecte, citește text și răspunde cu voce."
).launch()

# ====== PORNIRE COMANDĂ VOCALĂ ======
if __name__ == "__main__":
    run_voice_assistant()
    if __name__ == "__main__":
    print("✅ main.py s-a rulat")
    interface.launch(share=True)