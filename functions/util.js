const admin = require('firebase-admin');
const {deleteAfter} = require('./const.js');

module.exports = {
  wait: (ms) => new Promise(resolve => setTimeout(() => resolve(''), ms)),
  cleanDb: async (dbRef) => {
    const db = admin.database().ref(dbRef);
    const inDb = await db.once('value').then(snapshot => snapshot.val());
    return Promise.all(Object.entries(inDb)
      .filter(([key, {created = 0}]) => created < (new Date().getTime() - deleteAfter))
      .map(([key]) => key)
      .map((key) => console.log(`delete: ${key}`) || key)
      .map(key => admin.database().ref(`${dbRef}/${key}`).remove()));
  }
};
