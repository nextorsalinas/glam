const { GoogleGenAI } = require('@google/genai');
const { systemPrompt } = require('../prompts/systemPrompt');

const aiOptions = {};
if (process.env.GEMINI_API_KEY) {
  aiOptions.apiKey = process.env.GEMINI_API_KEY;
} else {
  aiOptions.vertexai = true;
  aiOptions.project = process.env.GOOGLE_CLOUD_PROJECT || 'glam-graduacion-ai';
  aiOptions.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
}

const ai = new GoogleGenAI(aiOptions);

const modelName = 'gemini-2.5-flash'; 

async function generarRespuesta(mensajeUsuario, catalogo) {
  try {
    const catalogoSimplificado = catalogo.map(item => 
      `- ${item.name} ($${item.price}): ${item.description}`
    ).join('\n');

    const contextoCatalogo = `CATÁLOGO:\n${catalogoSimplificado}`;
    const promptFinal = `${contextoCatalogo}\n\nMensaje de la clienta: "${mensajeUsuario}"`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: promptFinal }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7, // Bajamos un poco la temperatura para que sea más concisa
        topP: 0.95,
        maxOutputTokens: 500, // Limitamos los tokens para evitar respuestas largas
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
        ]
      }
    });
    
    return response.text || "Lo siento, la IA no devolvió ninguna respuesta textual.";

  } catch (error) {
    console.error('❌ Error en @google/genai:', error);
    // Si falla con el número, intentamos con el ID como fallback
    throw error;
  }
}

module.exports = { generarRespuesta };
