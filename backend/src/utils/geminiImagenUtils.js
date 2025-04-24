import { GoogleGenerativeAI } from "@google/generative-ai";
import { TextToImageClient } from "@google-cloud/vertexai"; // Imaginary import (actual will depend on your Imagen API setup)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use your own image generation setup for Imagen
const imagenClient = new TextToImageClient(); // Configure accordingly

export const generatePackagingText = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generatePackagingImage = async (description) => {
  // Basic image generation from Imagen
  const image = await imagenClient.generate({
    prompt: description,
    size: "512x512",
  });

  // return URL or base64 (depending on how your Imagen SDK handles this)
  return image.url || image.base64;
};
