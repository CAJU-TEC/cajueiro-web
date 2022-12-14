import useApi from 'src/composables/UseApi';

export default function impactsService() {
  const { list, getById, post, update, remove } = useApi('api/impacts');

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
