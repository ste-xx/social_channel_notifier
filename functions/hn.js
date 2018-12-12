const {notificationTopic, pauseBetweenSend, deleteAfter} = require('./const.js');
const {wait} = require('./util.js');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const MIN_POINTS = 500;
const DAY_IN_SECONDS = 86400;
const dbRef = `data/HN`;

const handler = async () => {

  const database = admin.database().ref(dbRef);

  const currentTimestampInSeconds = parseInt(new Date().getTime() / 1000, 10);
  const lastWeekTimestampInSeconds = currentTimestampInSeconds - DAY_IN_SECONDS * 7;
  console.log(`timestamp in seconds: ${lastWeekTimestampInSeconds}`);

  const start = new Date();
  const {data: {hits}} = await axios.get(`https://hn.algolia.com/api/v1/search`, {
    params: {
      query: '',
      tags: 'story',
      page: 0,
      numericFilters: `created_at_i>${lastWeekTimestampInSeconds},points>${MIN_POINTS}`
    }
  });

  const inDb = await database.once('value').then(snapshot => snapshot.val());
  return hits.map((post) => console.log('analyze post:', post) || post)
    .filter(({objectID}) => inDb === null || typeof inDb[objectID] === 'undefined')
    .map(({title, points, objectID}) => ({
      db: {
        objectID,
        title,
        link: `https://news.ycombinator.com/item?id=${objectID}`,
        created: new Date().getTime()
      },
      notification: {
        topic: notificationTopic,
        notification: {
          title: `HN (${points})`,
          body: `${title}`
        },
        webpush: {
          notification: {
            tag: objectID,
            click_action: `https://news.ycombinator.com/item?id=${objectID}`
          },
          fcm_options: {link: `https://news.ycombinator.com/item?id=${objectID}`}
        }
      }
    }))
    .map(({notification, db: {objectID, ...payload}}) => () => wait(pauseBetweenSend)
      .then(() => console.log('send notification:', notification))
      .then(() => admin.messaging().send(notification))
      .then(() => database.update({[objectID]: payload})))
    .reduce((acc, cur) => acc.then(() => cur()), Promise.resolve(''))
    .then(() => console.log(`fin: ${start} - ${new Date()}`) || `${start} - ${new Date()}`);
};


const cleanDb = async () => {
  const db = admin.database().ref(dbRef);
  const inDb = await db.once('value').then(snapshot => snapshot.val());
  return Promise.all(Object.entries(inDb)
    .filter(([key, {created = 0}]) => created < (new Date().getTime() - deleteAfter))
    .map(([key]) => key)
    .map((key) => console.log(`delete: ${key}`) || key)
    .map(key => admin.database().ref(`${dbRef}/${key}`).remove()));
};

module.exports = {
  gcFn: {
    hackerNewsCleanDbJob: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('clean')
      .onPublish(async () => cleanDb()),

    hackerNewsJob: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('fetch-1')
      .onPublish(async () => handler()),

    hackerNewsHttp: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
      handler()
        .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
        .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
    )
  }
};
