import { Feed, FeedEntries, Http, Job, Rss } from "./types";
import * as functions from "firebase-functions";
import { getEntries } from "./db";

export const createJob = <T extends string>(feed: Feed<T>): Job<T> => {
  return {
    [`${feed.projectName}_Job`]: functions.runWith({ timeoutSeconds: 540 }).pubsub.topic(feed.projectName).onPublish(feed.onPublish)
  } as Job<T>;
};

export const createHttp = <T extends string>(feed: Feed<T>): Http<T> => {
  return {
    [`${feed.projectName}_Http`]: functions.runWith({ timeoutSeconds: 540 }).https.onRequest(
      async (req, resp): Promise<void> => {
        const result = await feed.onPublish();
        resp.send(`done \n ${JSON.stringify(result, null, 2)}`);
      }
    )
  } as Http<T>;
};

export const createRss = <T extends string>(feed: Feed<T>): Rss<T> => {
  return {
    [`${feed.projectName}_Rss`]: functions.runWith({ timeoutSeconds: 540 }).https.onRequest(
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
    )
  } as Rss<T>;
};
