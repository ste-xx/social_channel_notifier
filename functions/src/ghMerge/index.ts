import { Feed, FeedEntries, FeedEntry } from "../types";
import { createHttp, createJob, createRss } from "../createHandlers";
import { getConfig, getSecret, writeToDb } from "../db";
import fetch from "node-fetch";

const fields = `{
  id
  name
  owner {
    url
  }
  pullRequests(last: 30, states: MERGED,orderBy: {field: UPDATED_AT, direction: ASC}) {
   nodes {
      title
      id
      updatedAt
    }
  }
}`;

interface ConfigEntry {
  alias?: string;
  name: string;
  owner: string;
}

type GhMergeResponse = Record<
  string,
  {
    data: {
      id: string;
      name: string;
      owner: {
        url: string;
      };
      pullRequests: {
        nodes: {
          title: string;
          id: string;
          updatedAt: string;
        }[];
      };
    };
  }
>;

export const ghMerge: Feed<"ghMerge"> = {
  projectName: "ghMerge",

  onPublish: async (): Promise<void> => {
    const config = await getConfig<"ghMerge", ConfigEntry[]>(ghMerge);
    const token = await getSecret<"ghMerge", string>(ghMerge);

    const inner = config.map((entry) => `${entry.alias ?? entry.name}: repository (name: "${entry.name}", owner: "${entry.owner}") ${fields}`).join("\n");

    const query = `
      query {
        ${inner}
      }
    `;

    const result: GhMergeResponse = await fetch("https://api.github.com/graphql", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query
      })
    }).then((r) => r.json() as Promise<GhMergeResponse>);

    const entries: FeedEntries = Object.entries(result.data)
      .map(([_, response]): FeedEntry[] =>
        response.pullRequests.nodes.map(
          ({ id, title }): FeedEntry => ({
            id,
            url: response.owner.url,
            created: new Date().getTime(),
            title: response.name,
            body: title
          })
        )
      )
      .flat();

    await writeToDb(ghMerge, entries);
  },

  createHandlers: () => ({
    ghMerge_Job: createJob(ghMerge),
    ghMerge_Http: createHttp(ghMerge),
    ghMerge_Rss: createRss(ghMerge)
  })
};
