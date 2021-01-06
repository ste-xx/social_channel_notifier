import * as admin from "firebase-admin";

admin.initializeApp();
import { rProgramming } from "./reddit";
import { hackerNews } from "./hackerNews";
import { productHunt } from "./productHunt";
import { ghMerge } from "./ghMerge";
import { ghUserProject } from "./ghUserProject";
import { dbClean } from "./dbClean";

Object.assign(exports, {
  ...rProgramming.createHandlers(),
  ...hackerNews.createHandlers(),
  ...productHunt.createHandlers(),
  ...ghMerge.createHandlers(),
  ...ghUserProject.createHandlers(),
  // ...new GhTrending().createHandlers(),
  ...dbClean.createHandlers()
});
