// Estados de etapa devolvidos por TrailProgressService::progressFor() na API.
export const STATES = {
  completed: { label: 'Concluída', color: 'positive', icon: 'check_circle' },
  unlocked: { label: 'Liberada', color: 'primary', icon: 'radio_button_unchecked' },
  locked: { label: 'Bloqueada', color: 'grey-6', icon: 'lock' },
};

export default STATES;
