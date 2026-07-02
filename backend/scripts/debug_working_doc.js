require('dotenv').config();
const { db } = require('../src/config/firebase');

async function debugDoc() {
  try {
    const name = "Chongo bajo pulido";
    const snapshot = await db.collection('services').where('name', '==', name).get();
    if (snapshot.empty) {
      console.log("No se encontró el documento.");
      return;
    }
    snapshot.forEach(doc => {
      console.log("ID:", doc.id);
      console.log("Data:", JSON.stringify(doc.data(), null, 2));
    });
  } catch (e) {
    console.error(e);
  }
}
debugDoc();
