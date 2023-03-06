const can = (to, from, next) => {

  const permissionsMeta = to?.meta?.permissions;
  const permissionsUserLogger = JSON.parse(localStorage.getItem('permissions')).map((p) => p.name);
  const roleViaPermissionsUserLogger = JSON.parse(localStorage.getItem('roles')).map((p) => p.name);

  const permissionsOfUser = permissionsUserLogger.concat(roleViaPermissionsUserLogger);

  const payload = permissionsMeta.map((e) => {
    return permissionsOfUser.includes(e);
  }).filter((e) => e === true )
    .shift();

  if(payload === true) {
    next(true);
  } else {
    next(false);
  }

};

export default can;
