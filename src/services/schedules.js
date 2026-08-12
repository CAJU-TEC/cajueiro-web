import useApi from 'src/composables/UseApi';
import { api } from 'boot/axios';

export default function schedulesService() {
  const { list, getById, post, update, remove } = useApi('api/schedules');

  const today = async () => {
    try {
      const { data } = await api.get('api/schedules/today');
      return data;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  return {
    list,
    getById,
    post,
    update,
    remove,
    today,
  };
}
