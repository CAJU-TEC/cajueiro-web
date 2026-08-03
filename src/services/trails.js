import { api } from 'boot/axios';
import useApi from 'src/composables/UseApi';

export default function trailsService() {
  const endpoint = 'api/trails';
  const { list, getById, post, update, remove } = useApi(endpoint);

  // O interceptor do boot/axios já rejeita com o corpo da resposta:
  // string para os erros de domínio (422) e Error para 401/403.
  const toMessage = (error) => {
    if (typeof error === 'string') return error;
    return error?.message ?? 'Ops! Ocorreu um erro.';
  };

  const request = async (method, url, payload) => {
    try {
      const { data } = await api[method](url, payload);
      return data;
    } catch (error) {
      throw new Error(toMessage(error));
    }
  };

  const listByTeam = async (teamId) => {
    try {
      const { data } = await api.get(endpoint, { params: { team_id: teamId } });
      return data;
    } catch (error) {
      throw new Error(toMessage(error));
    }
  };

  // minha trilha (colaborador autenticado)
  const mine = () => request('get', `${endpoint}/mine`);

  // meu cajueiro: conquistas do colaborador (o pôster é desenhado no front)
  const myCajueiro = () => request('get', `${endpoint}/my-cajueiro`);

  // etapas
  const storeStage = (trailId, form) => request('post', `${endpoint}/${trailId}/stages`, form);
  const updateStage = (stageId, form) => request('put', `${endpoint}/stages/${stageId}`, form);
  const removeStage = (stageId) => request('delete', `${endpoint}/stages/${stageId}`);
  const reorderStages = (trailId, stages) => request('put', `${endpoint}/${trailId}/stages/reorder`, { stages });

  // níveis
  const storeLevel = (stageId, form) => request('post', `${endpoint}/stages/${stageId}/levels`, form);
  const updateLevel = (levelId, form) => request('put', `${endpoint}/levels/${levelId}`, form);
  const removeLevel = (levelId) => request('delete', `${endpoint}/levels/${levelId}`);

  // materiais de apoio
  const storeMaterial = (form) => request('post', `${endpoint}/materials`, form);
  const updateMaterial = (materialId, form) => request('put', `${endpoint}/materials/${materialId}`, form);
  const removeMaterial = (materialId) => request('delete', `${endpoint}/materials/${materialId}`);

  // matrícula e progresso
  const enroll = (trailId, collaboratorId) =>
    request('post', `${endpoint}/${trailId}/collaborators`, { collaborator_id: collaboratorId });
  const unenroll = (trailId, collaboratorId) =>
    request('delete', `${endpoint}/${trailId}/collaborators/${collaboratorId}`);
  const progress = (trailId, collaboratorId) =>
    request('get', `${endpoint}/${trailId}/collaborators/${collaboratorId}/progress`);

  // avanço
  const completeLevel = (levelId, collaboratorId, note) =>
    request('post', `${endpoint}/levels/${levelId}/complete`, { collaborator_id: collaboratorId, note });
  const undoLevel = (levelId, collaboratorId) =>
    request('delete', `${endpoint}/levels/${levelId}/complete`, { data: { collaborator_id: collaboratorId } });
  const advanceStage = (stageId, collaboratorId, note) =>
    request('post', `${endpoint}/stages/${stageId}/advance`, { collaborator_id: collaboratorId, note });
  const undoStage = (stageId, collaboratorId) =>
    request('delete', `${endpoint}/stages/${stageId}/advance`, { data: { collaborator_id: collaboratorId } });

  // A rota fica atrás do auth:sanctum, então o PDF vem por blob (mesmo padrão do
  // relatório de aniversariantes) em vez de abrir a URL direto.
  const certificate = async (stageId, collaboratorId) => {
    try {
      const { data } = await api.get(
        `${endpoint}/stages/${stageId}/certificate/${collaboratorId}`,
        { responseType: 'blob' }
      );
      return new Blob([data], { type: 'application/pdf' });
    } catch (error) {
      throw new Error(toMessage(error));
    }
  };

  return {
    list,
    listByTeam,
    getById,
    post,
    update,
    remove,
    mine,
    storeStage,
    updateStage,
    removeStage,
    reorderStages,
    storeLevel,
    updateLevel,
    removeLevel,
    storeMaterial,
    updateMaterial,
    removeMaterial,
    enroll,
    unenroll,
    progress,
    completeLevel,
    undoLevel,
    advanceStage,
    undoStage,
    certificate,
    myCajueiro,
  };
}
