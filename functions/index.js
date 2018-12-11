/* eslint-disable no-await-in-loop */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const notificationTopic = 'all';

admin.initializeApp();
exports.registerToTopic = functions.https.onRequest(async (req, resp) => {
  try {
    const result = await admin.messaging().subscribeToTopic(req.query.token, notificationTopic);
    console.log(`Successfully subscribed to topic: ${result}`);
  } catch (e) {
    console.warn(`Error subscribing to topic: ${e}`);
    resp.send(`Error subscribing to topic: ${e}`);
  }
});

const waitFn = (ms) => new Promise(resolve => setTimeout(() => resolve(''), ms));

const redditProgrammingHandler = async () => {
  const MIN_SCORE = 500;
  const redditTopic = 'r/programming';
  const pauseBetweenSend = 1000 * 30;

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
      db:{
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
          notification: {click_action: permalink},
          fcm_options: {link: permalink}
        }
      }
    }))
    .map(({notification, db:{id,...payload}}) => () => waitFn(pauseBetweenSend)
      .then(() => console.log('send notification:', notification))
      .then(() => admin.messaging().send(notification))
      .then(() => admin.database().ref(redditTopic).update({[id]: payload})))
    .reduce((acc, cur) => acc.then(() => cur()), Promise.resolve(''))
    .then(() => console.log(`fin: ${start} - ${new Date()}`) || `${start} - ${new Date()}`);
};

exports.redditProgrammingJob = functions.runWith({timeoutSeconds: 540}).pubsub
  .topic('fetch')
  .onPublish(async () => redditProgrammingHandler());

exports.redditProgrammingHttp = functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
  redditProgrammingHandler()
    .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
    .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
);
