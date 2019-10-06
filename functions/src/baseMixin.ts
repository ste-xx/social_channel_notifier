import * as admin from "firebase-admin";
import Payload, {DbEntries} from "./payload";

import {projectName as ghMergedPullRequestProjectName} from './ghMerge'
import {projectName as ghTrendingProjectName} from './ghTrending';
import {projectName as hnProjectName} from './hackerNews';
import {projectName as phDailyProjectName} from './productHunt';
import {projectName as rProgrammingProjectName} from './reddit';
import {projectName as dbCleanProjectName} from "./dbClean";

export type projectName = ghMergedPullRequestProjectName
  | ghTrendingProjectName
  | hnProjectName
  | phDailyProjectName
  | rProgrammingProjectName
  | dbCleanProjectName

export default class BaseMixin {
  do: () => Promise<Payload[]>;
  getProjectName: () => projectName;

  getDbRef(): string {
    return `data/${this.getProjectName()}`;
  }

  async getConfig(): Promise<any> {
    return admin
      .database()
      .ref(`config/${this.getProjectName()}`)
      .once('value').then(snapshot => snapshot.val());
  }

  async getEntriesFromDb(): Promise<DbEntries[]> {
    const db = admin.database().ref(this.getDbRef());
    return db.once('value').then(snapshot => snapshot.val());
  }
};
