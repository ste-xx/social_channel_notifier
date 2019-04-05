import {notificationTopic} from '../const';

import axios, {AxiosResponse} from 'axios/index';
import CreateHandlerMixin, {onCronTopicType} from '../createHandlerMixin';
import applyMixins from "../mixin";
import SendViaTelegramMixin from "../sendViaTelegramMixin";
import WriteToDbMixin from "../writeToDbMixin";
import Payload from "../payload";

export interface GhTrendingParams {
  language: string,
}

class GhTrendingMixin implements CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin {

  //to implement
  getProjectName: () => string;
  getDbRef: () => string;
  getGhTrendingParams: () => GhTrendingParams;
  onCronTopic: () => onCronTopicType;
  //to implement end
  cleanDb: () => Promise<any>;
  createHandlers: () => any;
  sendViaTelegram: (payload: Payload[], beforeUpdate) => Promise<AxiosResponse<any>[]>;
  writeToDb: (payload: Payload[]) => Promise<void[]>;
  getEntriesFromDb: () => Promise<string>;

  async do(): Promise<string> {
    const url = 'https://github-trending-api.now.sh/repositories';
    const start = new Date();
    const {data: projects} = await axios.get(url, {
      params: {
        ...this.getGhTrendingParams(),
        since: 'weekly'
      }
    });

    const payload: Payload[] = projects
      .map(project => console.log('analyze project:', project) || project)
      .map(({name, currentPeriodStars, description, url}) => ({
        db: {
          id: name.replace('.', ''),
          url,
          created: new Date().getTime()
        },
        notification: {
          topic: notificationTopic,
          notification: {
            title: `${this.getProjectName()}: ${name} (${currentPeriodStars})`,
            body: `${description}`,
            link: url
          }
        }
      }));

    await Promise.all([this.writeToDb(payload), this.sendViaTelegram(payload, await this.getEntriesFromDb())]);
    const end = `fin: ${start} - ${new Date()}`;
    return console.log(end) || end;
  }
}

export default GhTrendingMixin;
