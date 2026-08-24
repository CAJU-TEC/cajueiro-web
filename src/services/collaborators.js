import useApi from 'src/composables/UseApi';
import { api } from 'boot/axios';

export default function collaboratorsService() {
  const endpoint =  'api/collaborators';
  const { list, getById, post, update, remove } = useApi(endpoint);

  const syncDuty = async (form) => {
    try {
      const { data } = await api.post(`${endpoint}/sync-duty`, form);
      return data;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const birthdaysReport = async () => {
    try {
      const { data } = await api.get(`${endpoint}/birthdays/report`, { responseType: 'blob' });
      return new Blob([data], { type: 'application/pdf' });
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const anniversariesReport = async () => {
    try {
      const { data } = await api.get(`${endpoint}/anniversaries/report`, { responseType: 'blob' });
      return new Blob([data], { type: 'application/pdf' });
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
    syncDuty,
    birthdaysReport,
    anniversariesReport
  };
}
