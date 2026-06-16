const mongoose = require("mongoose");

const syncLogSchema = new mongoose.Schema({
  sourceName: { type: String, required: true },
  status: { type: String, required: true },
  message: String,
  totalFetched: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date
});

module.exports = mongoose.model("SyncLog", syncLogSchema);
