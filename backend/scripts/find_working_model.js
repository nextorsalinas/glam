const { GoogleGenAI } = require('@google/genai');

async function findModel() {
  const project = 'glam-graduacion-ai';
  const locations = ['us-central1', 'us-east1', 'us-east4', 'us-west1', 'europe-west1'];
  const modelName = 'gemini-1.5-flash';

  console.log(`--- DIAGNÓSTICO DE REGIONES VERTEX AI ---`);

  for (const location of locations) {
    process.stdout.write(`Probando ${modelName} en ${location}... `);
    try {
      const ai = new GoogleGenAI({ vertexai: true, project, location });
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: "hola" }] }]
      });
      console.log(`✅ ¡ÉXITO!`);
      console.log(`\n>>> LA REGIÓN CORRECTA ES: '${location}' <<<`);
      return;
    } catch (e) {
      console.log(`❌ ERROR (404 o similar)`);
    }
  }

  console.log("\nNinguna región estándar funcionó. Esto confirma que es un tema de permisos o habilitación en el Cloud Console.");
}

findModel();
