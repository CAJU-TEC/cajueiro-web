export const LIST_TAB_KEY = 'tickets.list.tab';
const RESTORE_FLAG_KEY = 'tickets.list.restore';
const FLAG_TTL_MS = 5000;

const safe = (fn, fallback) => {
  try {
    return fn();
  } catch (e) {
    return fallback;
  }
};

// Chamado por links que "voltam" para a lista (ex.: breadcrumb dos detalhes).
export const markListRestore = () =>
  safe(() => sessionStorage.setItem(RESTORE_FLAG_KEY, String(Date.now())));

export const rememberListTab = (tab) =>
  safe(() => sessionStorage.setItem(LIST_TAB_KEY, tab));

// A aba só é lembrada ao voltar de um protocolo (botão voltar do navegador ou link
// marcado com markListRestore); entrando pelo menu abre em "Abertos".
export const savedListTab = (validTabs) =>
  safe(() => {
    const flagTime = Number(sessionStorage.getItem(RESTORE_FLAG_KEY) ?? 0);
    const flagged = Date.now() - flagTime < FLAG_TTL_MS;
    const forward = String(window.history.state?.forward ?? '');
    const returning = flagged || forward.includes('/tickets/details');
    const saved = sessionStorage.getItem(LIST_TAB_KEY);

    if (returning && validTabs.includes(saved)) return saved;

    // entrada nova: zera a aba guardada para não restaurar valor antigo depois
    rememberListTab('ticketsOpen');
    return 'ticketsOpen';
  }, 'ticketsOpen');
