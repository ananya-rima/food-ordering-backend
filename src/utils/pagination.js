exports.getPagination = (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  return { page, limit, skip: (page - 1) * limit };
};

exports.buildMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
