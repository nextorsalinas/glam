const { GoogleGenAI } = require('@google/genai');

async function test() {
  console.log("Probando Gemini 3.1 Flash Lite (IA Sola)...");
  try {
    const ai = new GoogleGenAI({ vertexai: true, project: 'glam-graduacion-ai', location: 'us-central1' });
    const result = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: "Hola, ¿estás activa?" }] }]
    });
    console.log("Respuesta:", result.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
