import lodash from 'lodash';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.use(lodash);
  app.config.globalProperties.$lodash = lodash;
});
