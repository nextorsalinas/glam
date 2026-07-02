const { db } = require('./config/firebase');

console.log('Setting active WhatsApp phone number in Firestore to 525513176307...');
db.collection('settings').doc('whatsapp').set({
  phone: '525513176307'
}, { merge: true })
  .then(() => {
    console.log('✅ Phone number successfully set to 525513176307.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error setting phone:', err);
    process.exit(1);
  });
