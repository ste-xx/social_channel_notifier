const admin = require('firebase-admin');
const {deleteAfter} = require('./const.js');
const telegramDbSecret = `secret/telegram`;
const waitFn = (ms) => new Promise(resolve => setTimeout(() => resolve(''), ms));
const axios = require('axios');
const channel = '@scnrr';

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

    const apiToken = await admin.database().ref(telegramDbSecret).once('value').then(snapshot => snapshot.val());
    const telegramPromises = relevants
      .filter(({db: {id}}) => oldEntries === null || typeof oldEntries[id] === 'undefined')
      .map(
      ({
         notification: {
           notification: {title, body},
           webpush: {fcm_options: {link}}
         }
       }) =>
        axios.post(`https://api.telegram.org/bot${apiToken}/sendMessage`, {
          chat_id: channel,
          text: `[${title}: ${body}](${link})`,
          parse_mode: 'Markdown'
        }));

    return Promise.all([...dbPromises, ...telegramPromises]);
  }
};
