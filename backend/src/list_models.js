const { GoogleGenAI } = require('@google/genai');

const aiOptions = {
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT || 'glam-graduacion-ai',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
};

const ai = new GoogleGenAI(aiOptions);

async function run() {
  try {
    console.log('Consultando modelos de Vertex AI en el proyecto glam-graduacion-ai...');
    const response = await ai.models.list();
    console.log('Modelos disponibles:');
    // Si response es iterable o tiene una propiedad models
    const models = response.models || response;
    if (Array.isArray(models)) {
      models.forEach(m => console.log(m.name));
    } else {
      console.log(JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.error('❌ Error listando modelos:', error);
  }
}

run();
