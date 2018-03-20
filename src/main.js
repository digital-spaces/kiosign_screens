// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

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
