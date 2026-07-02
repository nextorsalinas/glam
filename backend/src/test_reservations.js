const { db } = require('./config/firebase');
console.log('Querying reservations...');
db.collection('reservations').limit(5).get()
  .then(snapshot => {
    console.log('Reservations found:', snapshot.size);
    snapshot.forEach(doc => {
      console.log(doc.id, JSON.stringify(doc.data(), null, 2));
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
