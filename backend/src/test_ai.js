const { generarRespuesta } = require('./services/ai.service');

const dummyCatalog = [
  { name: 'Peinado de Prueba', price: 100, description: 'Un peinado de prueba para validar la IA.' }
];

console.log('Iniciando prueba de generación con Gemini...');
generarRespuesta('Hola, me gustaría saber qué peinados tienen disponibles', dummyCatalog)
  .then(respuesta => {
    console.log('🎉 Respuesta generada con éxito:');
    console.log(respuesta);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal en la prueba de IA:', err);
    process.exit(1);
  });
