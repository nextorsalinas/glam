const { db } = require('./config/firebase');
console.log('Fetching unique reservation contacts...');
db.collection('reservations').get()
  .then(snapshot => {
    console.log('Total reservations:', snapshot.size);
    const contacts = new Map();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.phone && data.userName) {
        contacts.set(data.phone, data.userName);
      }
    });
    console.log('Unique Contacts:');
    contacts.forEach((name, phone) => {
      console.log(`- ${name}: ${phone}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
