import {notificationTopic} from '../const';

import axios from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";

const MIN_SCORE = 500;
const redditTopic = 'r/programming';


class RProgramming implements CreateHandlerMixin {

  getProjectName(): string {
    return 'r_programming';
  }

  onCronTopic(): "fetch-1" {
    return "fetch-1";
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;

  async do(): Promise<Payload[]> {
    const start = new Date();
    const {data: {children: posts}} = await axios.get(`https://www.reddit.com/${redditTopic}/top/.json`, {params: {t: 'week'}})
      .then(({data}) => data);

    return posts.map(({data}) => data)
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
  }
}

applyMixins(RProgramming, [BaseMixin, CreateHandlerMixin]);
export default RProgramming;
