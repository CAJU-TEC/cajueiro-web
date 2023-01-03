import useApi from 'src/composables/UseApi';

export default function groupsService() {
  const endpoint = 'api/roles';
  const { list, getById, post, update, remove } = useApi(endpoint);

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
