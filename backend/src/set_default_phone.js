const { db } = require('./config/firebase');

console.log('Setting default WhatsApp phone number in Firestore...');
db.collection('settings').doc('whatsapp').set({
  phone: '50379998888'
}, { merge: true })
  .then(() => {
    console.log('✅ Default phone number successfully set to 50379998888.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error setting default phone:', err);
    process.exit(1);
  });
