import { Feed, FeedEntries } from "./types";
import * as functions from "firebase-functions";
import { CloudFunction, HttpsFunction } from "firebase-functions/lib/cloud-functions";
import { Message } from "firebase-functions/lib/providers/pubsub";
import { getEntries } from "./db";

export const createJob = <T extends string>(feed: Feed<T>): CloudFunction<Message> => functions.runWith({ timeoutSeconds: 540 }).pubsub.topic(feed.projectName).onPublish(feed.onPublish);

export const createHttp = <T extends string>(feed: Feed<T>): HttpsFunction =>
  functions.runWith({ timeoutSeconds: 540 }).https.onRequest(
    async (req, resp): Promise<void> => {
      const result = await feed.onPublish();
      resp.send(`done \n ${JSON.stringify(result, null, 2)}`);
    }
  );

export const createRss = <T extends string>(feed: Feed<T>): HttpsFunction =>
  functions.runWith({ timeoutSeconds: 540 }).https.onRequest(
    async (req, resp): Promise<void> => {
      const entries: FeedEntries = Object.values(await getEntries(feed));
      entries.sort((a, b) => a.created - b.created);

      const jsonFeed = {
        version: "https://jsonfeed.org/version/1",
        title: `Scnr: ${feed.projectName}`,
        feed_url: `https://us-central1-social-channel-notifier.cloudfunctions.net/${feed.projectName}_Rss`,
        items: entries.reverse().map(({ id, title, url, body }) => ({
          id,
          title: `${title} ${body}`,
          url
        }))
      };

      resp.send(JSON.stringify(jsonFeed, null, 2));
    }
  );
