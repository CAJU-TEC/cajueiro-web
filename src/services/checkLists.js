import useApi from 'src/composables/UseApi';

export default function checkListsService() {

  const endpoint = 'api/checkLists';
  const { list, getById, post, update, remove } = useApi(endpoint);

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
