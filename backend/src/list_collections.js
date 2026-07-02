const { db } = require('./config/firebase');
console.log('Listing collections...');
db.listCollections()
  .then(collections => {
    console.log('Collections found:', collections.length);
    collections.forEach(collection => {
      console.log('Collection ID:', collection.id);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
