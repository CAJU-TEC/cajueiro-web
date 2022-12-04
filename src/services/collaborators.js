import useApi from 'src/composables/UseApi';

export default function collaboratorsService() {
  const { list, getById, post, update, remove } = useApi('collaborators');

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
