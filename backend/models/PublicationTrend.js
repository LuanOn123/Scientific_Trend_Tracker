const mongoose = require("mongoose");

const publicationTrendSchema = new mongoose.Schema(
  {
    keyword: { type: String, index: true },
    topic: { type: String, index: true },
    journal: { type: String, index: true },
    year: { type: Number, required: true, index: true },
    month: { type: Number, min: 1, max: 12, index: true },
    count: { type: Number, default: 0 },
    sourceName: String
  },
  { timestamps: true }
);

publicationTrendSchema.index({ keyword: 1, topic: 1, journal: 1, year: 1, month: 1, sourceName: 1 });

module.exports = mongoose.model("PublicationTrend", publicationTrendSchema);
