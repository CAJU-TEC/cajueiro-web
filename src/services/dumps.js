import { api } from 'boot/axios';
import useApi from 'src/composables/UseApi';

export default function dumpsService() {
  const { getById } = useApi('api/dumps');

  // devolve a mensagem da API (ex.: "Cadastro incompleto de ..."), não a mensagem genérica do axios
  const post = async (form) => {
    try {
      const { data } = await api.post('api/dumps', form);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  // corporateId opcional: histórico de uma organização só
  const list = async (corporateId) => {
    try {
      const { data } = await api.get('api/dumps', { params: { corporate_id: corporateId } });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // organizações ativas com banco de produção cadastrado, com o último status e o andamento de cada destino
  const organizacoes = async () => {
    try {
      const { data } = await api.get('api/dumps/organizacoes');
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const cancel = async (id) => {
    try {
      const { data } = await api.post(`api/dumps/${id}/cancel`);
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return {
    list,
    organizacoes,
    post,
    getById,
    cancel,
  };
}
