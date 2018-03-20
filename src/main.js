// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueLogger from 'vuejs-logger';
import VueResource from 'vue-resource';
import VueResourceMock from 'vue-resource-mock';
import App from './App';

Vue.use(VueLogger, { logLevel: 'debug' });
Vue.use(VueResource);

if (process.env.NODE_ENV === 'development') {
  /* eslint-disable global-require */
  Vue.use(VueResourceMock, require('./dev/mocks').default, { silent: false });
  /* eslint-enable global-require */
}

Vue.config.productionTip = false;

/**
 * Loads the configuration parameter from the element the app is bound to, or
 * if development mode, uses a hardcoded value.
 *
 * @param {string} parameter The name of the parameter to load
 * @param {string} devValue  The default value when in development mode
 *
 * @return {string} The value of the parameter
 */
function loadConfig(parameter, devValue) {
  return process.env.NODE_ENV === 'development' ? devValue : this.$el.attributes[parameter].value;
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
