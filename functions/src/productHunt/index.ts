import { Feed, FeedEntries, FeedEntry } from "../types";
import fetch from "node-fetch";
import { getSecret, writeToDb } from "../db";
import { createHttp, createJob, createRss } from "../createHandlers";

interface ProductHuntResponse {
  posts: {
    votes_count: number;
    id: number;
    name: string;
    tagline: string;
    discussion_url: string;
  }[];
}

interface Secret {
  client_id: string;
  client_secret: string;
}

export const productHunt: Feed<"productHunt"> & { getAccessToken: () => Promise<string> } = {
  projectName: "productHunt",

  getAccessToken: async (): Promise<string> => {
    const { client_id, client_secret } = await getSecret<"productHunt", Secret>(productHunt);

    return await fetch("https://api.producthunt.com/v1/oauth/token", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Host: "api.producthunt.com"
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        grant_type: "client_credentials"
      })
    })
      .then((r) => r.json() as Promise<{ access_token: string }>)
      .then((r) => r.access_token);
  },

  onPublish: async (): Promise<void> => {
    const staticConfig = {
      minVotes: 300
    };
    const token = await productHunt.getAccessToken();

    console.warn(token);

    const posts = await fetch("https://api.producthunt.com/v1/posts", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Host: "api.producthunt.com",
        Authorization: `Bearer ${token}`
      }
    })
      .then((r) => r.json() as Promise<ProductHuntResponse>)
      .then((r) => r.posts);
    console.warn(posts);
    const entries: FeedEntries = posts
      .map((post) => {
        console.log("analyze post:", post);
        return post;
      })
      .filter(({ votes_count }) => votes_count > staticConfig.minVotes)
      .map(
        ({ id, name, tagline, votes_count, discussion_url }): FeedEntry => ({
          id: `${id}`,
          url: discussion_url,
          created: new Date().getTime(),
          title: `${name} (${votes_count})`,
          body: `${tagline}`
        })
      );

    await writeToDb(productHunt, entries);
  },

  createHandlers: () => ({
    productHunt_Job: createJob(productHunt),
    productHunt_Http: createHttp(productHunt),
    productHunt_Rss: createRss(productHunt)
  })
};
