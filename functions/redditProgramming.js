const {notificationTopic} = require('./const.js');
const {cleanDb, writeDbAndSend} = require('./util.js');

const functions = require('firebase-functions');

const axios = require('axios');

const projectName = 'r_programming';
const dbRef = `data/${projectName}`;

const MIN_SCORE = 500;
const redditTopic = 'r/programming';

const handler = async () => {
  console.log(`Fetch ${projectName}`);
  const start = new Date();
  const {data: {children: posts}} = await axios.get(`https://www.reddit.com/${redditTopic}/top/.json`, {params: {t: 'week'}})
    .then(({data}) => data);

  const relevants = posts.map(({data}) => data)
    .map(post => console.log('analyze post:', post) || post)
    .filter(({score}) => score >= MIN_SCORE)
    .map(({id, title, score, permalink}) => ({
      db: {
        id,
        title,
        link: `https://reddit.com${permalink}`,
        created: new Date().getTime()
      },
      notification: {
        topic: notificationTopic,
        notification: {
          title: `${projectName}: (${score})`,
          body: `${title}`
        },
        webpush: {
          notification: {
            tag: id,
            click_action: `https://reddit.com${permalink}`
          },
          fcm_options: {link: `https://reddit.com${permalink}`}
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
      .topic('fetch')
      .onPublish(async () => handler()),

    [`${projectName}_Http`]: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
      handler()
        .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
        .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
    )
  }
};
