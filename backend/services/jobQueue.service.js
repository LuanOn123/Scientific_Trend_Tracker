const Job = require("../models/Job");

exports.enqueue = async (type, payload = {}, options = {}) =>
  Job.create({
    type,
    payload,
    maxAttempts: options.maxAttempts || 3
  });

exports.claimNext = async (types = []) => {
  const query = {
    status: "queued",
    ...(types.length && { type: { $in: types } })
  };
  return Job.findOneAndUpdate(
    query,
    { $set: { status: "running", lockedAt: new Date(), startedAt: new Date() }, $inc: { attempts: 1 } },
    { new: true, sort: { createdAt: 1 } }
  );
};

exports.complete = async (job, result = {}) =>
  Job.findByIdAndUpdate(job._id, { status: "completed", result, completedAt: new Date() }, { new: true });

exports.fail = async (job, error) => {
  const message = error.response?.data?.message || error.message || "Job failed";
  const canRetry = job.attempts < job.maxAttempts;
  return Job.findByIdAndUpdate(
    job._id,
    {
      status: canRetry ? "queued" : "failed",
      error: message,
      ...(canRetry ? { lockedAt: undefined } : { failedAt: new Date() })
    },
    { new: true }
  );
};

exports.list = async ({ status, type, skip = 0, limit = 100 } = {}) => {
  const filter = { ...(status && { status }), ...(type && { type }) };
  return Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

exports.count = (filter = {}) => Job.countDocuments(filter);
