import useApi from 'src/composables/UseApi';
import { api } from 'boot/axios';

export default function permissionsService() {
  const endpoint = 'api/permissions';
  const { list, getById, post, update, remove } = useApi(endpoint);

  const index = async (page = 0) => {
    try {
      const { data } = await api.get(`${endpoint}Index?page=${page}`, {
        params: { page }
      });
      return data;
    } catch (error) {
      throw (error.response.data);
    }
  };

  return {
    list,
    index,
    getById,
    post,
    update,
    remove,
  };
}
