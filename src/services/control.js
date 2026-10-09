import { api } from 'boot/axios';

export default function controlService() {
  const endpoint = 'api/tickets';
  // Resumo por empresa (contagens) com filtros
  const listByClient = async (params = {}, config = {}) => {
    const { data } = await api.get(`${endpoint}/control/by-client`, { params, ...config });
    return data;
  };

  // Buscar protocolos paginados de uma empresa (carregado ao expandir)
  const listProtocols = async (params = {}, config = {}) => {
    const { data } = await api.get(`${endpoint}/control/protocols`, { params, ...config });
    return data;
  };

  // Buscar métricas dos tickets
  const getMetrics = async (params = {}, config = {}) => {
    const { data } = await api.get(`${endpoint}/control/metrics`, { params, ...config });
    return data;
  };

  return {
    listByClient,
    listProtocols,
    getMetrics,
  };
}
