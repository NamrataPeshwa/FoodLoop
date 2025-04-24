from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import google.generativeai as genai
import io
import os
from dotenv import load_dotenv

load_dotenv()
# Initialize FastAPI app
app = FastAPI()

# Set up CORS for your frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel("gemma-3-12b-it")

# Utils
def calculate_avg_hsv(image: Image.Image):
    hsv_image = image.convert("HSV")
    hsv_array = np.array(hsv_image)
    avg_h = np.mean(hsv_array[:, :, 0])
    avg_s = np.mean(hsv_array[:, :, 1])
    avg_v = np.mean(hsv_array[:, :, 2])
    return avg_h, avg_s, avg_v

def calculate_brightness(image: Image.Image):
    grayscale = image.convert("L")
    arr = np.array(grayscale)
    brightness = np.mean(arr)
    return brightness

def calculate_vibrancy(image: Image.Image):
    image = image.convert("RGB")
    arr = np.array(image)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    saturation = np.std([r, g, b])
    return saturation

# Gemini analysis function
def analyze_with_gemini(image: Image.Image, avg_hsv, brightness, vibrancy):
    prompt = f"""
You are a food freshness detector AI.

Here are the average visual features of an image of food:
- Average Hue: {avg_hsv[0]:.2f}
- Average Saturation: {avg_hsv[1]:.2f}
- Average Value (Brightness): {avg_hsv[2]:.2f}
- Brightness: {brightness:.2f}
- Vibrancy (Color variance): {vibrancy:.2f}

Based on these values, assess whether the food is fresh or stale.
Respond with "Fresh" or "Stale" and a short explanation.
"""
    response = gemini_model.generate_content(prompt)
    return response.text.strip()

# Route for prediction
@app.post("/predict")
async def predict_with_gemini(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    avg_hsv = calculate_avg_hsv(image)
    brightness = calculate_brightness(image)
    vibrancy = calculate_vibrancy(image)

    result = analyze_with_gemini(image, avg_hsv, brightness, vibrancy)

    return {
        "result": result,
        "avg_hsv": avg_hsv,
        "brightness": brightness,
        "vibrancy": vibrancy,
    }