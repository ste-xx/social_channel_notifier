import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
import RedditProgramming from './reddit';
import Hn from './hn';
import GhTrending from './ghTrending';
import PhDaily from './phDaily';
import GhMerge from './ghMergedPullRequest';

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
  ...new RedditProgramming().createHandlers(),
  ...new Hn().createHandlers(),
  ...new PhDaily().createHandlers(),
  ...new GhTrending().createHandlers(),
  ...new GhMerge().createHandlers()
});
