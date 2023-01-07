import { boot } from 'quasar/wrappers';
import axios from 'axios';
import usersService from '../services/auth.js';
// import { Notify } from 'quasar';
// import { useRouter } from 'vue-router';

const api = axios.create({ baseURL: process.env.API_URL });
const { getAccessToken } = usersService();

api.interceptors.request.use((config) => {
  if (getAccessToken) config.headers.Authorization = `Bearer ${getAccessToken()}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      return Promise.reject(new Error('Que pena! Acho que já deu por hoje. 😭'));
    }
    if (error.response && error.response.status === 403) {
      return Promise.reject(new Error('Você não tem permissão para acessar esse recurso.'));
    }
    if (error.response) {
      return Promise.reject(new Error(error.response.data));
    }
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API


});

export { api };
