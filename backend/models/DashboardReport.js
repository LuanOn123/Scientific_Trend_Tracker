const mongoose = require("mongoose");

const dashboardReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    filters: mongoose.Schema.Types.Mixed,
    summary: mongoose.Schema.Types.Mixed,
    chartData: mongoose.Schema.Types.Mixed
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("DashboardReport", dashboardReportSchema);
