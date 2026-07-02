const { db } = require('./config/firebase');

console.log('Iniciando prueba de lectura de Firestore...');
db.collection('services').get()
  .then(snapshot => {
    console.log('Éxito! Número de documentos encontrados:', snapshot.size);
    snapshot.forEach(doc => {
      console.log(`Documento ID: ${doc.id}`);
      console.log('Datos:', JSON.stringify(doc.data(), null, 2));
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Error al leer de Firestore:', err);
    process.exit(1);
  });
