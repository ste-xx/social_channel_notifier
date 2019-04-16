import axios from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";

const MIN_POINTS = 500;
const DAY_IN_SECONDS = 86400;

class HN implements CreateHandlerMixin {

  getProjectName(): string {
    return 'HN';
  }

  onCronTopic(): "fetch-1" {
    return "fetch-1";
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;

  async do(): Promise<Payload[]> {
    const currentTimestampInSeconds = parseInt(`${new Date().getTime() / 1000}`, 10);
    const lastWeekTimestampInSeconds = currentTimestampInSeconds - DAY_IN_SECONDS * 7;
    console.log(`timestamp in seconds: ${lastWeekTimestampInSeconds}`);

    const {data: {hits}} = await axios.get(`https://hn.algolia.com/api/v1/search`, {
      params: {
        query: '',
        tags: 'story',
        page: 0,
        numericFilters: `created_at_i>${lastWeekTimestampInSeconds},points>${MIN_POINTS}`
      }
    });

    return hits.map((post) => console.log('analyze post:', post) || post)
      .map(({title, points, objectID}): Payload => ({
        db: {
          id: objectID,
          url: `https://news.ycombinator.com/item?id=${objectID}`,
          created: new Date().getTime()
        },
        notification: {
          title: `${this.getProjectName()}: (${points})`,
          body: `${title}`,
          link: `https://news.ycombinator.com/item?id=${objectID}`
        }
      }));
  }
}

applyMixins(HN, [BaseMixin, CreateHandlerMixin]);
export default HN;
