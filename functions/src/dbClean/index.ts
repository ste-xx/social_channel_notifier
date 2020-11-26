import {Feed, FeedEntry} from "../types";
import {createHttp, createJob, createRss} from "../createHandlers";
import {getConfig} from "../db";
import * as admin from "firebase-admin";

interface ConfigEntry {
  days: number,
  ref: string;
}

export const dbClean: Feed<'dbClean'> = {
  projectName: 'dbClean',
  onPublish: async ():Promise<void> => {
    const configs = await getConfig<"dbClean", ConfigEntry[]>(dbClean);

    const DAY_IN_MS = 86400000;

    await Promise.all(configs.map(async config => {
      const inDb = await admin.database()
        .ref(`data/${config.ref}`)
        .once('value')
        .then(snapshot => snapshot.val() as Record<string, FeedEntry>);

      const deleteAfter = DAY_IN_MS * config.days;
      await Promise.all(Object.entries(inDb)
        .filter(([, {created = 0}]) => created < (new Date().getTime() - deleteAfter))
        .map(([key]) => key)
        .map((key) => {
          console.log(`delete: ${key}`);
          return key;
        })
        .map(key => admin.database().ref(`data/${config.ref}/${key}`).remove()));
    }));
  },
  createHandlers: () => ({
    ...createJob(dbClean),
    ...createHttp(dbClean),
    ...createRss(dbClean)
  })
}
