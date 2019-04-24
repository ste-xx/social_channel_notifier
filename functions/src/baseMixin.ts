import * as admin from "firebase-admin";
import Payload from "./payload";

import {projectName as ghMergedPullRequestProjectName} from './ghMergedPullRequest'
import {projectName as ghTrendingProjectName} from './ghTrending';
import {projectName as hnProjectName} from './hn';
import {projectName as phDailyProjectName} from './phDaily';
import {projectName as rProgrammingProjectName} from './reddit';

export type projectName = ghMergedPullRequestProjectName
  | ghTrendingProjectName
  | hnProjectName
  | phDailyProjectName
  | rProgrammingProjectName

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

  async getEntriesFromDb(): Promise<any> {
    const db = admin.database().ref(this.getDbRef());
    return db.once('value').then(snapshot => snapshot.val());
  }
};
