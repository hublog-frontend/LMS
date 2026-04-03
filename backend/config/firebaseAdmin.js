const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require("./acte-lms-4a2e2-firebase-adminsdk-fbsvc-6521a8b917.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://acte-lms.firebaseio.com" // If using Realtime Database
});

const db = admin.firestore();

module.exports = { admin, db };
