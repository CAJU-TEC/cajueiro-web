import useApi from 'src/composables/UseApi';

export default function dutiesService() {
  const { list, getById, post, update, remove } = useApi('api/duties');

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
