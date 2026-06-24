const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchPaper", required: true },
    score: { type: Number, default: 0 },
    reasons: [String]
  },
  { timestamps: true }
);

recommendationSchema.index({ userId: 1, paperId: 1 }, { unique: true });
recommendationSchema.index({ userId: 1, score: -1 });

module.exports = mongoose.model("Recommendation", recommendationSchema);
