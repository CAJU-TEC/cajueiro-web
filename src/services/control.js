import useApi from 'src/composables/UseApi';
import { api } from 'boot/axios';

export default function controlService() {
  const endpoint = 'api/tickets';
  const { getById, post, update, remove } = useApi(endpoint);

  // Buscar tickets agrupados por cliente com filtros
  const listByClient = async (params = {}) => {
    const { data } = await api.get(`${endpoint}/control/by-client`, { params });
    return data;
  };

  // Buscar métricas dos tickets
  const getMetrics = async (params = {}) => {
    const { data } = await api.get(`${endpoint}/control/metrics`, { params });
    return data;
  };

  // Reatribuir responsável (usando PATCH do ticket)
  const reassign = async (ticketId, form) => {
    const { data } = await api.patch(`${endpoint}/${ticketId}`, form);
    return data;
  };

  // Atualizar ticket (exemplo para validação)
  const validate = async (ticketId, form) => {
    const { data } = await api.put(`${endpoint}/${ticketId}`, form);
    return data;
  };

  return {
    getById,
    post,
    update,
    remove,
    listByClient,
    getMetrics,
    reassign,
    validate,
  };
}
