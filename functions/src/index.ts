import * as admin from "firebase-admin";

admin.initializeApp();
import { rProgramming } from "./reddit";
import { hackerNews } from "./hackerNews";
import { productHunt } from "./productHunt";

Object.assign(exports, {
  ...rProgramming.createHandlers(),
  ...hackerNews.createHandlers(),
  ...productHunt.createHandlers()
  // ...new GhTrending().createHandlers(),
  // ...new GhMerge().createHandlers(),
  // ...new DbClean().createHandlers()
});
