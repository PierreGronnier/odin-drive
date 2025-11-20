function flashMiddleware(req, res, next) {
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  next();
}

module.exports = flashMiddleware;
