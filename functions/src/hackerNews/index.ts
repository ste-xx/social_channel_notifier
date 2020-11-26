import { Feed, FeedEntries, FeedEntry } from "../types";
import { URL } from "url";
import fetch from "node-fetch";
import { writeToDb } from "../db";
import { createHttp, createJob, createRss } from "../createHandlers";

interface HackerNewsResponse {
  hits: {
    title: string;
    points: number;
    objectID: string;
  }[];
}

export const hackerNews: Feed<"hackerNews"> = {
  projectName: "hackerNews",

  onPublish: async (): Promise<void> => {
    const staticConfig = {
      minPoints: 500,
      days: 7
    };

    const currentTimestampInSeconds = parseInt(`${new Date().getTime() / 1000}`, 10);
    const DAY_IN_SECONDS = 86400;
    const lastTimestampInSeconds = currentTimestampInSeconds - DAY_IN_SECONDS * staticConfig.days;

    const url = new URL("https://hn.algolia.com/api/v1/search");
    url.searchParams.append("query", "");
    url.searchParams.append("tags", "story");
    url.searchParams.append("page", "0");
    url.searchParams.append("numericFilters", `created_at_i>${lastTimestampInSeconds},points>${staticConfig.minPoints}`);

    const hits = await fetch(url)
      .then((r) => r.json() as Promise<HackerNewsResponse>)
      .then((r) => r.hits);

    const entries: FeedEntries = hits
      .map((post) => {
        console.log("analyze post:", post);
        return post;
      })
      .map(
        ({ title, points, objectID }): FeedEntry => ({
          id: objectID,
          url: `https://news.ycombinator.com/item?id=${objectID}`,
          created: new Date().getTime(),
          title: `${title} (${points})`,
          body: ""
        })
      );

    await writeToDb(hackerNews, entries);
  },

  createHandlers: () => ({
    ...createJob(hackerNews),
    ...createHttp(hackerNews),
    ...createRss(hackerNews)
  })
};
