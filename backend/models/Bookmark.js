const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchPaper", required: true },
    collectionName: { type: String, default: "General", trim: true },
    note: String,
    tags: [String]
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

bookmarkSchema.index({ userId: 1, paperId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, collectionName: 1 });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
