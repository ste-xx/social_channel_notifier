import { CloudFunction, HttpsFunction } from "firebase-functions/lib/cloud-functions";
import { Message } from "firebase-functions/lib/providers/pubsub";

export interface FeedEntry {
  id: string;
  url: string;
  created: number;
  title: string;
  body: string;
}

export type FeedEntries = FeedEntry[];

export interface DbEntries {
  [key: string]: FeedEntry;
}

export type Job<T extends string> = {
  [P in `${T}_Job`]: CloudFunction<Message>;
};

export type Http<T extends string> = {
  [P in `${T}_Http`]: HttpsFunction;
};

export type Rss<T extends string> = {
  [P in `${T}_Rss`]: HttpsFunction;
};

export type Feed<T extends string> = {
  projectName: T;
  onPublish: () => Promise<void>;
  createHandlers: () => Job<T> & Http<T> & Rss<T>;
};
