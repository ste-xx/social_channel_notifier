import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {deleteAfter} from "./const";
import BaseMixin from "./baseMixin";

export type onCronTopicType = 'fetch-1' | 'fetch-2' | 'fetch-3';

export default class CreateHandlerMixin implements BaseMixin {
  do: () => Promise<string>;
  onCronTopic: () => onCronTopicType;
  getDbRef: () => any;
  getProjectName: () => string;
  getEntriesFromDb: () => Promise<string>;

  async cleanDb(): Promise<any> {
    const db = admin.database().ref(this.getDbRef());
    const inDb = await db.once('value').then(snapshot => snapshot.val());
    return Promise.all(Object.entries(inDb)
    // @ts-ignore
      .filter(([key, {created = 0}]) => created < (new Date().getTime() - deleteAfter))
      .map(([key]) => key)
      .map((key) => console.log(`delete: ${key}`) || key)
      .map(key => admin.database().ref(`${this.getDbRef()}/${key}`).remove()));
  };

  createHandlers(): any {
    return {
      [`${this.getProjectName()}_DbCleanUp`]: functions.runWith({timeoutSeconds: 540}).pubsub
        .topic('clean')
        .onPublish(async () => this.cleanDb()),

      [`${this.getProjectName()}_Job`]: functions.runWith({timeoutSeconds: 540}).pubsub
        .topic(this.onCronTopic())
        .onPublish(async () => this.do()),

      [`${this.getProjectName()}_Http`]: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
        this.do()
          .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
          .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
      )
    };
  }
}
