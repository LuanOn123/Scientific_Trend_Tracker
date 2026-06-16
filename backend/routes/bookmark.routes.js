const Joi = require("joi");
const router = require("express").Router();
const controller = require("../controllers/resource.controller");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");

const schema = Joi.object({ paperId: Joi.string(), note: Joi.string().allow(""), tags: Joi.array().items(Joi.string()).default([]) });

router.get("/", protect, controller.listBookmarks);
router.post("/", protect, validate(schema.fork(["paperId"], (item) => item.required())), controller.createBookmark);
router.delete("/:id", protect, controller.deleteBookmark);
router.patch("/:id", protect, validate(schema), controller.updateBookmark);

module.exports = router;
