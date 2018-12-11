const {notificationTopic, pauseBetweenSend} = require('./const.js');
const {wait} = require('./util.js');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const MIN_SCORE = 500;
const redditTopic = 'r/programming';

const handler = async () => {
  console.log(`Fetch ${redditTopic}`);
  const start = new Date();
  const {data: {children: posts}} = await axios.get(`https://www.reddit.com/${redditTopic}/top/.json`, {params: {t: 'week'}})
    .then(({data}) => data);
  const inDb = await admin.database().ref(redditTopic).once('value').then(snapshot => snapshot.val());

  return posts.map(({data}) => data)
    .map(post => console.log('analyze post:', post) || post)
    .filter(({score}) => score >= MIN_SCORE)
    .filter(({id}) => inDb === null || typeof inDb[id] === 'undefined')
    .map(({id, title, score, permalink}) => ({
      db: {
        id,
        title,
        permalink
      },
      notification: {
        topic: notificationTopic,
        notification: {
          title: `${redditTopic} (${score})`,
          body: `${title}`
        },
        webpush: {
          notification: {click_action: `https://reddit.com${permalink}`},
          fcm_options: {link: `https://reddit.com${permalink}`}
        }
      }
    }))
    .map(({notification, db: {id, ...payload}}) => () => wait(pauseBetweenSend)
      .then(() => console.log('send notification:', notification))
      .then(() => admin.messaging().send(notification))
      .then(() => admin.database().ref(redditTopic).update({[id]: payload})))
    .reduce((acc, cur) => acc.then(() => cur()), Promise.resolve(''))
    .then(() => console.log(`fin: ${start} - ${new Date()}`) || `${start} - ${new Date()}`);
};


module.exports = {
  redditProgrammingJob: functions.runWith({timeoutSeconds: 540}).pubsub
    .topic('fetch')
    .onPublish(async () => handler()),

  redditProgrammingHttp: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
    handler()
      .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
      .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
  )
};