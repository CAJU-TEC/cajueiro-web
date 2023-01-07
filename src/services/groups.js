import useApi from 'src/composables/UseApi';
import { api } from 'boot/axios';

export default function groupsService() {
  const endpoint = 'api/roles';
  const { getById, post, update, remove } = useApi(endpoint);

  const index = async (page = 0) => {
    try {
      const { data } = await api.get(`${endpoint}?page=${page}`, {
        params: { page }
      });
      return data;
    } catch (error) {
      throw (error.response.data);
    }
  };

  return {
    index,
    getById,
    post,
    update,
    remove,
  };
}
