const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.registerToTopic = functions.https.onRequest(async (req, resp) => {
  try {
    const result = await admin.messaging().subscribeToTopic(req.query.token, 'reddit-programming');
    console.log(`Successfully subscribed to topic: ${result}`);
  } catch (e) {
    console.warn(`Error subscribing to topic: ${e}`);
    resp.send(`Error subscribing to topic: ${e}`);
  }
});

exports.helloWorld = functions.https.onRequest(async (req, resp) => {
  console.log('Send broadcast message');
  try {
    const data = {
      topic: "reddit-programming",
      notification: {
        body: "This is a Firebase Cloud Messaging Topic Message!",
        title: "FCM Message"
      }
    };

    const result = await admin.messaging().send(data);
    console.log(`Successfully sent message: ${result}`);
    resp.send(`Successfully sent message: ${result}`);

  } catch (e) {
    console.warn(`Error sending message: ${e}`);
    resp.send(`Error sending message: ${e}`);
  }
});
