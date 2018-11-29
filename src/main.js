/* eslint-disable */

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
console.warn('init main');
import './firebase';
import './serviceworker';

import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App';
import router from './router';
import '../node_modules/vuetify/src/stylus/app.styl';
import 'vuetify/dist/vuetify.min.css'; // Ensure you are using css-loader


Vue.use(Vuetify, {
  theme: {
    primary: '#ee44aa',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  }
});
//
// Vue.config.productionTip = false;
//
// /* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
});

