import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
import useApi from 'src/composables/UseApi';

export default function usersService() {

  const endpoint = 'api/users';
  const { list, getById, post, update, remove } = useApi(endpoint);
  const ACCESS_TOKEN_NAME = 'access_token';

  const login = async (form) => {
    const url = `${endpoint}/login`;
    return await api.post(url, form)
      .then(function (response) {
        setAccessToken(response.data);
        return 'Demais! Estou logado no sistema. 🤟';
      })
      .catch(function (error) {
        if(error) throw error;
      });
  };

  const logout = () => {
    Notify.create({
      type: 'info',
      message: 'Que pena! Acho que já deu por hoje. 😭'
    });
  };

  const setAccessToken = (accessTokenObject) => {
    try {
      localStorage.setItem(ACCESS_TOKEN_NAME, accessTokenObject.token);
    } catch (error) {
      if(error) throw error;
    }
  };

  const removeAccessToken = () => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_NAME);
    } catch (error) {
      if(error) throw error;
    }
  };

  const getAccessToken = () => {
    try {
      return localStorage.getItem(ACCESS_TOKEN_NAME);
    } catch (error) {
      if(error) throw error;
    }
  };

  const fetchUser = async () => {
    const url = 'api/user';
    return await api.get(url)
      .then(function (response){
        return response;
      })
      .catch((error) => {
        if(error) throw error;
      });
  };

  const getSanctumCookie = async () => {
    try {
      await api.get('sanctum/csrf-cookie');
    } catch (error) {
      if(error) throw error;
    }
  };

  return {
    list,
    getById,
    post,
    update,
    remove,
    login,
    logout,
    getSanctumCookie,
    setAccessToken,
    getAccessToken,
    removeAccessToken,
    fetchUser
  };
}
