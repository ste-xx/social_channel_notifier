import * as admin from "firebase-admin";
import BaseMixin from "./baseMixin";
import axios, {AxiosResponse} from "axios";
import Payload from "./payload";

export default class SendViaTelegramMixin implements BaseMixin {
  do: () => Promise<string>;
  getProjectName: () => string;
  getDbRef: () => any;
  getEntriesFromDb: () => Promise<string>;

  async sendViaTelegram(payload: Payload[], beforeUpdate): Promise<AxiosResponse<any>[]> {
    const telegramDbSecret = `secret/telegram`;
    const channel = '@scnrr';
    const apiToken = await admin.database().ref(telegramDbSecret).once('value').then(snapshot => snapshot.val());
    return Promise.all(payload
      .filter(({db: {id}}) => beforeUpdate === null || typeof beforeUpdate[id] === 'undefined')
      .map(({notification: {notification: {title, body, link}}}) =>
        axios.post(`https://api.telegram.org/bot${apiToken}/sendMessage`, {
          chat_id: channel,
          text: `[${title}: ${body}](${link})`,
          parse_mode: 'Markdown'
        })));
  };
}
