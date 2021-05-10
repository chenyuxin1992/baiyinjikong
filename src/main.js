// import 'swiper/swiper-bundle.min.css';
import 'swiper/css/swiper.min.css';
import 'element-ui/lib/theme-chalk/index.css';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './lang';

import * as api from './api';
Vue.prototype.$api = api;

import moment from 'moment';
Vue.prototype.$moment = moment;

import decimal from 'decimal.js';
Vue.prototype.$decimal = decimal;

import Antd from 'ant-design-vue';
Vue.use(Antd);

import Animate from 'animate.css';
Vue.use(Animate);

import VueAwesomeSwiper from 'vue-awesome-swiper';
Vue.use(VueAwesomeSwiper);

// import VueInfiniteScroll from 'vue-infinite-scroll';
// Vue.use(VueInfiniteScroll);

import { Image } from 'element-ui';
Vue.use(Image);

import SgIcon from '@/components/Icon';
Vue.component('sg-icon', SgIcon);

import * as filters from './filters';
Object.keys(filters).forEach((key) => Vue.filter(key, filters[key]));

Vue.prototype.$bus = new Vue();
Vue.prototype.$random = (num) => Math.round(Math.random() * num);
Vue.prototype.$current = (format = 'YYYY-MM-DD HH:mm:ss') => moment().format(format);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
