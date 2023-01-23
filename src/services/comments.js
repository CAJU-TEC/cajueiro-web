import useApi from 'src/composables/UseApi';

export default function commentsService() {
  const { list, getById, post, update, remove } = useApi('api/comments');

  return {
    list,
    getById,
    post,
    update,
    remove,
  };
}
