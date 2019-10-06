import axios from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import Payload, {DbEntries} from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";
import * as admin from "firebase-admin";

export type projectName = 'productHunt';

interface PhConfig {
  minVotes: number;
}

class Ph implements CreateHandlerMixin {

  getConfig: () => Promise<any>;

  getStaticConfig(): PhConfig {
    return {
      minVotes: 300
    };
  }


  getProjectName(): projectName {
    return 'productHunt';
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<DbEntries[]>;


  async getAccessToken(): Promise<string> {
    const {client_id, client_secret} = await admin.database().ref(`secret/${this.getProjectName()}`).once('value').then(snapshot => snapshot.val());
    const {data: {access_token}} = await axios(`https://api.producthunt.com/v1/oauth/token`, {
      method: 'post',
      data: {
        client_id,
        client_secret,
        grant_type: "client_credentials"
      }
    });
    console.log(`logged in ${access_token}`);
    return access_token;
  }

  async do(): Promise<Payload[]> {
    const accessToken = await this.getAccessToken();
    const {data: {posts}} = await axios(`https://api.producthunt.com/v1/posts`, {
      method: 'get',
      headers: {
        Accept: 'application/json',
        "Content-Type": 'application/json',
        Host: 'api.producthunt.com',
        Authorization: `Bearer ${accessToken}`
      }
    });

    return posts.map((post) => {
      console.log('analyze post:', post);
      return post;
    })
      .filter(({votes_count}) => votes_count > this.getStaticConfig().minVotes)
      .map(({id, name, tagline, votes_count, discussion_url}): Payload => ({
        id: `${id}`,
        url: discussion_url,
        created: new Date().getTime(),
        title: `${name} (${votes_count})`,
        body: `${tagline}`
      }));
  }
}

applyMixins(Ph, [BaseMixin, CreateHandlerMixin]);
export default Ph;
