import CreateHandlerMixin from '../createHandlerMixin';
import applyMixins from "../mixin";
import Payload from "../payload";
import GhTrendingMixin, {GhTrendingConfigs} from "./mixin";
import BaseMixin from "../baseMixin";

class GhTrendingTs implements GhTrendingMixin, CreateHandlerMixin{
  getGhTrendingParams(): GhTrendingConfigs {
    return {
      language: 'typescript'
    };
  };

  getProjectName(): string {
    return 'gh_trending_ts';
  }

  onCronTopic(): "fetch-2" {
    return "fetch-2";
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;
  do: () => Promise<Payload[]>;
}

applyMixins(GhTrendingTs, [BaseMixin, CreateHandlerMixin, GhTrendingMixin]);
export default GhTrendingTs;
