import { api } from 'boot/axios';

export default function useApi(url) {
  const list = async () => {
    try {
      const { data } = await api.get(url);
      return data;
    } catch (error) {
      throw (error.response.data);
    }
  };

  const getById = async (id) => {
    try {
      const { data } = await api.get(`${url}/${id}`);
      return data;
    } catch (error) {
      throw (error.response.data);
    }
  };

  const post = async (form) => {
    try {
      const { data } = await api.post(url, form);
      return data;
    } catch (error) {
      throw (error.response.data);
    }
  };

  const update = async (form) => {
    try {
      const { data } = await api.put(`${url}/${form.id}`, form);
      return data;
    } catch (error) {
      throw (error.response.data);
    }
  };

  const remove = async (id) => {
    try {
      const { data } = await api.delete(`${url}/${id}`);
      return data;
    } catch (error) {
      throw (error.response.data);
    }
  };

  return {
    list,
    getById,
    post,
    update,
    remove
  };
}
