const formatDates = list => {
  // Takes a list of objects with a date in unix timestamp and returns it in ISO format.
  return list.map(({ created_at, ...rest }) => {
    if (created_at) {
      const time = new Date(created_at);
      created_at = time.toISOString();
      return { created_at, ...rest };
    }
    return { ...rest };
  });
};

const makeRefObj = (list, key, value) => {
  // Takes a list of objects and two strings describing the properties within those objects with are to become the key and value pair in the returned reference object.
  if (!list.length) return {};
  return list.reduce((ref, item) => {
    if (item.hasOwnProperty(key)) {
      if (item.hasOwnProperty(value)) {
        ref[item[key]] = item[value];
      }
    }
    return ref;
  }, {});
};

const formatComments = (comments, articleRef) => {
  // Takes a list of comment objects and formats them.
  let formatedComments = formatDates(comments);
  return formatedComments.map(({ belongs_to, created_by, ...rest }) => {
    return {
      article_id: articleRef[belongs_to],
      author: created_by,
      ...rest
    };
  });
};

module.exports = { formatDates, makeRefObj, formatComments };
