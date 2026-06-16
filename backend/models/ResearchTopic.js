const mongoose = require("mongoose");

const yearlySchema = new mongoose.Schema({ year: Number, count: Number }, { _id: false });

const researchTopicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    keywords: [String],
    paperCount: { type: Number, default: 0 },
    trendScore: { type: Number, default: 0 },
    years: [yearlySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResearchTopic", researchTopicSchema);
