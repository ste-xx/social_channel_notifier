const {notificationTopic} = require('./const.js');
const {cleanDb, writeDbAndSend} = require('./util.js');

const functions = require('firebase-functions');

const axios = require('axios');

const MIN_POINTS = 500;
const DAY_IN_SECONDS = 86400;

const projectName = 'HN';
const dbRef = `data/${projectName}`;

const handler = async () => {

  const currentTimestampInSeconds = parseInt(new Date().getTime() / 1000, 10);
  const lastWeekTimestampInSeconds = currentTimestampInSeconds - DAY_IN_SECONDS * 7;
  console.log(`timestamp in seconds: ${lastWeekTimestampInSeconds}`);

  const start = new Date();
  const {data: {hits}} = await axios.get(`https://hn.algolia.com/api/v1/search`, {
    params: {
      query: '',
      tags: 'story',
      page: 0,
      numericFilters: `created_at_i>${lastWeekTimestampInSeconds},points>${MIN_POINTS}`
    }
  });

  const relevants = hits.map((post) => console.log('analyze post:', post) || post)
    .map(({title, points, objectID}) => ({
      db: {
        id: objectID,
        title,
        link: `https://news.ycombinator.com/item?id=${objectID}`,
        created: new Date().getTime()
      },
      notification: {
        topic: notificationTopic,
        notification: {
          title: `${projectName}: (${points})`,
          body: `${title}`
        },
        webpush: {
          notification: {
            tag: objectID,
            click_action: `https://news.ycombinator.com/item?id=${objectID}`
          },
          fcm_options: {link: `https://news.ycombinator.com/item?id=${objectID}`}
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
      .topic('fetch-1')
      .onPublish(async () => handler()),

    [`${projectName}_Http`]: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
      handler()
        .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
        .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
    )
  }
};
