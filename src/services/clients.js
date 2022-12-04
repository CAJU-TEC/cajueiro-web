import useApi from 'src/composables/UseApi';

export default function clientsService() {
  const { list, getById, post, update, remove } = useApi('clients');

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
