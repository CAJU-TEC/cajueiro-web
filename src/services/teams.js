import useApi from 'src/composables/UseApi';

export default function teamsService() {
  const { list, getById, post, update, remove } = useApi('api/teams');

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
