require('dotenv').config();
const { db } = require('../src/config/firebase');

async function checkServices() {
  console.log("Revisando todos los servicios en Firestore...");
  try {
    const snapshot = await db.collection('services').get();

    if (snapshot.empty) {
      console.log("No se encontraron servicios.");
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id} | Name: ${data.name} | ImageUrl: ${data.imageUrl}`);
    });
  } catch (e) {
    console.error("Error al consultar Firestore:", e.message);
  }
}

checkServices();
