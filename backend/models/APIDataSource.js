const mongoose = require("mongoose");

const apiDataSourceSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ["OpenAlex", "Crossref", "Semantic Scholar"], required: true, unique: true },
    baseUrl: { type: String, required: true },
    apiKeyRequired: { type: Boolean, default: false },
    apiKeyEnvName: String,
    isEnabled: { type: Boolean, default: true },
    lastSyncAt: Date,
    status: { type: String, enum: ["active", "inactive", "error"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("APIDataSource", apiDataSourceSchema);
