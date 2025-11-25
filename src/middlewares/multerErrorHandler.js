const multer = require("multer");

function multerErrorHandler(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      req.session.error = "File too large. Maximum size is 10MB.";
      return res.redirect("/dashboard");
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      req.session.error = "Too many files. Please upload one file at a time.";
      return res.redirect("/dashboard");
    }
  }

  if (error.message && error.message.startsWith("INVALID_FILE_TYPE:")) {
    const mimeType = error.message.split(":")[1];
    req.session.error = `File type "${mimeType}" is not allowed. Please upload a supported file type.`;
    return res.redirect("/dashboard");
  }

  next(error);
}

module.exports = multerErrorHandler;
