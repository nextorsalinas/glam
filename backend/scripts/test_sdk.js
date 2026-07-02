const { GoogleGenAI } = require('@google/genai');

try {
  const ai1 = new GoogleGenAI({ vertexai: { project: 'glam-graduacion-ai', location: 'us-central1' } });
  console.log("Success with lower case vertexai");
} catch(e) { console.log("Fail 1:", e.message); }

try {
  const ai2 = new GoogleGenAI({ vertexAI: { project: 'glam-graduacion-ai', location: 'us-central1' } });
  console.log("Success with upper case VertexAI");
} catch(e) { console.log("Fail 2:", e.message); }

try {
  const ai3 = new GoogleGenAI({ project: 'glam-graduacion-ai', location: 'us-central1' });
  console.log("Success with root");
} catch(e) { console.log("Fail 3:", e.message); }
