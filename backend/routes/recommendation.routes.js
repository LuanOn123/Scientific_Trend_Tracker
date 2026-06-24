const router = require("express").Router();
const controller = require("../controllers/recommendation.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/", protect, controller.list);
router.post("/rebuild", protect, controller.rebuildMine);

module.exports = router;
