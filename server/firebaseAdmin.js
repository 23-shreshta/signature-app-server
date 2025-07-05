// server/firebaseAdmin.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or use a service account
  });
}

module.exports = admin;
