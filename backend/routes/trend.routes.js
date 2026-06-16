const router = require("express").Router();
const controller = require("../controllers/trend.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/overview", protect, controller.overview);
router.get("/by-keyword", protect, controller.byKeyword);
router.get("/by-topic", protect, controller.byTopic);
router.get("/by-journal", protect, controller.byJournal);
router.get("/keywords-by-year", protect, controller.keywordYearMatrix);
router.get("/emerging", protect, controller.emerging);

module.exports = router;
