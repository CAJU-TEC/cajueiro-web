import useApi from 'src/composables/UseApi';

export default function corporateGroupsService() {
  const { list, post, update, remove } = useApi('api/corporate-groups');

  return {
    list,
    post,
    update,
    remove,
  };
}
