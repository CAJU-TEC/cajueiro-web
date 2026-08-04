// Estados de etapa devolvidos por TrailProgressService::progressFor() na API.
export const STATES = {
  completed: { label: 'Concluída', color: 'positive', icon: 'check_circle' },
  unlocked: { label: 'Liberada', color: 'primary', icon: 'radio_button_unchecked' },
  locked: { label: 'Bloqueada', color: 'grey-6', icon: 'lock' },
};

// Estado do prazo do nível (period_state na API). O prazo é por matrícula:
// o mesmo nível pode estar atrasado para um colaborador e em dia para outro.
export const PERIODS = {
  not_started: { label: 'Sem prazo definido', color: 'grey-6', icon: 'event_available' },
  scheduled: { label: 'Agendado', color: 'blue-6', icon: 'event' },
  running: { label: 'Em andamento', color: 'green-7', icon: 'schedule' },
  late: { label: 'Atrasado', color: 'negative', icon: 'event_busy' },
  done: { label: 'Concluído', color: 'positive', icon: 'check_circle' },
};

// dd/mm/aaaa a partir do Y-m-d que a API devolve, sem passar por new Date()
// (que interpreta a string como UTC e volta um dia em fuso negativo).
export function formatDate(date) {
  if (!date) return null;

  const [year, month, day] = String(date).slice(0, 10).split('-');

  return `${day}/${month}/${year}`;
}

// Competência do nível. Dimensão separada do `type` (tarefa, curso, teste...):
// um curso pode ser de comunicação (soft) ou de Docker (hard).
export const SKILLS = {
  soft: { label: 'Soft skill', color: 'purple-8', hex: '#7b1fa2', icon: 'psychology' },
  hard: { label: 'Hard skill', color: 'blue-8', hex: '#1565c0', icon: 'build' },
};

// Onde o nível está no fluxo de envio e avaliação (level_state na API).
export const LEVEL_STATES = {
  pending: { label: 'A fazer', color: 'grey-6', icon: 'radio_button_unchecked' },
  submitted: { label: 'Aguardando avaliação', color: 'amber-8', icon: 'hourglass_top' },
  completed: { label: 'Concluído', color: 'positive', icon: 'check_circle' },
};

// Rótulo do prazo com as datas, usado no diálogo do nível nas duas visões
// (líder e colaborador).
export function periodCaption(level) {
  const label = PERIODS[level.period_state]?.label ?? '';

  if (level.period_state === 'not_started' || !level.ends_at) return label;

  return `${label} · ${formatDate(level.starts_at)} a ${formatDate(level.ends_at)}`;
}

// dd/mm/aaaa -> aaaa-mm-dd, que é o formato que a API espera. Devolve null
// para vazio ou incompleto, o que faz o "limpar prazo" cair naturalmente.
export function toIsoDate(date) {
  const [day, month, year] = String(date ?? '').split('/');

  if (!day || !month || year?.length !== 4) return null;

  return `${year}-${month}-${day}`;
}

export default STATES;
