import useApi from 'src/composables/UseApi';

export default function ticketsService() {
  const { list, getById, post, update, remove } = useApi('api/tickets');

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
