import axios from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import Payload, {DbEntries} from "../payload";
import applyMixins from "../mixin";
import BaseMixin from "../baseMixin";

export type projectName = 'ghTrending';

export interface GhTrendingConfig {
  language: string,
}

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
  getProjectName(): projectName {
    return 'ghTrending';
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<DbEntries[]>;
  getConfig: () => Promise<GhTrendingConfig[]>;

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
    const results = await Promise.all((await this.getConfig()).map(config => this.requestGhTrendingWith(config)));
    const ghTrendingProjects: GhTrendingProject[] = results.reduce((acc, cur) => [...acc, ...cur.data], []);

    return ghTrendingProjects
      .map(project => {
        console.log('analyze project:', project);
        return project;
      })
      .map(({name, currentPeriodStars, description, url}) => ({
        id: name.replace('.', ''),
        url,
        created: new Date().getTime(),
        //add language/config
        title: `${name} (${currentPeriodStars})`,
        body: `${description}`
      }));
  }
}

applyMixins(GhTrending, [BaseMixin, CreateHandlerMixin]);
export default GhTrending;
