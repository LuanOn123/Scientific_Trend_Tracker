const mongoose = require("mongoose");

const yearlySchema = new mongoose.Schema({ year: Number, count: Number }, { _id: false });

const keywordSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    normalizedName: { type: String, required: true, unique: true, index: true },
    paperCount: { type: Number, default: 0 },
    trendScore: { type: Number, default: 0 },
    years: [yearlySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Keyword", keywordSchema);
