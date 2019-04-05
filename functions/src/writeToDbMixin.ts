import * as admin from "firebase-admin";
import BaseMixin from "./baseMixin";
import Payload from "./payload";

export default class WriteToDbMixin implements BaseMixin {
  do: () => Promise<string>;
  getProjectName: () => string;
  getDbRef: () => any;
  getEntriesFromDb: () => Promise<string>;
  async writeToDb (payload: Payload[]): Promise<void[]> {
    const db = admin.database().ref(this.getDbRef());
    return Promise.all(payload.map(({db: {id, ...payload}}) =>
      console.log(`write id: ${id} with payload`, payload) ||
      db.update({[id]: payload})));
  };
}
