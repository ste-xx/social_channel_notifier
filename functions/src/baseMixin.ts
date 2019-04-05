import * as admin from "firebase-admin";

export default class BaseMixin {
  do: () => Promise<string>;
  getProjectName: () => string;

  getDbRef(): string {
    return `data/${this.getProjectName()}`;
  }

  async getEntriesFromDb(): Promise<any> {
    const db = admin.database().ref(this.getDbRef());
    return db.once('value').then(snapshot => snapshot.val());
  }
};
