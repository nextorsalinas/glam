const { GoogleGenAI } = require('@google/genai');

async function list() {
  try {
    const ai = new GoogleGenAI({ vertexai: true, project: 'glam-graduacion-ai', location: 'us-central1' });
    const models = await ai.models.list();
    // En algunas versiones es models.models, en otras es directo
    const list = models.models || models;
    console.log(JSON.stringify(list, null, 2));
  } catch (e) {
    console.error(e);
  }
}
list();
