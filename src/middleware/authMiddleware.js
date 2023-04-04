import _ from 'loadsh';
import { LocalStorage } from 'quasar';
import { useUserStore } from 'src/stores/user/user-store';

function can(permissions) {
  const local = useUserStore();

  const permissionsUserLogger = _.map(local.getRoles, (v) => v.name);
  const roleViaPermissionsUserLogger = _.map(local.getPermisssion, (v) => v.name);

  const permissionsOfUser = permissionsUserLogger?.concat(roleViaPermissionsUserLogger);

  const payload = permissions?.map((e) => {
    return (e === true) ? true :  permissionsOfUser?.includes(e);
  }).filter((e) => e === true )
    .shift();

  return (payload);
}

export default can;
