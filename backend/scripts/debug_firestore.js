require('dotenv').config();
const { db } = require('../src/config/firebase');

async function checkServices() {
  console.log("Revisando últimos servicios agregados a Firestore...");
  try {
    const snapshot = await db.collection('services')
      .orderBy('updatedAt', 'desc')
      .limit(10)
      .get();

    if (snapshot.empty) {
      console.log("No se encontraron servicios.");
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.id + " => " + JSON.stringify(doc.data(), null, 2);
      console.log(data);
    });
  } catch (e) {
    console.error("Error al consultar Firestore:", e.message);
  }
}

checkServices();
