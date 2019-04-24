import axios from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";
import * as admin from "firebase-admin";

export type projectName = 'phDaily';
const dbSecret = `secret/ph`;
const MIN_VOTES = 300;

class PhDaily implements CreateHandlerMixin {

  async getConfig(): Promise<[]> {
    return [];
  }

  getProjectName(): projectName{
    return 'phDaily';
  }

  onCronTopic(): "fetch-1" {
    return "fetch-1";
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;

  async do(): Promise<Payload[]> {

    const {client_id, client_secret} = await admin.database().ref(dbSecret).once('value').then(snapshot => snapshot.val());
    const {data: {access_token}} = await axios(`https://api.producthunt.com/v1/oauth/token`, {
      method: 'post',
      data: {
        client_id,
        client_secret,
        grant_type: "client_credentials"
      }
    });
    console.log(`logged in ${access_token}`);

    const {data: {posts}} = await axios(`https://api.producthunt.com/v1/posts`, {
      method: 'get',
      headers: {
        Accept: 'application/json',
        "Content-Type": 'application/json',
        Host: 'api.producthunt.com',
        Authorization: `Bearer ${access_token}`
      }
    });

    return posts.map((post) => {
      console.log('analyze post:', post);
      return post;
    })
      .filter(({votes_count}) => votes_count > MIN_VOTES)
      .map(({id, name, tagline, votes_count, discussion_url}): Payload => ({
        db: {
          id: `${id}`,
          url: discussion_url,
          created: new Date().getTime()
        },
        notification: {
          title: `${this.getProjectName()}: ${name} (${votes_count})`,
          body: `${tagline}`,
          link: discussion_url
        }
      }));
  }
}

applyMixins(PhDaily, [BaseMixin, CreateHandlerMixin]);
export default PhDaily;
