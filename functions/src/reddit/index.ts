import fetch from 'node-fetch';
import {URL} from 'url';
import {Feed, FeedEntries, FeedEntry} from "../types";
import {writeToDb} from "../db";
import {createHttp, createJob, createRss} from "../createHandlers";

interface RedditResponse {
  data: {
    children: {
      data: {
        id: string;
        title: string;
        score: number;
        permalink: string;
      }
    }[]
  }
}

export const rProgramming: Feed<'reddit'> = {
  projectName: 'reddit',
  onPublish: async (): Promise<void> => {
    const staticConfig = {
      topic: 'r/programming',
      minScore: 500
    };

    const url = new URL(`https://www.reddit.com/${staticConfig.topic}/top/.json`);
    url.searchParams.append('t', 'week')

    const posts = await fetch(url)
      .then(r => r.json() as Promise<RedditResponse>)
      .then(r => r.data.children);

    const entries: FeedEntries = posts
      .map(({data}) => data)
      .map(post => {
        console.log('analyze post:', post);
        return post;
      })
      .filter(({score}) => score >= staticConfig.minScore)
      .map(({id, title, score, permalink}): FeedEntry => ({
        id,
        url: `https://reddit.com${permalink}`,
        created: new Date().getTime(),
        title: `${title} (${score})`,
        body: ``
      }));
    await writeToDb(rProgramming, entries);
  },

  createHandlers: () => ({
    reddit_Job: createJob(rProgramming),
    reddit_Http: createHttp(rProgramming),
    reddit_Rss: createRss(rProgramming)
  })
}
