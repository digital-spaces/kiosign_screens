// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueLogger from 'vuejs-logger';
import VueResource from 'vue-resource';
import VueResourceMock from 'vue-resource-mock';

Vue.config.productionTip = false
Vue.use(VueLogger, { logLevel: 'debug' });
Vue.use(VueResource);

if (process.env.NODE_ENV === 'development') {
  /* eslint-disable global-require */
  Vue.use(VueResourceMock, require('./dev/mocks').default, { silent: false });
  /* eslint-enable global-require */
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App :apiBase="apiBase" :screenId="screenId" />',
  data: {
    apiBase: '',
    screenId: '',
  },
  beforeMount() {
    this.apiBase = loadConfig.call(this, 'data-api-base', '/wp-json/acf/v3/');
    this.screenId = loadConfig.call(this, 'data-screen-id', '1');
  },
});
