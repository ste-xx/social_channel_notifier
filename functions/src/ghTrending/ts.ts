import {AxiosResponse} from 'axios/index';
import CreateHandlerMixin from '../createHandlerMixin';
import applyMixins from "../mixin";
import SendViaTelegramMixin from "../sendViaTelegramMixin";
import WriteToDbMixin from "../writeToDbMixin";
import Payload from "../payload";
import GhTrendingMixin, {GhTrendingParams} from "./mixin";
import BaseMixin from "../baseMixin";

class GhTrendingTs implements GhTrendingMixin, CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin {
  getGhTrendingParams(): GhTrendingParams {
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
  cleanDb: () => Promise<any>;
  createHandlers: () => any;
  sendViaTelegram: (payload: Payload[], beforeUpdate) => Promise<AxiosResponse<any>[]>;
  writeToDb: (payload: Payload[]) => Promise<void[]>;
  getEntriesFromDb: () => Promise<string>;
  do: () => Promise<string>;
}

applyMixins(GhTrendingTs, [BaseMixin, CreateHandlerMixin, WriteToDbMixin, SendViaTelegramMixin, GhTrendingMixin]);
export default GhTrendingTs;
