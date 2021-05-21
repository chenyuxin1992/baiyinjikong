import qs from 'qs';
import axios from 'axios';
import store from '@/store';
import { isDev } from '@/config';
import { message } from 'ant-design-vue';
import { aesEncrypt, aesDecrypt } from '@/utils';

const request = axios.create({
  baseURL: isDev ? '/base-api' : `https://${location.hostname}:8443`,
  timeout: 30000,
  withCredentials: false,
  paramsSerializer: (params) => qs.stringify(params),
});

// request.defaults.headers.common['Authorization'] =
//   'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k';

request.defaults.headers.common['Authorization'] = 'Basic ZWxhc3RpYzphaWNyb2Jv';

request.interceptors.request.use(
  (config) => {
    // console.log(config);
    const token = store.state.token;
    if (token) {
      //config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-token'] = token;
      config.headers['x-user-id'] = store.state.userData.ID;
    }
    if (store.state.encrypt) {
      const encryptData = aesEncrypt(JSON.stringify(config.data));
      console.log(encryptData);
      config.data = encryptData;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    // console.log(response);
    const { data } = response;
    if (data.data && data.msg) {
      if (data.code > 0) {
        message.error(data.msg || '网络请求错误!');
        return Promise.reject(data.msg);
      } else {
        return Promise.resolve(data.data);
      }
    }
    if (store.state.encrypt) {
      const decryptData = aesDecrypt(data);
      // const decryptData = SM4.decrypt(data, encryptKey, {
      //   mode: SM4.constants.ECB,
      //   inputEncoding: 'base64',
      //   outputEncoding: 'utf8',
      // });
      console.log(JSON.parse(decryptData));
      return Promise.resolve(JSON.parse(decryptData));
    } else {
      return Promise.resolve(data);
    }
  },
  (error) => {
    //console.log(error.response);
    if (error.response.status && error.response.status == 403) {
      message.error('权限不足！');
      return Promise.reject(error);
    } else {
      //message.error('网络请求错误！');
      return Promise.reject(error);
    }
  }
);

export default request;
