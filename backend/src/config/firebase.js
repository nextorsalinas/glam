const { Firestore } = require('@google-cloud/firestore');

const projectId = process.env.FIREBASE_PROJECT_ID || 'alexandra-styles';
const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';

const config = {
  projectId,
};

if (databaseId !== '(default)') {
  config.databaseId = databaseId;
}

const db = new Firestore(config);

module.exports = { db };
