const { db } = require('../src/config/firebase');

async function updateDb() {
  console.log('Actualizando Firestore con imágenes y captions de post.txt...');
  try {
    const servicesRef = db.collection('services');
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
    
    const updates = [
      {
        name: "Coleta Alta con Volumen (Ponytail Glam)",
        imageUrl: `${R2_PUBLIC_URL}/images/ponytail_glam.png`,
        tiktokText: "✨ Coleta de Caballo Alta Formal con Rizos ✨ Logra el look perfecto para cualquier ocasión especial con esta coleta alta súper pulida y llena de glamour. ¡Las ondas rizadas y el accesorio de diamantes de imitación le dan un toque de reina! 👑"
      },
      {
        name: "Semirecogido con Lazo de Terciopelo",
        imageUrl: `${R2_PUBLIC_URL}/images/recogido_pulido.png`,
        tiktokText: "Semirrecogido con trenzas y moño de terciopelo Inspiración de peinado elegante y sofisticado para graduación o eventos formales. Un hermoso semirrecogido que combina delicadas trenzas laterales con ondas perfectas y definidas. El toque final lo da un lazo de terciopelo en tono vino/borgoña, ideal para combinar con la toga y darle un estilo estético, romántico y atemporal a tu gran día."
      },
      {
        name: "Trenza Boxeadora Elegante (Bubble Braids)",
        imageUrl: `${R2_PUBLIC_URL}/images/coletas_de_burbuja.png`,
        tiktokText: "Coletas de burbuja (bubble braids) con pedrería y trenzas de raíz 💖✨   La combinación perfecta de elegancia y frescura para su graduación de primaria. Este peinado semirrecogido destaca por sus delicadas trenzas laterales que se unen en un hermoso lazo de terciopelo color vino, ideal para lucir impecable junto a la toga. Un look clásico, pulido y cómodo para que disfrute al máximo su gran día de fin de cursos"
      },
      {
        name: "Trenza Corona Bohemia",
        imageUrl: `${R2_PUBLIC_URL}/images/semirrecogido_con_trenzas.png`,
        tiktokText: "Semirrecogido con trenzas y pinzas florales 🌸🎓  ¡Un look de ensueño y súper tierno para su graduación de primaria! Este peinado semirrecogido combina delicadas trenzas laterales que se unen en la parte trasera con unas coquetas pinzas florales de pedrería. Una opción romántica, elegante y muy cómoda para que luzca impecable en su gran día de fin de cursos."
      },
      {
        name: "Recogido Bajo Minimalista",
        imageUrl: `${R2_PUBLIC_URL}/images/chongo_bajo_pulido.png`,
        tiktokText: "Chongo bajo pulido con tocado floral ✨🎓 La definición de elegancia y sofisticación para su graduación de primaria. Este peinado destaca por un chongo bajo impecablemente pulido, acompañado de sutiles mechones sueltos al frente que enmarcan el rostro con mucha suavidad. El toque final lo aporta un delicado accesorio floral de pedrería, logrando un look formal, maduro y perfecto en su cambio de ciclo."
      }
    ];

    for (const update of updates) {
      const snapshot = await servicesRef.where('name', '==', update.name).get();
      if (snapshot.empty) {
        console.log(`❌ No se encontró en BD: ${update.name}`);
        continue;
      }
      let docId;
      snapshot.forEach(doc => docId = doc.id);
      
      await servicesRef.doc(docId).update({
        imageUrl: update.imageUrl,
        tiktokText: update.tiktokText
      });
      console.log(`✅ ¡Éxito! Se actualizó ${update.name}`);
    }
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
updateDb();
