import axios from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";

export type projectName = 'reddit';

interface RedditConfig {
  topic: string,
  minScore: number
}

class RProgramming implements CreateHandlerMixin {

  getConfig: () => Promise<any>;

  getStaticConfig(): RedditConfig{
    return {
      topic: 'r/programming',
      minScore: 500
    };
  }

  getProjectName(): projectName {
    return 'reddit';
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;

  async do(): Promise<Payload[]> {
    const start = new Date();
    const {data: {children: posts}} = await axios.get(`https://www.reddit.com/${this.getStaticConfig().topic}/top/.json`, {params: {t: 'week'}})
      .then(({data}) => data);

    return posts.map(({data}) => data)
      .map(post => {
        console.log('analyze post:', post);
        return post;
      })
      .filter(({score}) => score >= this.getStaticConfig().minScore)
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
