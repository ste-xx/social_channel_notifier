import {DbEntries, Feed, FeedEntries} from "./types";
import * as admin from "firebase-admin";

const escapeId = (id: string) => id.replace(/[#.$/[\]]/g, '');
export const writeToDb = async <T extends string>(feed: Feed<T>, feedEntries: FeedEntries): Promise<void> => {
  const db = admin.database().ref(`data/${feed.projectName}`);
  await Promise.all(feedEntries.map(({id, ...feedEntry}) => {
    const escapedId = escapeId(id);
    console.log(`write id: ${escapedId} with payload`, feedEntry);

    const dbEntry: DbEntries = {
      [escapedId]: {
        id: escapedId,
        ...feedEntry
      }
    };
    return db.update(dbEntry).catch((err) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.error(`some went wrong: id: ${escapedId} payload: ${JSON.stringify(dbEntry)} err: ${err}`);
    });
  }));
};
