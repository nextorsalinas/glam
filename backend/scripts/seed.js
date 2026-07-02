const { db } = require('../src/config/firebase');

const graduationServices = [
  {
    name: "Trenza Corona Bohemia",
    description: "Una trenza elegante que rodea la cabeza como una corona, perfecta para un look romántico y juvenil. Ideal para cabellos largos o medios.",
    price: 450,
    duration: 45,
    category: "peinado",
    tags: ["trenza", "bohemio", "romantico", "corona", "cabello largo", "cabello medio"],
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Ondas de Agua Texturizadas",
    description: "Ondas sueltas y marcadas que aportan volumen y movimiento. Un estilo clásico y atemporal que nunca falla en graduaciones.",
    price: 550,
    duration: 60,
    category: "peinado",
    tags: ["ondas", "suelto", "volumen", "clasico", "elegante"],
    imageUrl: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Recogido Bajo Minimalista",
    description: "Un moño bajo y pulido, ideal para chicas que buscan un look sofisticado y maduro. Combina perfecto con cuellos altos o vestidos descubiertos.",
    price: 600,
    duration: 50,
    category: "peinado",
    tags: ["recogido", "moño", "minimalista", "sofisticado", "pulido"],
    imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Semirecogido con Lazo de Terciopelo",
    description: "La mitad del cabello recogido con un elegante lazo, dejando el resto caer en ondas suaves. Muy tendencia en 2026.",
    price: 500,
    duration: 45,
    category: "peinado",
    tags: ["semirecogido", "lazo", "accesorio", "tendencia", "juvenil"],
    imageUrl: "https://images.unsplash.com/photo-1595475685799-d419e5c1d6b0?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Trenza Boxeadora Elegante (Bubble Braids)",
    description: "Dos trenzas voluminosas estilo burbuja. Un look muy moderno, divertido y que dura toda la noche intacto.",
    price: 400,
    duration: 40,
    category: "peinado",
    tags: ["trenza", "burbuja", "moderno", "divertido", "duradero"],
    imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Coleta Alta con Volumen (Ponytail Glam)",
    description: "Una cola de caballo alta y muy pulida con ondas en las puntas. Aporta altura y estiliza el rostro.",
    price: 450,
    duration: 40,
    category: "peinado",
    tags: ["coleta", "cola de caballo", "alto", "volumen", "glam", "estiliza"],
    imageUrl: "https://images.unsplash.com/photo-1631214500115-598fc2cb8d2d?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Ondas Surferas (Beach Waves)",
    description: "Ondas muy naturales y deshechas, dando la impresión de un peinado sin esfuerzo. Ideal para graduaciones de día.",
    price: 350,
    duration: 35,
    category: "peinado",
    tags: ["ondas", "natural", "deshecho", "dia", "casual"],
    imageUrl: "https://images.unsplash.com/photo-1560938459-7171e548d420?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Recogido Alto Despeinado (Messy Bun)",
    description: "Un moño alto con mechones sueltos alrededor del rostro. Perfecto para un look fresco y relajado pero arreglado.",
    price: 500,
    duration: 45,
    category: "peinado",
    tags: ["recogido", "moño alto", "despeinado", "fresco", "relajado"],
    imageUrl: "https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Maquillaje 'No-Makeup' Glow",
    description: "Maquillaje muy natural resaltando la luminosidad de la piel. (Up-selling perfecto para acompañar cualquier peinado)",
    price: 300,
    duration: 30,
    category: "maquillaje",
    tags: ["maquillaje", "natural", "glow", "luminoso", "upselling"],
    imageUrl: "https://images.unsplash.com/photo-1512496015851-a1c8ce041285?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Manicura Express Brillante",
    description: "Limado y esmaltado tradicional con brillo o glitter. (Servicio complementario ideal para la foto sosteniendo el diploma)",
    price: 200,
    duration: 20,
    category: "unas",
    tags: ["manicura", "unas", "brillo", "express", "glitter", "upselling"],
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13fee7a328?q=80&w=600&auto=format&fit=crop"
  }
];

async function seedDatabase() {
  console.log('Iniciando carga de catálogo en glam-database...');
  
  try {
    const servicesCollection = db.collection('services');
    
    // Eliminamos datos existentes (opcional, útil para pruebas)
    const existingDocs = await servicesCollection.get();
    const batchDelete = db.batch();
    existingDocs.forEach(doc => {
      batchDelete.delete(doc.ref);
    });
    if (!existingDocs.empty) {
      await batchDelete.commit();
      console.log(`Se eliminaron ${existingDocs.size} servicios anteriores.`);
    }

    // Insertamos los 10 servicios
    const batchInsert = db.batch();
    graduationServices.forEach(service => {
      const docRef = servicesCollection.doc(); // Auto-ID
      batchInsert.set(docRef, service);
    });
    
    await batchInsert.commit();
    console.log(`¡Éxito! Se insertaron ${graduationServices.length} servicios en la colección 'services'.`);
    process.exit(0);
  } catch (error) {
    console.error('Error poblando la base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();
