// import CreateHandlerMixin from './createHandlerMixin';
// import applyMixins from "./mixin";
// import BaseMixin from "./baseMixin";
// import * as admin from "firebase-admin";
// import projectName from './ghTrending';
//
// const dayInMs = 86400000;
// const dbCleanConfig = 'config/dbClean';
//
//
// interface DbCleanConfig {
//   days: number,
//   ref: projectName | 'abc'
// }
//
// class DbClean {
//   onCronTopic(): "fetch-1" {
//     return "fetch-1";
//   }
//
//   async do(): Promise<void> {
//
//     const configs: DbCleanConfig[] = await admin.database().ref(dbCleanConfig).once('value').then(snapshot => snapshot.val());
//     const deleteAfter = dayInMs * 10;
//     // read config from db (which topics should be cleared)
//     //do for each dbRef
//     const db = admin.database().ref(this.getDbRef());
//     const inDb = await db.once('value').then(snapshot => snapshot.val());
//     await Promise.all(Object.entries(inDb)
//     // @ts-ignore
//       .filter(([, {created = 0}]) => created < (new Date().getTime() - deleteAfter))
//       .map(([key]) => key)
//       .map((key) => {
//         console.log(`delete: ${key}`);
//         return key;
//       })
//       .map(key => admin.database().ref(`${this.getDbRef()}/${key}`).remove()));
//     //do clean
//   }
// }
//
// applyMixins(DbClean, [BaseMixin, CreateHandlerMixin]);
// export default DbClean;
