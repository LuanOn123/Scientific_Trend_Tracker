const router = require("express").Router();
const controller = require("../controllers/resource.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/", protect, controller.listJournals);
router.get("/:id", protect, controller.journalDetail);
router.get("/:id/trends", protect, controller.journalTrends);
router.get("/:id/papers", protect, controller.journalPapers);

module.exports = router;
