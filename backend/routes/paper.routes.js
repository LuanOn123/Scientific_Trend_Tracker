const Joi = require("joi");
const router = require("express").Router();
const controller = require("../controllers/paper.controller");
const validate = require("../middlewares/validate.middleware");
const { protect, allowRoles } = require("../middlewares/auth.middleware");

router.get("/", protect, controller.list);
router.get("/search", protect, validate(controller.searchSchema, "query"), controller.search);
router.post("/sync", protect, allowRoles("researcher", "admin"), validate(Joi.object({ keywords: Joi.array().items(Joi.string()).optional() })), controller.sync);
router.get("/:id", protect, controller.detail);

module.exports = router;
