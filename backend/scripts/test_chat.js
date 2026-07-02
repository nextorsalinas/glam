const { db } = require('../src/config/firebase');
const { generarRespuesta } = require('../src/services/ai.service');

async function testChat() {
  console.log('Iniciando prueba del Cerebro IA (@google/genai)...');
  try {
    // 1. Obtener catálogo
    const snapshot = await db.collection('services').get();
    const catalogo = [];
    snapshot.forEach(doc => {
      catalogo.push({ id: doc.id, ...doc.data() });
    });
    console.log(`Catálogo cargado: ${catalogo.length} peinados.`);

    // 2. Probar IA
    const mensaje = "Hola, mi hija se gradúa la próxima semana de sexto. Buscamos un peinado recogido, ¿qué opciones tienen y qué precio?";
    console.log(`\nMensaje de prueba: "${mensaje}"\n`);
    
    console.log('Generando respuesta con gemini-3.1-flash-lite en us-central1...');
    const respuesta = await generarRespuesta(mensaje, catalogo);
    
    console.log('\n--- RESPUESTA DE LA IA ---');
    console.log(respuesta);
    console.log('--------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

testChat();
