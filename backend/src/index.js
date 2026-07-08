require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./config/firebase');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const PORT = process.env.PORT || 8080;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  }
});

app.use(cors());
app.use(express.json());

const { generarRespuesta } = require('./services/ai.service');
const { initializeWhatsApp, getWhatsAppStatus, logoutWhatsApp } = require('./services/whatsapp.service');

// Iniciar WhatsApp Web en background
// initializeWhatsApp();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend de Graduaciones activo' });
});

app.post('/api/upload/presigned', async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is required' });

    const key = `uploads/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    res.json({ presignedUrl: url, key });
  } catch (err) {
    console.error('Error generating presigned url:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});
app.get('/api/services', async (req, res) => {
  try {
    const snapshot = await db.collection('services').get();
    const catalogo = [];
    snapshot.forEach(doc => {
      catalogo.push({ id: doc.id, ...doc.data() });
    });
    res.json(catalogo);
  } catch (error) {
    console.error('Error en /api/services:', error);
    res.status(500).json({ error: 'No se pudo obtener el catálogo' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    // 1. Obtener el catálogo de Firestore
    const snapshot = await db.collection('services').get();
    const catalogo = [];
    snapshot.forEach(doc => {
      catalogo.push({ id: doc.id, ...doc.data() });
    });

    // 2. Enviar el mensaje y catálogo a la IA
    const respuestaIA = await generarRespuesta(message, catalogo);

    // 3. Devolver la respuesta
    res.json({ response: respuestaIA });
    
  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ 
      error: 'Hubo un error procesando el chat',
      details: error.message 
    });
  }
});

// --- RUTAS WHATSAPP BOT ---
app.get('/api/whatsapp/status', async (req, res) => {
  try {
    const statusData = getWhatsAppStatus();
    if (!statusData.phone) {
      const settingsDoc = await db.collection('settings').doc('whatsapp').get();
      if (settingsDoc.exists) {
        statusData.phone = settingsDoc.data().phone || '';
      }
    }
    res.json(statusData);
  } catch (error) {
    console.error('Error al obtener status de WhatsApp:', error);
    res.json(getWhatsAppStatus());
  }
});

app.post('/api/whatsapp/settings', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'El teléfono es requerido' });
    }
    const cleanPhone = phone.replace(/\D/g, '');
    await db.collection('settings').doc('whatsapp').set({ phone: cleanPhone }, { merge: true });
    res.json({ success: true, message: 'Número de WhatsApp guardado con éxito' });
  } catch (error) {
    console.error('Error al guardar settings:', error);
    res.status(500).json({ error: 'No se pudo guardar el número' });
  }
});

app.post('/api/whatsapp/logout', async (req, res) => {
  await logoutWhatsApp();
  res.json({ success: true, message: 'Desconectado de WhatsApp' });
});

app.post('/api/whatsapp/start', (req, res) => {
  initializeWhatsApp(true);
  res.json({ success: true, message: 'Iniciando conexión...' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
