const {notificationTopic} = require('./const.js');
const {cleanDb, writeDbAndSend} = require('./util.js');

const functions = require('firebase-functions');

const axios = require('axios');

const projectName = 'gh_trending_all';
const dbRef = `data/${projectName}`;

const handler = async () => {

  const start = new Date();
  const {data: projects} = await axios.get(`https://github-trending-api.now.sh/repositories`, {
    params: {
      language: '',
      since: 'weekly'
    }
  });

  const relevants = projects
    .map(project => console.log('analyze project:', project) || project)
    .filter(({language}) => language !== 'JavaScript')
    .map(({name, currentPeriodStars, description, url}) => ({
      db: {
        id: name.replace('.', ''),
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
    }));

  return writeDbAndSend(relevants, dbRef).then(() => console.log(`fin: ${start} - ${new Date()}`) || `${start} - ${new Date()}`);
};


module.exports = {
  gcFn: {
    [`${projectName}_DbCleanUp`]: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('clean')
      .onPublish(async () => cleanDb(dbRef)),

    [`${projectName}_Job`]: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('fetch-3')
      .onPublish(async () => handler()),

    [`${projectName}_Http`]: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
      handler()
        .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
        .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
    )
  }
};
