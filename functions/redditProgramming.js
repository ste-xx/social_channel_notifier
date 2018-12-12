const {notificationTopic, pauseBetweenSend} = require('./const.js');
const {wait, cleanDb} = require('./util.js');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const projectName = 'r_programming';
const dbRef = `data/${projectName}`;

const MIN_SCORE = 500;
const redditTopic = 'r/programming';

const handler = async () => {
  const db = admin.database().ref(dbRef);

  console.log(`Fetch ${projectName}`);
  const start = new Date();
  const {data: {children: posts}} = await axios.get(`https://www.reddit.com/${redditTopic}/top/.json`, {params: {t: 'week'}})
    .then(({data}) => data);
  const inDb = await db.once('value').then(snapshot => snapshot.val());

  return posts.map(({data}) => data)
    .map(post => console.log('analyze post:', post) || post)
    .filter(({score}) => score >= MIN_SCORE)
    .filter(({id}) => inDb === null || typeof inDb[id] === 'undefined')
    .map(({id, title, score, permalink}) => ({
      db: {
        id,
        title,
        link: `https://reddit.com${permalink}`,
        created: new Date().getTime()
      },
      notification: {
        topic: notificationTopic,
        notification: {
          title: `${projectName}: (${score})`,
          body: `${title}`
        },
        webpush: {
          notification: {
            tag: id,
            click_action: `https://reddit.com${permalink}`
          },
          fcm_options: {link: `https://reddit.com${permalink}`}
        }
      }
    }))
    .map(({notification, db: {id, ...payload}}) => (idx) => (idx === 0 ? Promise.resolve() : wait(pauseBetweenSend))
      .then(() => console.log('send notification:', notification))
      .then(() => admin.messaging().send(notification))
      .then(() => db.update({[id]: payload})))
    .reduce((acc, fn, idx) => acc.then(() => fn(idx)), Promise.resolve(''))
    .then(() => console.log(`fin: ${start} - ${new Date()}`) || `${start} - ${new Date()}`);
};

module.exports = {
  gcFn: {
    [`${projectName}_DbCleanUp`]: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('clean')
      .onPublish(async () => cleanDb(dbRef)),

    [`${projectName}_Job`]: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('fetch')
      .onPublish(async () => handler()),

    [`${projectName}_Http`]: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
      handler()
        .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
        .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
    )
  }
};
