import useApi from 'src/composables/UseApi';
import { api } from 'boot/axios';
import { Buffer } from 'buffer';

export default function ticketsService() {
  const endpoint = 'api/tickets';
  const { getById, post, update, remove } = useApi(endpoint);

  const addUserPatchTicket = async (form) => {
    try {
      const url = `${endpoint}`;
      const { data } = await api.patch(`${url}/${form.id}`, form);
      return data;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const addTesterPatchTicket = async (form) => {
    try {
      const url = `${endpoint}`;
      const { data } = await api.patch(`${url}/${form.id}/tester`, form);
      return data;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const myTickets = async (id) => {
    try {
      const url = `${endpoint}`;
      // const { data } = await api.get(`${url}`);
      const { data } = await api.get(`${url}${id}`);
      return data;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const notifications = async () => {
    try {
      const { data } = await api.get(`${endpoint}/notifications`);
      return data;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const ticketsGraphUsers = async (id, params) => {
    try {
      const url = `${endpoint}/graphDashboard`;
      const { data } = await api.post(`${url}${id}`, params);
      return data;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const findTicketsAtCode = async (id) => {
    try {
      const url = `${endpoint}`;
      const data = await api.get(`${url}?include=collaborator,tester,impact,user.collaborator,client.corporate.image&filter[code]=${id}`);
      return data.data;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const findStatus = async (params) => {
    try {
      const url = `${endpoint}`;
      // const { data } = await api.get(`${url}`);
      const payload = await api.post(`${url}/ticketsFindStatus`, {params});
      return payload;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const report = async (id) => {
    try {
      const response = await api.get(`${endpoint}/kanban/${id}`, { responseType: 'arraybuffer' })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'));
      return `data:application/pdf;base64, ${response}`;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  const timeAlterDuty = async (params) => {
    try {
      const payload = await api.patch(`${endpoint}/timeAlterDuty`, {params});
      return payload;
    } catch (error) {
      throw (new Error(error.message));
    }
  };

  return {
    addUserPatchTicket,
    addTesterPatchTicket,
    findTicketsAtCode,
    ticketsGraphUsers,
    report,
    myTickets,
    getById,
    post,
    update,
    remove,
    notifications,
    findStatus,
    timeAlterDuty
  };
}
