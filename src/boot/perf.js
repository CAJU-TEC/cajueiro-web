import { boot } from 'quasar/wrappers';

// O quasar dev liga a medição de render do Vue (app.config.performance). No Firefox essas medições
// se acumulam e a página fica cada vez mais lenta. Só afeta o dev: em produção a flag já vem desligada.
export default boot(({ app }) => {
  app.config.performance = false;
});
