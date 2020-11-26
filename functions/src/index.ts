import * as admin from "firebase-admin";

admin.initializeApp();
import { rProgramming } from "./reddit";
import { hackerNews } from "./hackerNews";

Object.assign(exports, {
  ...rProgramming.createHandlers(),
  ...hackerNews.createHandlers()
  // ...new Ph().createHandlers(),
  // ...new GhTrending().createHandlers(),
  // ...new GhMerge().createHandlers(),
  // ...new DbClean().createHandlers()
});
