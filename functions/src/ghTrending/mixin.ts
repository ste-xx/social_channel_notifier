import {notificationTopic} from '../const';

import axios from 'axios/index';
import CreateHandlerMixin, {onCronTopicType} from '../createHandlerMixin';
import Payload from "../payload";

export interface GhTrendingParams {
  language: string,
}

class GhTrendingMixin implements CreateHandlerMixin {

  //to implement
  getProjectName: () => string;
  getDbRef: () => string;
  getGhTrendingParams: () => GhTrendingParams;
  onCronTopic: () => onCronTopicType;
  //to implement end
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;

  async do(): Promise<Payload[]> {
    const url = 'https://github-trending-api.now.sh/repositories';
    const start = new Date();
    const {data: projects} = await axios.get(url, {
      params: {
        ...this.getGhTrendingParams(),
        since: 'weekly'
      }
    });

    return projects
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
  }
}

export default GhTrendingMixin;
