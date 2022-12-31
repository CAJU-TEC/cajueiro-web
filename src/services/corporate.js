import useApi from 'src/composables/UseApi';

export default function corporatesService() {
  const { list, getById, post, update, remove } = useApi('api/corporates');

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
