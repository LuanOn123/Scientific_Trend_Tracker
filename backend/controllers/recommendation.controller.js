const recommendation = require("../services/recommendation.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");

exports.list = asyncHandler(async (req, res) => {
  const items = await recommendation.listForUser(req.user._id, Number(req.query.limit || 10));
  ok(res, { items });
});

exports.rebuildMine = asyncHandler(async (req, res) => {
  const items = await recommendation.rebuildForUser(req.user);
  ok(res, { items }, "Recommendations rebuilt");
});
