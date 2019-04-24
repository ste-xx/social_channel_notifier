import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
import Reddit from './reddit';
import Hn from './hackerNews';
import GhTrending from './ghTrending';
import Ph from './productHunt';
import GhMerge from './ghMerge';
import DbClean from './dbClean';

const registerToTopic = functions.https.onRequest(async (req, resp) => {
  try {
    await admin.messaging().subscribeToTopic(req.query.token, 'all');
    console.log(`Successfully subscribed to topic`);
  } catch (e) {
    console.warn(`Error subscribing to topic: ${e}`);
    resp.send(`Error subscribing to topic: ${e}`);
  }
});

Object.assign(exports, {
  registerToTopic,
  ...new Reddit().createHandlers(),
  ...new Hn().createHandlers(),
  ...new Ph().createHandlers(),
  ...new GhTrending().createHandlers(),
  ...new GhMerge().createHandlers(),
  ...new DbClean().createHandlers()
});
