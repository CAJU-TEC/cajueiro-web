import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.use(can);
  app.config.globalProperties.$can = can;
});
