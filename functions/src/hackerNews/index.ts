import axios from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import Payload, {DbEntries} from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";

export type projectName = 'hackerNews';
const DAY_IN_SECONDS = 86400;

interface HNConfig {
  minPoints: number,
  days: number
}

class HN implements CreateHandlerMixin {
  getConfig: () => Promise<any>;

  getStaticConfig(): HNConfig {
    return {
      minPoints: 500,
      days: 7
    };
  }

  getProjectName(): projectName {
    return 'hackerNews';
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<DbEntries[]>;

  async do(): Promise<Payload[]> {
    const {minPoints, days} = this.getStaticConfig();
    const currentTimestampInSeconds = parseInt(`${new Date().getTime() / 1000}`, 10);
    const lastTimestampInSeconds = currentTimestampInSeconds - DAY_IN_SECONDS * days;
    console.log(`timestamp in seconds: ${lastTimestampInSeconds}`);
    const {data: {hits}} = await axios.get(`https://hn.algolia.com/api/v1/search`, {
      params: {
        query: '',
        tags: 'story',
        page: 0,
        numericFilters: `created_at_i>${lastTimestampInSeconds},points>${minPoints}`
      }
    });

    return hits.map((post) => {
      console.log('analyze post:', post);
      return post;
    })
      .map(({title, points, objectID}): Payload => ({
        id: objectID,
        url: `https://news.ycombinator.com/item?id=${objectID}`,
        created: new Date().getTime(),
        title: `${this.getProjectName()}: (${points})`,
        body: `${title}`
      }));
  }
}

applyMixins(HN, [BaseMixin, CreateHandlerMixin]);
export default HN;
