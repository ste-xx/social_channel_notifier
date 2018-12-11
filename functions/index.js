const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const {notificationTopic} = require('./const.js');

const registerToTopic = functions.https.onRequest(async (req, resp) => {
  try {
    await admin.messaging().subscribeToTopic(req.query.token, notificationTopic);
    console.log(`Successfully subscribed to topic`);
  } catch (e) {
    console.warn(`Error subscribing to topic: ${e}`);
    resp.send(`Error subscribing to topic: ${e}`);
  }
});

Object.assign(exports, {
  registerToTopic,
  ...require('./redditProgramming.js'),
  ...require('./hackerNews.js')
});
