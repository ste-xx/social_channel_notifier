import * as admin from 'firebase-admin';

admin.initializeApp();
import {rProgramming} from './reddit';

Object.assign(exports, {
  ...rProgramming.createHandlers()
  // ...new Hn().createHandlers(),
  // ...new Ph().createHandlers(),
  // ...new GhTrending().createHandlers(),
  // ...new GhMerge().createHandlers(),
  // ...new DbClean().createHandlers()
});
