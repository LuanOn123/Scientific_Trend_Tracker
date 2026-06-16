const Joi = require("joi");
const router = require("express").Router();
const controller = require("../controllers/resource.controller");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");

router.get("/", protect, controller.listKeywords);
router.get("/popular", protect, controller.popularKeywords);
router.get("/:keyword/trends", protect, controller.keywordTrends);
router.post("/follow", protect, validate(Joi.object({ keyword: Joi.string().required() })), controller.followKeyword);
router.delete("/follow/:keyword", protect, controller.unfollowKeyword);

module.exports = router;
