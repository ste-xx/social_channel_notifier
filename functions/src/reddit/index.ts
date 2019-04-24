import axios from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";

export type projectName = 'r_programming';

const MIN_SCORE = 500;
const redditTopic = 'r/programming';


class RProgramming implements CreateHandlerMixin {

  async getConfig(): Promise<[]> {
    return [];
  }

  getProjectName(): projectName {
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
      .map(post => {
        console.log('analyze post:', post);
        return post;
      })
      .filter(({score}) => score >= MIN_SCORE)
      .map(({id, title, score, permalink}): Payload => ({
        db: {
          id,
          url: `https://reddit.com${permalink}`,
          created: new Date().getTime()
        },
        notification: {
          title: `${this.getProjectName()}: (${score})`,
          body: `${title}`,
          link: `https://reddit.com${permalink}`
        }
      }));
  }
}

applyMixins(RProgramming, [BaseMixin, CreateHandlerMixin]);
export default RProgramming;
