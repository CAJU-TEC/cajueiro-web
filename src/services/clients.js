import useApi from 'src/composables/UseApi';
import { api } from 'boot/axios';

export default function clientsService() {
  const endpoint = 'clients';
  const { list, getById, post, update, remove } = useApi(endpoint);

  const storeSimplied = async (form) => {
    try {
      const url = `${endpoint}/storeSimplified`;
      const { data } = await api.post(url, form);
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
    remove,
    storeSimplied
  };
}
