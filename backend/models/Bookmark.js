const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchPaper", required: true },
    note: String,
    tags: [String]
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

bookmarkSchema.index({ userId: 1, paperId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
