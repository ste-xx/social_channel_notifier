import CreateHandlerMixin from '../createHandlerMixin';
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import fetch from 'node-fetch';
import * as admin from "firebase-admin";

interface GhMergedConfig {
  alias?: string,
  name: string,
  owner: string
}

export type projectName = 'ghMerge';

const dbSecret = `secret/gh`;


interface GhPullRequests {
  title: string,
  id: string
  updatedAt: string
}

interface GhMergeResponse {
  name: string
  owner: {
    url: string
  }
  pullRequests: {
    nodes: GhPullRequests []
  }
}


class GhMerge implements CreateHandlerMixin {

  getProjectName(): projectName {
    return 'ghMerge';
  }

  onCronTopic(): "fetch-1" {
    return "fetch-1";
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;
  getConfig: () => Promise<GhMergedConfig[]>;

  // @ts-ignore
  async createClient(): Promise<ApolloClient> {
    const token = await admin.database().ref(dbSecret).once('value').then(snapshot => snapshot.val());
    return new ApolloClient({
      uri: 'https://api.github.com/graphql',
      fetch,
      request: async (operation): Promise<void> => {
        operation.setContext({
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
      },
    });
  }

  async do(): Promise<Payload[]> {
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

    const query = `
      query {
        ${(await this.getConfig()).map(({alias, name, owner}) => `${alias ? alias : name}: repository (name: "${name}", owner: "${owner}") ${fields} \n`)}
      }
    `;

    const client = await this.createClient();
    const {data} = await client.query({
      query: gql(query),
    });

    return Object.entries(data).map(([key, value]) => {
      const response = value as GhMergeResponse;
      return response.pullRequests.nodes.map((pullRequest => {
        return {
          db: {
            id: pullRequest.id,
            url: `${response.owner.url}/${response.name}`,
            created: new Date().getTime()
          },
          notification: {
            title: `GH Merged: ${response.name}`,
            body: pullRequest.title,
            link: `${response.owner.url}/${response.name}`
          }
        };
      }));
    }).reduce((cur, acc) => {
      return [...acc, ...cur];
    }, []);
  }
}

applyMixins(GhMerge, [BaseMixin, CreateHandlerMixin]);
export default GhMerge;
