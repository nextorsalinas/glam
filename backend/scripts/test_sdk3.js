const { GoogleGenAI } = require('@google/genai');

try {
  const ai = new GoogleGenAI({ vertexai: true, project: 'glam-graduacion-ai', location: 'us-central1' });
  console.log("Success with vertexai: true, project at root");
} catch(e) {
  console.log("Error:", e.message);
}
