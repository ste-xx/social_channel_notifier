import * as functions from 'firebase-functions';
import * as admin  from 'firebase-admin';

admin.initializeApp();
import {notificationTopic} from './const';
import RedditProgramming from './reddit/programming';
import Hn from './hn/hn';
import GhTrendingJs from './ghTrending/js';
import GhTrendingTs from './ghTrending/ts';
import GhTrendingAll from './ghTrending/all';
import PhDaily from './phDaily/phDaily';

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
    ...new GhTrendingTs().createHandlers(),
    ...new RedditProgramming().createHandlers(),
    ...new Hn().createHandlers(),
    ...new GhTrendingJs().createHandlers(),
    ...new GhTrendingAll().createHandlers(),
    ...new PhDaily().createHandlers(),
});
