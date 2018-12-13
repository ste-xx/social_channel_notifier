const {notificationTopic} = require('./const.js');
const {cleanDb, writeDbAndSend} = require('./util.js');
const admin = require('firebase-admin');

const functions = require('firebase-functions');

const axios = require('axios');

const projectName = 'ph_daily';
const dbRef = `data/${projectName}`;
const dbSecret = `secret/ph`;
const MIN_VOTES = 300;

const handler = async () => {
  const start = new Date();
  const {client_id,client_secret} = await admin.database().ref(dbSecret).once('value').then(snapshot => snapshot.val());
  const {data: {access_token}} = await axios(`https://api.producthunt.com/v1/oauth/token`, {
    method: 'post',
    data: {
      client_id,
      client_secret,
      grant_type: "client_credentials"
    }
  });
  console.log(`logged in ${access_token}`);

  const {data:{posts}} = await axios(`https://api.producthunt.com/v1/posts`, {
    method: 'get',
    headers: {
      Accept: 'application/json',
      "Content-Type": 'application/json',
      Host: 'api.producthunt.com',
      Authorization: `Bearer ${access_token}`
    }
  });

  const relevants = posts.map((post) => console.log('analyze post:', post) || post)
    .filter(({votes_count}) => votes_count>MIN_VOTES)
    .map(({id, name, tagline, votes_count, discussion_url}) => ({
      db: {
        id,
        title:name,
        link: discussion_url,
        created: new Date().getTime()
      },
      notification: {
        topic: notificationTopic,
        notification: {
          title: `${projectName}: ${name} (${votes_count})`,
          body: `${tagline}`
        },
        webpush: {
          notification: {
            tag: id,
            click_action: discussion_url
          },
          fcm_options: {link: discussion_url}
        }
      }
    }));

  return writeDbAndSend(relevants, dbRef).then(() => console.log(`fin: ${start} - ${new Date()}`) || `${start} - ${new Date()}`);
};

const reg = (req, resp) => {
  console.info(req);
};

module.exports = {
  gcFn: {
    [`${projectName}_DbCleanUp`]: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('clean')
      .onPublish(async () => cleanDb(dbRef)),


    [`${projectName}_Job`]: functions.runWith({timeoutSeconds: 540}).pubsub
      .topic('fetch-4')
      .onPublish(async () => handler()),

    [`${projectName}_Http`]: functions.runWith({timeoutSeconds: 540}).https.onRequest(async (req, resp) =>
      handler()
        .then(r => console.log(`Successfully sent message: ${r}`) || resp.send(`Successfully sent message: ${r}`))
        .catch(e => console.warn(`Error sending message: ${e}`) || resp.send(`Error sending message: ${e}`))
    )
  }
};
