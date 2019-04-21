import axios from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import Payload from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";
import * as admin from "firebase-admin";

export interface GhTrendingConfig {
  language: string,
}

const dbConfig = `config/ghTrending`;

interface GhTrendingProject {
  name: string;
  currentPeriodStars: string,
  description: string,
  url: string
}

interface GhTrendingResponse {
  data: GhTrendingProject[]
}

class GhTrending implements CreateHandlerMixin {
  getProjectName(): string {
    return 'ghTrending';
  }

  onCronTopic(): "fetch-1" {
    return "fetch-1";
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;

  async requestGhTrendingWith(config: GhTrendingConfig): Promise<GhTrendingResponse> {
    const url = 'https://github-trending-api.now.sh/repositories';
    return axios.get(url, {
      params: {
        ...config,
        since: 'weekly'
      }
    });
  }

  async do(): Promise<Payload[]> {
    const configs: GhTrendingConfig[] = await admin.database().ref(dbConfig).once('value').then(snapshot => snapshot.val());
    const results = await Promise.all(configs.map(config => this.requestGhTrendingWith(config)));
    const ghTrendingProjects: GhTrendingProject[] = results.reduce((acc, cur) => [...acc, ...cur.data], []);

    return ghTrendingProjects
      .map(project => {
        console.log('analyze project:', project);
        return project;
      })
      .map(({name, currentPeriodStars, description, url}) => ({
        db: {
          id: name.replace('.', ''),
          url,
          created: new Date().getTime()
        },
        notification: {
          //add language/config
          title: `${this.getProjectName()}: ${name} (${currentPeriodStars})`,
          body: `${description}`,
          link: url
        }
      }));
  }
}

applyMixins(GhTrending, [BaseMixin, CreateHandlerMixin]);
export default GhTrending;
