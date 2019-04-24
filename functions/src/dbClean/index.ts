import CreateHandlerMixin from '../createHandlerMixin';
import applyMixins from "../mixin";
import BaseMixin, {projectName} from "../baseMixin";
import Payload from "../payload";
import * as admin from "firebase-admin";

const DAY_IN_MS = 86400000;
export type projectName = 'dbClean';

interface DbCleanConfig {
  days: number,
  ref: projectName
}

class DbClean implements CreateHandlerMixin {

  getProjectName(): projectName {
    return 'dbClean';
  }

  getDbRef: () => string;
  createHandlers: () => any;
  getEntriesFromDb: () => Promise<string>;
  getConfig: () => Promise<DbCleanConfig[]>;

  async do(): Promise<Payload[]> {
    const configs = await this.getConfig();
    await Promise.all(configs.map(async config => {
      const inDb = await admin.database()
        .ref(`data/${config.ref}`)
        .once('value')
        .then(snapshot => snapshot.val());

      const deleteAfter = DAY_IN_MS * config.days;

      await Promise.all(Object.entries(inDb)
      // @ts-ignore
        .filter(([, {created = 0}]) => created < (new Date().getTime() - deleteAfter))
        .map(([key]) => key)
        .map((key) => {
          console.log(`delete: ${key}`);
          return key;
        })
        .map(key => admin.database().ref(`data/${config.ref}/${key}`).remove()));
      //do clean
    }));
    return [];
  }
}

applyMixins(DbClean, [BaseMixin, CreateHandlerMixin]);
export default DbClean;
