exports.ok = (res, data = {}, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data });

exports.fail = (res, message = "Error message", status = 500) =>
  res.status(status).json({ success: false, message });
