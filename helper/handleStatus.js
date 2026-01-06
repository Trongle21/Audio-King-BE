const handleSuccess200 = (res, message, data) => {
  return res.status(200).json({
    message,
    data,
  });
};

const handleSuccess201 = (res, message, data) => {
  return res.status(201).json({
    message,
    data,
  });
};

const handleError400 = (res, message, data) => {
  return res.status(400).json({ message, data });
};

const handleError404 = (res, message, data = null) => {
  return res.status(404).json({ message, data });
};

const handleError409 = (res, message, data = null) => {
  return res.status(409).json({ message, data });
};

const handleError500 = (res, error) => {
  return res.status(500).json({
    message: "Internal server error",
    error: error.message,
  });
};

export {
  handleSuccess200,
  handleSuccess201,
  handleError400,
  handleError404,
  handleError409,
  handleError500,
};
