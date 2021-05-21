import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment';
import storage from 'store';
import * as API from '@/api';
// import Cookie from 'js-cookie';
import { SM3 } from 'gm-crypto';
import { sm4Encrypt } from '@/utils';
import { loadLanguageAsync } from '@/lang';
import router, { asyncRoutes } from '@/router';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    encrypt: false, // 加密开关
    routes: [], // 动态路由
    lang: storage.get('lang') || 'zh',
    token: storage.get('token'),
    password: storage.get('password'),
    userData: storage.get('userData') || {},
    taskData: storage.get('taskData') || {},
  },
  getters: {
    lang: (state) => state.lang,
    token: (state) => state.token,
    routes: (state) => state.routes,
    password: (state) => state.password,
    userData: (state) => state.userData,
    taskData: (state) => state.taskData,
  },
  mutations: {
    SET_LANG(state, lang) {
      state.lang = lang;
      storage.set('lang', lang);
    },
    SET_TOKEN(state, token) {
      state.token = token;
      storage.set('token', token);
      // Cookie.set('token', token, { expires: new Date(expires) });
    },
    SET_ROUTES(state, authId) {
      const routes = asyncRoutes[authId] || [];
      router.$addRoutes(routes);
      state.routes = routes;
    },
    SET_USERNAME(state, username) {
      state.username = username;
      storage.set('username', username);
    },
    SET_PASSWORD(state, password) {
      state.password = password;
      storage.set('password', password);
    },
    SET_USERDATA(state, userData) {
      state.userData = userData;
      storage.set('userData', userData);
    },
    SET_TASKDATA(state, taskData) {
      const { start_time, end_time } = taskData;
      state.taskData = {
        ...taskData,
        duration: moment(end_time).to(moment(start_time), true),
        done: taskData.result.normal + taskData.result.error,
      };
      storage.set('taskData', state.taskData);
    },
    UPDATE_TASKDATA(state, taskData) {
      state.taskData = { ...state.taskData, ...taskData };
      storage.set('taskData', state.taskData);
    },
  },
  actions: {
    setLanguage({ commit }, lang) {
      return new Promise((resolve, reject) => {
        commit('SET_LANG', lang);
        loadLanguageAsync(lang)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      });
    },
    setDynamicRoutes({ state, commit }) {
      const authId = state.userData.authorityId;
      commit('SET_ROUTES', authId);
    },
    userLogin({ commit }, data) {
      return new Promise((resolve, reject) => {
        const sm4Pwd = sm4Encrypt(data.password);
        //const sm3Pwd = SM3.digest(sm4Pwd, 'utf8', 'hex');
        const params = { ...data, password: sm4Pwd };
        if (data.withFinger) {
          API.postUserApi('/base_cas/login_finger', params)
            .then((res) => {
              const { user, token, expiresAt } = res;
              commit('SET_USERDATA', user);
              commit('SET_TOKEN', token, expiresAt);
              commit('SET_ROUTES', user.authorityId);
              //commit('SET_PASSWORD', sm4Encrypt(data.password));
              commit('SET_PASSWORD', data.password);
              resolve(user.authorityId);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          API.postUserApi('/base_cas/login', params)
            .then((res) => {
              const { user, token, expiresAt } = res;
              commit('SET_USERDATA', user);
              commit('SET_TOKEN', token, expiresAt);
              commit('SET_ROUTES', user.authorityId);
              //commit('SET_PASSWORD', sm4Encrypt(data.password));
              commit('SET_PASSWORD', data.password);
              resolve(user.authorityId);
            })
            .catch((err) => {
              reject(err);
            });
        }
      });
    },
    userLogout() {
      return new Promise((resolve, reject) => {
        // router.replace('/login');
        // storage.clearAll();
        // resolve();
        API.postUserApi('/base_cas/logout')
          .then(() => {
            router.replace('/login');
            storage.clearAll();
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    changePwd({ state }, data) {
      const sm4Old = sm4Encrypt(data.password);
      //const sm3Old = SM3.digest(sm4Old, 'utf8', 'hex');
      console.log(sm4Old);
      const sm4New = sm4Encrypt(data.newPassword);
      //const sm3New = SM3.digest(sm4New, 'utf8', 'hex');
      console.log(sm4New);
      return new Promise((resolve, reject) => {
        API.postUserApi('/user/changePassword', {
          password: sm4Old,
          newPassword: sm4New,
          uuid: state.userData.uuid,
        })
          .then(() => {
            // const sm4Pwd = sm4Encrypt(data.password);
            // const sm3Pwd = SM3.digest(sm4Pwd, 'utf8', 'hex');
            // console.log(sm3Pwd);
            // commit('SET_PASSWORD', sm3Pwd);
            // this.$message.success('密码修改成功，请重新登陆！');
            // router.replace('/login');
            // storage.clearAll();
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    getUserList({ commit }, data = { page: 1, pageSize: 10 }) {
      return new Promise((resolve, reject) => {
        API.postUserApi('/user/getUserList', data)
          .then((res) => {
            console.log(res);
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    getRoleList({ commit }, data = { page: 1, pageSize: 100 }) {
      return new Promise((resolve, reject) => {
        API.postUserApi('/authority/getAuthorityList', data)
          .then((res) => {
            console.log(res);
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    setUserRole({ state, commit }, authId) {
      return new Promise((resolve, reject) => {
        API.postUserApi('/user/setUserAuthority', {
          uuid: state.userData.uuid,
          authorityId: authId,
        })
          .then((res) => {
            console.log(res);
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    getRoleAuth({ commit }, authId) {
      return new Promise((resolve, reject) => {
        API.postUserApi('/casbin/getPolicyPathByAuthorityId', { authorityId: authId })
          .then((res) => {
            console.log(res);
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    setRoleAuth({ commit }, data) {
      return new Promise((resolve, reject) => {
        API.postUserApi('/casbin/updateCasbin', data)
          .then((res) => {
            console.log(res);
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
  },
  modules: {},
});
