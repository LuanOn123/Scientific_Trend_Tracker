const parsePagination = (query = {}, defaults = {}) => {
  const page = Math.max(Number(query.page || defaults.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || defaults.limit || 12), 1), defaults.maxLimit || 100);
  return { page, limit, skip: (page - 1) * limit };
};

const pagePayload = ({ items, total, page, limit, extra = {} }) => ({
  ...extra,
  items,
  total,
  page,
  limit,
  pages: Math.max(Math.ceil(total / limit), 1)
});

module.exports = { parsePagination, pagePayload };
