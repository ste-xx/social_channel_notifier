const admin = require('firebase-admin');
const {deleteAfter, pauseBetweenSend} = require('./const.js');

const waitFn = (ms) => new Promise(resolve => setTimeout(() => resolve(''), ms));

module.exports = {
  wait: waitFn,
  cleanDb: async (dbRef) => {
    const db = admin.database().ref(dbRef);
    const inDb = await db.once('value').then(snapshot => snapshot.val());
    return Promise.all(Object.entries(inDb)
      .filter(([key, {created = 0}]) => created < (new Date().getTime() - deleteAfter))
      .map(([key]) => key)
      .map((key) => console.log(`delete: ${key}`) || key)
      .map(key => admin.database().ref(`${dbRef}/${key}`).remove()));
  },

  /**
   *
   * @param relevants {
   *   db: {
   *     id: mandatory
   *     created: mandatory
   *     ...
   *   },
   *   notification: {  mandatory firebase notification see docs
   *    ...
   *   }
   * }
   * @param dbRef mandatory
   * @returns {Promise<any[]>}
   */
  writeDbAndSend: async (relevants, dbRef) => {
    const db = admin.database().ref(dbRef);
    const oldEntries = await db.once('value').then(snapshot => snapshot.val());

    const dbPromises = relevants.map(({db: {id, ...payload}}) =>
      console.log(`write id: ${id} with payload`, payload) ||
      db.update({[id]: payload}));

    const messagesPromise = relevants
      .filter(({db: {id}}) => oldEntries === null || typeof oldEntries[id] === 'undefined')
      .map(({notification}) => (idx) => (idx === 0 ? Promise.resolve() : waitFn(pauseBetweenSend))
        .then(() => console.log('send notification:', notification))
        .then(() => admin.messaging().send(notification)))
      .reduce((acc, fn, idx) => acc.then(() => fn(idx)), Promise.resolve(''));

    return Promise.all([...dbPromises, messagesPromise]);
  }
};
