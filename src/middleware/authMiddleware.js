import chalk from 'chalk';

const error = chalk.bold.red;
const warning = chalk.hex('#FFA500');

function can(permissions) {
  // if (!permissions) return false;
  const permissionsUserLogger = JSON.parse(localStorage.getItem('permissions'))?.map((p) => p.name);
  const roleViaPermissionsUserLogger = JSON.parse(localStorage.getItem('roles'))?.map((p) => p.name);
  const permissionsOfUser = permissionsUserLogger?.concat(roleViaPermissionsUserLogger);
  console.log(warning(permissionsOfUser));
  const payload = permissions?.map((e) => {
    return permissionsOfUser?.includes(e);
  }).filter((e) => e === true )
    .shift();

  return (payload === true);
}

export { can };
