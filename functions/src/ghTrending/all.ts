import {AxiosResponse} from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import applyMixins from "../mixin";
import SendViaTelegramMixin from "../sendViaTelegramMixin";
import WriteToDbMixin from "../writeToDbMixin";
import Payload from "../payload";
import GhTrendingMixin, {GhTrendingParams} from "./mixin";
import BaseMixin from "../baseMixin";

class GhTrendingAll implements GhTrendingMixin, CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin {
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
  cleanDb: () => Promise<any>;
  createHandlers: () => any;
  sendViaTelegram: (payload: Payload[], beforeUpdate) => Promise<AxiosResponse<any>[]>;
  writeToDb: (payload: Payload[]) => Promise<void[]>;
  getEntriesFromDb: () => Promise<string>;
  do: () => Promise<string>;
}

applyMixins(GhTrendingAll, [BaseMixin, CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin, GhTrendingMixin]);
export default GhTrendingAll;
