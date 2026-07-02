const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({}); 
    console.log(ai);
  } catch(e) {
    console.log("Error 1:", e.message);
  }
}
test();
