const router = require("express").Router();
const controller = require("../controllers/resource.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/", protect, controller.listTopics);
router.get("/popular", protect, controller.popularTopics);
router.get("/emerging", protect, controller.emergingTopics);

module.exports = router;
