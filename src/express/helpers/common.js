const response = (res, result, status, message, pagination) => {
  const resultPrint = {
    status: status === 200 || status === 201 ? "success" : "failed",
    statusCode: status,
    data: result,
    message: message || "Success",
  };

  if (pagination) {
    resultPrint.pagination = pagination;
  }

  res.status(status).json(resultPrint);
};

module.exports = { response };
