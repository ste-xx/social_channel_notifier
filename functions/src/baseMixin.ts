import * as admin from "firebase-admin";
import Payload from "./payload";

export default class BaseMixin {
  do: () => Promise<Payload[]>;
  getProjectName: () => string;

  getDbRef(): string {
    return `data/${this.getProjectName()}`;
  }

  async getEntriesFromDb(): Promise<any> {
    const db = admin.database().ref(this.getDbRef());
    return db.once('value').then(snapshot => snapshot.val());
  }
};
