// src/services/reports.js
import { api } from 'boot/axios';

const endpoint = 'api/reports';

// ✅ Exporta um OBJETO com métodos (não uma função construtora)
export const reportsService = {
  async getTicketsPorColaborador(params = {}) {
    try {
      const { data } = await api.get(`${endpoint}/support/tickets-por-colaborador`, { params });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getTicketsPorCliente(params = {}) {
    try {
      const { data } = await api.get(`${endpoint}/support/tickets-por-cliente`, { params });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getDesempenhoQuantidade(params = {}) {
    try {
      const { data } = await api.get(`${endpoint}/development/quantidade`, { params });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getDesempenhoTempoMedio(params = {}) {
    try {
      const { data } = await api.get(`${endpoint}/development/tempo-medio`, { params });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getTicketsPorQA(params = {}) {
    try {
      const { data } = await api.get(`${endpoint}/qa/tickets-por-qa`, { params });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};
