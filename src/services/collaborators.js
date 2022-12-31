import useApi from 'src/composables/UseApi';

export default function collaboratorsService() {
  const { list, getById, post, update, remove } = useApi('api/collaborators');

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
