const { VertexAI } = require('@google-cloud/vertexai');

async function test() {
  try {
    const vertex_ai = new VertexAI({project: 'glam-graduacion-ai', location: 'us-central1'});
    const generativeModel = vertex_ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    const resp = await generativeModel.generateContent('hola');
    console.log(resp.response.candidates[0].content.parts[0].text);
  } catch(e) {
    console.error('US-CENTRAL1 ERROR:', e.message);
  }
}
test();
