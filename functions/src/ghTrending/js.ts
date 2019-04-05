import CreateHandlerMixin from '../createHandlerMixin';
import applyMixins from "../mixin";
import Payload from "../payload";
import GhTrendingMixin, {GhTrendingParams} from "./mixin";
import BaseMixin from "../baseMixin";

class GhTrendingJs implements GhTrendingMixin, CreateHandlerMixin {
  getGhTrendingParams(): GhTrendingParams {
    return {
      language: 'javascript'
    };
  };

  getProjectName(): string {
    return 'gh_trending_js';
  }

  onCronTopic(): "fetch-2" {
    return "fetch-2";
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;
  do: () => Promise<Payload[]>;
}

applyMixins(GhTrendingJs, [BaseMixin, CreateHandlerMixin, GhTrendingMixin]);
export default GhTrendingJs;
