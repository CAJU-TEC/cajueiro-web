import useApi from 'src/composables/UseApi';
import { api } from 'boot/axios';
import { Buffer } from 'buffer';

export default function checkListsService() {

  const endpoint = 'api/checkLists';
  const { list, getById, post, update, remove } = useApi(endpoint);

  const report = async (id) => {
    try {
      const response = await api.get(`${endpoint}/report/${id}`, { responseType: 'arraybuffer' })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'));
      return `data:application/pdf;base64, ${response}`;
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
    report
  };
}
