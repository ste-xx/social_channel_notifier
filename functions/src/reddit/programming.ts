import {notificationTopic} from '../const';

import axios, {AxiosResponse} from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import SendViaTelegramMixin from "../sendViaTelegramMixin";
import WriteToDbMixin from "../writeToDbMixin";
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";

const MIN_SCORE = 500;
const redditTopic = 'r/programming';


class RProgramming implements CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin {

  getProjectName(): string {
    return 'r_programming';
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
    const {data: {children: posts}} = await axios.get(`https://www.reddit.com/${redditTopic}/top/.json`, {params: {t: 'week'}})
      .then(({data}) => data);

    const payload: Payload[] = posts.map(({data}) => data)
      .map(post => console.log('analyze post:', post) || post)
      .filter(({score}) => score >= MIN_SCORE)
      .map(({id, title, score, permalink}): Payload => ({
        db: {
          id,
          url: `https://reddit.com${permalink}`,
          created: new Date().getTime()
        },
        notification: {
          topic: notificationTopic,
          notification: {
            title: `${this.getProjectName()}: (${score})`,
            body: `${title}`,
            link: `https://reddit.com${permalink}`
          }
        }
      }));

    await Promise.all([this.writeToDb(payload), this.sendViaTelegram(payload, await this.getEntriesFromDb())]);
    const end = `fin: ${start} - ${new Date()}`;
    return console.log(end) || end;
  }
}

applyMixins(RProgramming, [BaseMixin, CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin]);
export default RProgramming;
