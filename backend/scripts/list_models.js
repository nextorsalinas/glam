const { GoogleGenAI } = require('@google/genai');

async function list() {
  try {
    const ai = new GoogleGenAI({ vertexai: true, project: 'glam-graduacion-ai', location: 'us-central1' });
    const models = await ai.models.list();
    console.log("Gemini models found:");
    models.models.filter(m => m.name.includes('gemini')).forEach(m => console.log(m.name));
  } catch (e) {
    console.error("Error listing models:", e);
  }
}
list();
