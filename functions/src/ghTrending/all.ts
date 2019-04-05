import CreateHandlerMixin from '../createHandlerMixin';
import applyMixins from "../mixin";
import Payload from "../payload";
import GhTrendingMixin, {GhTrendingParams} from "./mixin";
import BaseMixin from "../baseMixin";

class GhTrendingAll implements GhTrendingMixin, CreateHandlerMixin{
  getGhTrendingParams(): GhTrendingParams {
    return {
      language: ''
    };
  };

  getProjectName(): string {
    return 'gh_trending_all';
  }

  onCronTopic(): "fetch-3" {
    return "fetch-3";
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;
  do: () => Promise<Payload[]>;
}

applyMixins(GhTrendingAll, [BaseMixin, CreateHandlerMixin, GhTrendingMixin]);
export default GhTrendingAll;
