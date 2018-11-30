import runtime from 'serviceworker-webpack-plugin/lib/runtime';
console.warn('init firebase');

const config = {
  apiKey: 'AIzaSyAeB3amlIN-gx1D0RiQdwYCyfTzSRJumUI',
  authDomain: 'social-channel-notifier.firebaseapp.com',
  databaseURL: 'https://social-channel-notifier.firebaseio.com',
  projectId: 'social-channel-notifier',
  storageBucket: 'social-channel-notifier.appspot.com',
  messagingSenderId: '564289848842'
};

firebase.initializeApp(config);

const messaging = firebase.messaging();
if ('serviceWorker' in navigator) {
  runtime.register().then(reg => messaging.useServiceWorker(reg));
}

messaging.usePublicVapidKey('BBsCK3li1joQdPUyTPwnCwYuV39gGdX1CTVTotma0_DRxaTXkTYVtuf6G9QeSyZcCutv0zSDZSOu7L84MMGSOx0');
messaging.requestPermission().then(function() {
  console.log('Notification permission granted.');
  // TODO(developer): Retrieve an Instance ID token for use with FCM.
  // ...
}).catch(function(err) {
  console.log('Unable to get permission to notify.', err);
});

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.
messaging.onMessage(function(payload) {
  console.log('Message received. ', payload);
  // ...
});

messaging.getToken().then(function(currentToken) {
  if (currentToken) {
    console.log(`current token: ${currentToken}`);
    fetch(`https://us-central1-social-channel-notifier.cloudfunctions.net/registerToTopic?token=${currentToken}`, {
      method: 'post'
    });
  } else {
    // Show permission request.
    console.log('No Instance ID token available. Request permission to generate one.');
  }
}).catch(function(err) {
  console.log('An error occurred while retrieving token. ', err);
});
