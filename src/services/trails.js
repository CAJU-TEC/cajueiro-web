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

  // Com responseType blob o corpo do erro também chega como Blob, então a
  // mensagem do back precisa ser lida do arquivo: sem isso um 404 de certificado
  // apareceria como "Ops! Ocorreu um erro".
  const toBlobMessage = async (error) => {
    if (!(error instanceof Blob)) return toMessage(error);

    try {
      return JSON.parse(await error.text());
    } catch (parseError) {
      return 'Ops! Ocorreu um erro.';
    }
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

  // prazo do nível, por matrícula: as duas datas nulas limpam o período
  const setLevelPeriod = (levelId, collaboratorId, startsAt, endsAt) =>
    request('put', `${endpoint}/levels/${levelId}/period`, {
      collaborator_id: collaboratorId,
      starts_at: startsAt,
      ends_at: endsAt,
    });

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
  // concluir o nível é o mesmo ato de avaliar: a nota vai junto (R9)
  const completeLevel = (levelId, collaboratorId, note, score) =>
    request('post', `${endpoint}/levels/${levelId}/complete`, {
      collaborator_id: collaboratorId,
      note,
      score,
    });

  // o colaborador envia o nível para avaliação, com certificado opcional em
  // data URI — mesmo formato dos anexos de protocolo
  const submitLevel = (levelId, collaboratorId, certificate) =>
    request('post', `${endpoint}/levels/${levelId}/submit`, {
      collaborator_id: collaboratorId,
      certificate,
    });
  const undoLevel = (levelId, collaboratorId) =>
    request('delete', `${endpoint}/levels/${levelId}/complete`, { data: { collaborator_id: collaboratorId } });

  // apaga só a nota e a resposta; o nível segue concluído e contando no quórum
  const clearLevelEvaluation = (levelId, collaboratorId) =>
    request('delete', `${endpoint}/levels/${levelId}/evaluation`, {
      data: { collaborator_id: collaboratorId },
    });
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
      throw new Error(await toBlobMessage(error));
    }
  };

  // Relatório em PDF. Sem colaborador vem o geral, com todos os matriculados;
  // com colaborador vem o individual. Mesmo padrão de blob: a rota fica atrás
  // do auth:sanctum.
  const report = async (trailId, collaboratorId = null) => {
    const url = collaboratorId
      ? `${endpoint}/${trailId}/collaborators/${collaboratorId}/report`
      : `${endpoint}/${trailId}/report`;

    try {
      const { data } = await api.get(url, { responseType: 'blob' });
      return new Blob([data], { type: 'application/pdf' });
    } catch (error) {
      throw new Error(await toBlobMessage(error));
    }
  };

  // Certificado que o colaborador anexou no nível. Também por blob: a rota fica
  // atrás do auth:sanctum e o tipo vem do arquivo, que pode ser PDF ou imagem.
  const levelCertificate = async (levelId, collaboratorId) => {
    try {
      const response = await api.get(
        `${endpoint}/levels/${levelId}/certificate/${collaboratorId}`,
        { responseType: 'blob' }
      );
      return new Blob([response.data], { type: response.headers['content-type'] });
    } catch (error) {
      throw new Error(await toBlobMessage(error));
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
    setLevelPeriod,
    submitLevel,
    enroll,
    unenroll,
    progress,
    completeLevel,
    undoLevel,
    clearLevelEvaluation,
    advanceStage,
    undoStage,
    certificate,
    levelCertificate,
    report,
    myCajueiro,
  };
}
