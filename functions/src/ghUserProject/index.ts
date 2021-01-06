import { Feed, FeedEntries, FeedEntry } from "../types";
import { createHttp, createJob, createRss } from "../createHandlers";
import { getConfig, getSecret, writeToDb } from "../db";
import fetch from "node-fetch";

const createQueryPartial = (user: string) =>  `{
  ${user}: search(query: "${user}", type: USER, first: 1) {
    edges {
      node {
        ... on Organization {
          repositories(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
            __typename
            edges {
              node {
                id
                name
                description
              }
            }
          }
        }
      }
    }
  }
}
`;

interface ConfigEntry {
  name: string;
}

export type GhUserProjectResponse = {
  data: Record<string, {
    edges: {
      node: {
        repositories: {
          edges: {
            node: {
              id: string;
              name: string;
              description: string | null,
            }
          }[]
        }
      }
    }[]
  }>
};

export const ghUserProject: Feed<"ghUserProject"> = {
  projectName: "ghUserProject",

  onPublish: async (): Promise<void> => {
    const config = await getConfig<"ghUserProject", ConfigEntry[]>(ghUserProject);
    const token = await getSecret<"ghUserProject", string>(ghUserProject);
    const query = `
      query {
        ${config.map(({name }) => createQueryPartial(name)).join("\n")}
      }
    `;

    const result: GhUserProjectResponse = await fetch("https://api.github.com/graphql", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        query
      })
    }).then((r) => r.json() as Promise<GhUserProjectResponse>);

    const entries: FeedEntries = Object.entries(result.data).flatMap(([username, entry]) =>
      entry.edges.flatMap((e) =>
        e.node.repositories.edges.map(({ node: { id, name, description } }) => ({
          id,
          url: `https://github/${username}/${name}`,
          created: 0,
          title: `${username}: ${name}`,
          body: description ?? ""
        }))
      )
    );

    await writeToDb(ghUserProject, entries);
  },

  createHandlers: () => ({
    ...createJob(ghUserProject),
    ...createHttp(ghUserProject),
    ...createRss(ghUserProject)
  })
};
