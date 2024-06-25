const checkRequiredParameters = (parameters) => (req, res, next) => {
  const missingParameters = parameters.filter(
    (parameter) => !req.params[parameter]
  );
  if (missingParameters.length > 0) {
    return res.status(400).json({
      error: "Missing required parameters",
      missingParameters: missingParameters,
    });
  }

  next();
};

module.exports = {
  checkRequiredParameters: checkRequiredParameters,
};
