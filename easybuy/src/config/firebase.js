const { app, auth, db } = require('./firebase.ts');

module.exports = { app, auth, db, default: db };
