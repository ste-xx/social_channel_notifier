import {DbEntries, Feed, FeedEntries} from "./types";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {CloudFunction, HttpsFunction} from "firebase-functions/lib/cloud-functions";
import {Message} from "firebase-functions/lib/providers/pubsub";

export const createJob = <T extends string>(feed: Feed<T>): CloudFunction<Message> => functions.runWith({timeoutSeconds: 540}).pubsub
  .topic(feed.projectName)
  .onPublish(feed.onPublish)

export const createHttp = <T extends string>(feed: Feed<T>): HttpsFunction => functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp): Promise<void> => {
  await feed.onPublish();
  resp.send('done');
});

export const createRss = <T extends string>(feed: Feed<T>): HttpsFunction => functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp): Promise<void> => {
  const db = admin.database().ref(`data/${feed.projectName}`);
  const entries: FeedEntries = Object.values(await db.once('value').then(snapshot => snapshot.val() as DbEntries));
  entries.sort((a, b) => a.created - b.created);

  const jsonFeed = {
    version: "https://jsonfeed.org/version/1",
    title: `Scnr: ${feed.projectName}`,
    feed_url: `https://us-central1-social-channel-notifier.cloudfunctions.net/${feed.projectName}_Rss`,
    items: entries.reverse().map(({id, title, url, body}) => ({
      id,
      title: `${title} ${body}`,
      url
    }))
  };

  resp.send(JSON.stringify(jsonFeed, null, 2));
});
