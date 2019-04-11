import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {deleteAfter} from "./const";
import BaseMixin from "./baseMixin";
import Payload from "./payload";
import axios, {AxiosResponse} from "axios";

export type onCronTopicType = 'fetch-1' | 'fetch-2' | 'fetch-3';

export default class CreateHandlerMixin implements BaseMixin {
  do: () => Promise<Payload[]>;
  onCronTopic: () => onCronTopicType;
  getDbRef: () => any;
  getProjectName: () => string;
  getEntriesFromDb: () => Promise<string>;

  createHandlers(): any {
    const escapeId = (id) => id.replace(/[#.$\/\[\]]/g,'');

    const cleanDb = async (): Promise<any> => {
      const db = admin.database().ref(this.getDbRef());
      const inDb = await db.once('value').then(snapshot => snapshot.val());
      return Promise.all(Object.entries(inDb)
      // @ts-ignore
        .filter(([, {created = 0}]) => created < (new Date().getTime() - deleteAfter))
        .map(([key]) => key)
        .map((key) => console.log(`delete: ${key}`) || key)
        .map(key => admin.database().ref(`${this.getDbRef()}/${key}`).remove()));
    };

    const writeToDb = async (payload: Payload[]): Promise<void[]> => {
      const db = admin.database().ref(this.getDbRef());
      return Promise.all(payload.map(({db: {id, ...payload}}) => {
        const transformedId = escapeId(id);
        console.log(`write id: ${transformedId} with payload`, payload);
        return db.update({[transformedId]: payload}).catch((err) => {
          return console.error(`some went wrong: id: ${transformedId} payload: ${JSON.stringify(payload)}`);
        });
      }));
    };


    const sendViaTelegram = async (payload: Payload[], beforeUpdate): Promise<AxiosResponse<any>[]> => {
      const telegramDbSecret = `secret/telegram`;
      const channel = '@scnrr';
      const apiToken = await admin.database().ref(telegramDbSecret).once('value').then(snapshot => snapshot.val());
      return Promise.all(payload
        .filter(({db: {id}}) => beforeUpdate === null || typeof beforeUpdate[escapeId(id)] === 'undefined')
        .map(({notification: {notification: {title, body, link}}}) =>
          axios.post(`https://api.telegram.org/bot${apiToken}/sendMessage`, {
            chat_id: channel,
            text: `[${title}: ${body}](${link})`,
            parse_mode: 'Markdown'
          })));
    };


    const processResults = async (payload: Payload[], start: number): Promise<string> => {
      const beforeUpdate = await this.getEntriesFromDb();
      await Promise.all([writeToDb(payload), sendViaTelegram(payload, beforeUpdate)]);
      const end = `fin: ${start} - ${new Date()}`;
      return console.log(end) || end;
    };

    return {
      [`${this.getProjectName()}_DbCleanUp`]: functions.runWith({timeoutSeconds: 540}).pubsub
        .topic('clean')
        .onPublish(async () => cleanDb()),

      [`${this.getProjectName()}_Job`]: functions.runWith({timeoutSeconds: 540}).pubsub
        .topic(this.onCronTopic())
        .onPublish(async () => {
          const payload = await this.do();
          return processResults(payload, 0);
        }),

      [`${this.getProjectName()}_Http`]: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) => {
          try {
            const payload = await this.do();
            const result = await processResults(payload, 0);
            const respMsg = `Successfully sent message: ${result}`;
            console.log(respMsg);
            return resp.send(respMsg);
          } catch (e) {
            console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`);
            return null;
          }
        }
      )
    };
  }
}
