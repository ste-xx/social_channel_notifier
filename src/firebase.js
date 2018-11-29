// Initialize Firebase
console.warn('init firebase');

const config = {
  apiKey: 'AIzaSyAeB3amlIN-gx1D0RiQdwYCyfTzSRJumUI',
  authDomain: 'social-channel-notifier.firebaseapp.com',
  databaseURL: 'https://social-channel-notifier.firebaseio.com',
  projectId: 'social-channel-notifier',
  storageBucket: 'social-channel-notifier.appspot.com',
  messagingSenderId: '564289848842'
};
// eslint-disable-next-line no-undef
firebase.initializeApp(config);
