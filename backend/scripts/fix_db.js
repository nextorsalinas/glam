const { db } = require('../src/config/firebase');

async function fixDb() {
  console.log('Restaurando descripciones y añadiendo nuevos items...');
  try {
    const servicesRef = db.collection('services');
    
    // 1. Restaurar items existentes
    const restores = [
      {
        name: "Coleta Alta con Volumen (Ponytail Glam)",
        imageUrl: "https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?q=80&w=600&auto=format&fit=crop",
        tiktokText: null
      },
      {
        name: "Semirecogido con Lazo de Terciopelo",
        imageUrl: "https://images.unsplash.com/photo-1595475685799-d419e5c1d6b0?q=80&w=600&auto=format&fit=crop",
        tiktokText: null
      },
      {
        name: "Trenza Boxeadora Elegante (Bubble Braids)",
        imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop",
        tiktokText: null
      },
      {
        name: "Recogido Bajo Minimalista",
        imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600&auto=format&fit=crop",
        tiktokText: null
      },
      {
        name: "Trenza Corona Bohemia",
        imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop",
        tiktokText: '¡El peinado perfecto para tu graduación SÍ existe! ✨🎓 Si buscas un look romántico, elegante y con vibras bohemias, este semirrecogido con media corona trenzada es TODO lo que necesitas.'
      }
    ];

    for (const update of restores) {
      const snapshot = await servicesRef.where('name', '==', update.name).get();
      if (!snapshot.empty) {
        let docId;
        snapshot.forEach(doc => docId = doc.id);
        await servicesRef.doc(docId).update({
          imageUrl: update.imageUrl,
          tiktokText: update.tiktokText
        });
        console.log(`✅ Restaurado: ${update.name}`);
      }
    }

    // 2. Agregar los nuevos items
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
    
    const newItems = [
      {
        name: "Ponytail Glam",
        description: "Coleta de Caballo Alta Formal con Rizos",
        imageUrl: `${R2_PUBLIC_URL}/images/ponytail_glam.png`,
        tiktokText: "✨ Coleta de Caballo Alta Formal con Rizos ✨ Logra el look perfecto para cualquier ocasión especial con esta coleta alta súper pulida y llena de glamour. ¡Las ondas rizadas y el accesorio de diamantes de imitación le dan un toque de reina! 👑",
        price: 450,
        duration: 40,
        category: "peinado",
        tags: ["coleta", "formal", "rizos"]
      },
      {
        name: "recogido pulido",
        description: "Semirrecogido con trenzas y moño de terciopelo",
        imageUrl: `${R2_PUBLIC_URL}/images/recogido_pulido.png`,
        tiktokText: "Semirrecogido con trenzas y moño de terciopelo Inspiración de peinado elegante y sofisticado para graduación o eventos formales. Un hermoso semirrecogido que combina delicadas trenzas laterales con ondas perfectas y definidas. El toque final lo da un lazo de terciopelo en tono vino/borgoña, ideal para combinar con la toga y darle un estilo estético, romántico y atemporal a tu gran día.",
        price: 500,
        duration: 45,
        category: "peinado",
        tags: ["semirrecogido", "trenzas", "elegante"]
      },
      {
        name: "Coletas de burbuja",
        description: "Coletas de burbuja con pedrería",
        imageUrl: `${R2_PUBLIC_URL}/images/coletas_de_burbuja.png`,
        tiktokText: "Coletas de burbuja (bubble braids) con pedrería y trenzas de raíz 💖✨   La combinación perfecta de elegancia y frescura para su graduación de primaria. Este peinado semirrecogido destaca por sus delicadas trenzas laterales que se unen en un hermoso lazo de terciopelo color vino, ideal para lucir impecable junto a la toga. Un look clásico, pulido y cómodo para que disfrute al máximo su gran día de fin de cursos",
        price: 400,
        duration: 40,
        category: "peinado",
        tags: ["coletas", "burbuja", "infantil"]
      },
      {
        name: "Semirrecogido con trenzas",
        description: "Semirrecogido con trenzas y pinzas florales",
        imageUrl: `${R2_PUBLIC_URL}/images/semirrecogido_con_trenzas.png`,
        tiktokText: "Semirrecogido con trenzas y pinzas florales 🌸🎓  ¡Un look de ensueño y súper tierno para su graduación de primaria! Este peinado semirrecogido combina delicadas trenzas laterales que se unen en la parte trasera con unas coquetas pinzas florales de pedrería. Una opción romántica, elegante y muy cómoda para que luzca impecable en su gran día de fin de cursos.",
        price: 450,
        duration: 45,
        category: "peinado",
        tags: ["semirrecogido", "trenzas", "flores"]
      },
      {
        name: "Chongo bajo pulido",
        description: "Chongo bajo pulido con tocado floral",
        imageUrl: `${R2_PUBLIC_URL}/images/chongo_bajo_pulido.png`,
        tiktokText: "Chongo bajo pulido con tocado floral ✨🎓 La definición de elegancia y sofisticación para su graduación de primaria. Este peinado destaca por un chongo bajo impecablemente pulido, acompañado de sutiles mechones sueltos al frente que enmarcan el rostro con mucha suavidad. El toque final lo aporta un delicado accesorio floral de pedrería, logrando un look formal, maduro y perfecto en su cambio de ciclo.",
        price: 600,
        duration: 50,
        category: "peinado",
        tags: ["chongo", "pulido", "elegante"]
      }
    ];

    const batch = db.batch();
    for (const item of newItems) {
      const existing = await servicesRef.where('name', '==', item.name).get();
      if (existing.empty) {
        const docRef = servicesRef.doc();
        batch.set(docRef, item);
        console.log(`✅ Creado nuevo item: ${item.name}`);
      } else {
        let docId;
        existing.forEach(doc => docId = doc.id);
        batch.update(servicesRef.doc(docId), item);
        console.log(`✅ Actualizado item: ${item.name}`);
      }
    }
    await batch.commit();

    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
fixDb();
