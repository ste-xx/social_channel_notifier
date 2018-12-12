const {notificationTopic, pauseBetweenSend} = require('./const.js');
const {wait, cleanDb} = require('./util.js');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const projectName = 'gh_trending_js';
const dbRef = `data/${projectName}`;

const handler = async () => {

  const db = admin.database().ref(dbRef);
  const start = new Date();
  const {data:projects} = await axios.get(`https://github-trending-api.now.sh/repositories`, {
    params: {
      language: 'javascript',
      since: 'weekly'
    }
  });
  const inDb = await db.once('value').then(snapshot => snapshot.val());
  return  projects
    .map(project => console.log('analyze project:', project) || project)
    .filter(({name}) => inDb === null || typeof inDb[name] === 'undefined')
    .map(({name, currentPeriodStars, description, url}) => ({
      db: {
        id:name,
        url,
        created: new Date().getTime()
      },
      notification: {
        topic: notificationTopic,
        notification: {
          title: `${projectName}: ${name} (${currentPeriodStars})`,
          body: `${description}`
        },
        webpush: {
          notification: {
            tag: name,
            click_action: url
          },
          fcm_options: {link: url}
        }
      }
    }))
    .map(({notification, db: {id, ...payload}}) => (idx) => (idx === 0 ? Promise.resolve() : wait(pauseBetweenSend))
      .then(() => console.log('send notification:', notification))
      .then(() => admin.messaging().send(notification))
      .then(() => db.update({[id]: payload})))
    .reduce((acc, fn, idx) => acc.then(() => fn(idx)), Promise.resolve(''))
    .then(() => console.log(`fin: ${start} - ${new Date()}`) || `${start} - ${new Date()}`);
};


module.exports = {
  gcFn: {
    [`${projectName}_DbCleanUp`]: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('clean')
      .onPublish(async () => cleanDb(dbRef)),

    [`${projectName}_Job`]: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('fetch-2')
      .onPublish(async () => handler()),

    [`${projectName}_Http`]: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
      handler()
        .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
        .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
    )
  }
};
