import {notificationTopic} from '../const';

import axios, {AxiosResponse} from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import SendViaTelegramMixin from "../sendViaTelegramMixin";
import WriteToDbMixin from "../writeToDbMixin";
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";
import * as admin from "firebase-admin";

const dbSecret = `secret/ph`;
const MIN_VOTES = 300;

class PhDaily implements CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin {

  getProjectName(): string {
    return 'phDaily';
  }

  onCronTopic(): "fetch-1" {
    return "fetch-1";
  }

  getDbRef: () => string;
  cleanDb: () => Promise<any>;
  createHandlers: () => any;
  sendViaTelegram: (payload: Payload[], beforeUpdate) => Promise<AxiosResponse<any>[]>;
  writeToDb: (payload: Payload[]) => Promise<void[]>;
  getEntriesFromDb: () => Promise<string>;

  async do(): Promise<string> {
    const start = new Date();
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

    const payload: Payload[] = posts.map((post) => console.log('analyze post:', post) || post)
      .filter(({votes_count}) => votes_count > MIN_VOTES)
      .map(({id, name, tagline, votes_count, discussion_url}): Payload => ({
        db: {
          id,
          url: discussion_url,
          created: new Date().getTime()
        },
        notification: {
          topic: notificationTopic,
          notification: {
            title: `${this.getProjectName()}: ${name} (${votes_count})`,
            body: `${tagline}`,
            link: discussion_url
          }
        }
      }));

    const beforeUpdate = await this.getEntriesFromDb();
    await Promise.all([this.writeToDb(payload), this.sendViaTelegram(payload, beforeUpdate)]);
    const end = `fin: ${start} - ${new Date()}`;
    return console.log(end) || end;
  }
}

applyMixins(PhDaily, [BaseMixin, CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin]);
export default PhDaily;
