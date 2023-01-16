import useApi from 'src/composables/UseApi';
import { api } from 'boot/axios';

export default function ticketsService() {
  const endpoint = 'api/tickets';
  const { list, getById, post, update, remove } = useApi(endpoint);


  const addUserPatchTicket = async (form) => {
    try {
      const url = `${endpoint}`;
      const { data } = await api.patch(`${url}/${form.id}`, form);
      return data;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  return {
    addUserPatchTicket,
    list,
    getById,
    post,
    update,
    remove,
  };
}
