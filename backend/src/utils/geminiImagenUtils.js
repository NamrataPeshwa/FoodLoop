import "dotenv/config";

// Gemini setup
import { GoogleGenerativeAI } from "@google/generative-ai";

// Vertex AI (Imagen)
import { VertexAI } from "@google-cloud/aiplatform"; // official Vertex AI SDK

// Set project and location
const project = process.env.GCP_PROJECT_ID; // Set this in .env
const location = "us-central1"; // Imagen is usually only available here

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Init Imagen / Vertex AI
const vertexAI = new VertexAI({
  projectId: project,
  location: location,
});

const publisherModel = "projects/cloud-ml-art-prod/locations/us-central1/publishers/google/models/imagen-2"; // Change to correct version if needed

// Function: Generate Packaging Text
export const generatePackagingText = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// Function: Generate Packaging Image
export const generatePackagingImage = async (description) => {
  const instance = {
    prompt: description,
  };

  const parameters = {
    sampleCount: 1,
    imageSize: "512x512", // Imagen default sizes: 512x512 or 1024x1024 (based on model)
  };

  const request = {
    endpoint: publisherModel,
    instances: [instance],
    parameters,
  };

  const predictionService = vertexAI.predictionService();

  const [response] = await predictionService.predict(request);
  const base64Image = response.predictions?.[0]?.bytesBase64Encoded;

  return `data:image/png;base64,${base64Image}`;
};
