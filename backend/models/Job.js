const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true },
    status: { type: String, enum: ["queued", "running", "completed", "failed"], default: "queued", index: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    result: mongoose.Schema.Types.Mixed,
    error: String,
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lockedAt: Date,
    startedAt: Date,
    completedAt: Date,
    failedAt: Date
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: 1 });
jobSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("Job", jobSchema);
