import {AxiosResponse} from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import applyMixins from "../mixin";
import SendViaTelegramMixin from "../sendViaTelegramMixin";
import WriteToDbMixin from "../writeToDbMixin";
import Payload from "../payload";
import GhTrendingMixin, {GhTrendingParams} from "./mixin";
import BaseMixin from "../baseMixin";

class GhTrendingJs implements GhTrendingMixin, CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin {
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
  cleanDb: () => Promise<any>;
  createHandlers: () => any;
  sendViaTelegram: (payload: Payload[], beforeUpdate) => Promise<AxiosResponse<any>[]>;
  writeToDb: (payload: Payload[]) => Promise<void[]>;
  getEntriesFromDb: () => Promise<string>;
  do: () => Promise<string>;
}

applyMixins(GhTrendingJs, [BaseMixin, CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin, GhTrendingMixin]);
export default GhTrendingJs;
