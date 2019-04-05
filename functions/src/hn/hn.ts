import {notificationTopic} from '../const';

import axios, {AxiosResponse} from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import SendViaTelegramMixin from "../sendViaTelegramMixin";
import WriteToDbMixin from "../writeToDbMixin";
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";

const MIN_POINTS = 500;
const DAY_IN_SECONDS = 86400;

class HN implements CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin {

  getProjectName(): string {
    return 'HN';
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
    const currentTimestampInSeconds = parseInt(`${new Date().getTime() / 1000}`, 10);
    const lastWeekTimestampInSeconds = currentTimestampInSeconds - DAY_IN_SECONDS * 7;
    console.log(`timestamp in seconds: ${lastWeekTimestampInSeconds}`);

    const start = new Date();
    const {data: {hits}} = await axios.get(`https://hn.algolia.com/api/v1/search`, {
      params: {
        query: '',
        tags: 'story',
        page: 0,
        numericFilters: `created_at_i>${lastWeekTimestampInSeconds},points>${MIN_POINTS}`
      }
    });

    const payload: Payload[] = hits.map((post) => console.log('analyze post:', post) || post)
      .map(({title, points, objectID}): Payload => ({
        db: {
          id: objectID,
          url: `https://news.ycombinator.com/item?id=${objectID}`,
          created: new Date().getTime()
        },
        notification: {
          topic: notificationTopic,
          notification: {
            title: `${this.getProjectName()}: (${points})`,
            body: `${title}`,
            link: `https://news.ycombinator.com/item?id=${objectID}`
          }
        }
      }));


    const beforeUpdate = await this.getEntriesFromDb();
    await Promise.all([this.writeToDb(payload), this.sendViaTelegram(payload, beforeUpdate)]);
    const end = `fin: ${start} - ${new Date()}`;
    return console.log(end) || end;
  }
}

applyMixins(HN, [BaseMixin, CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin]);
export default HN;
