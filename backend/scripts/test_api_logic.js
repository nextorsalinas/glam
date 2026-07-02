require('dotenv').config();
const { db } = require('../src/config/firebase');

async function testApiLogic() {
  console.log("Simulando lógica de la ruta /api/services...");
  try {
    const snapshot = await db.collection('services').get();
    const catalogo = [];
    snapshot.forEach(doc => {
      catalogo.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Total de servicios encontrados: ${catalogo.length}`);
    
    const nuevos = catalogo.filter(s => s.updatedAt && s.updatedAt._seconds > 1781700000);
    console.log(`Nuevos servicios detectados (POST-JUNIO3): ${nuevos.length}`);
    
    nuevos.forEach(s => {
      console.log(`- ${s.name} | Category: ${s.category} | Price: ${s.price} | Image: ${s.imageUrl}`);
    });

  } catch (error) {
    console.error('Error simulación:', error);
  }
}

testApiLogic();
