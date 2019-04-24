import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import BaseMixin, {projectName} from "./baseMixin";
import Payload from "./payload";
import axios, {AxiosResponse} from "axios";

export default class CreateHandlerMixin implements BaseMixin {
  do: () => Promise<Payload[]>;
  getDbRef: () => any;
  getProjectName: () => projectName;
  getEntriesFromDb: () => Promise<string>;
  getConfig: () => Promise<any>;

  createHandlers(): any {
    const escapeId = (id) => id.replace(/[#.$\/\[\]]/g,'');
    const writeToDb = async (payload: Payload[]): Promise<void[]> => {
      const db = admin.database().ref(this.getDbRef());
      return Promise.all(payload.map(({db: {id, ...payload}}) => {
        const transformedId = escapeId(id);
        console.log(`write id: ${transformedId} with payload`, payload);
        return db.update({[transformedId]: payload}).catch((err) => {
          return console.error(`some went wrong: id: ${transformedId} payload: ${JSON.stringify(payload)} err: ${err}`);
        });
      }));
    };


    const sendViaTelegram = async (payload: Payload[], beforeUpdate): Promise<AxiosResponse<any>[]> => {
      const telegramDbSecret = `secret/telegram`;
      const channel = '@scnrr';
      const apiToken = await admin.database().ref(telegramDbSecret).once('value').then(snapshot => snapshot.val());
      return Promise.all(payload
        .filter(({db: {id}}) => beforeUpdate === null || typeof beforeUpdate[escapeId(id)] === 'undefined')
        .map(({notification: {title, body, link}}) =>
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
      console.log(end);
      return end;
    };

    return {
      [`${this.getProjectName()}_Job`]: functions.runWith({timeoutSeconds: 540}).pubsub
        .topic(this.getProjectName())
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
            console.warn(`Error sending message: ${e}`);
            resp.send(`Error sending message: ${e}`);
            return null;
          }
        }
      )
    };
  }
}
