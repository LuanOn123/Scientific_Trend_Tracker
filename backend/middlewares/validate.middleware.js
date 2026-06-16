const createError = require("http-errors");

module.exports = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });
  if (error) {
    return next(createError(400, error.details.map((detail) => detail.message).join(", ")));
  }
  req[property] = value;
  return next();
};
