const ERRORS = require("../constants/errors"); 

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  console.error(`[AUTH] Unauthorized access attempt to ${req.path}`);
  req.session.error = ERRORS.AUTH.UNAUTHORIZED;
  res.redirect("/auth/login");
}

function isGuest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  console.log(`[AUTH] Already logged in user ${req.user.id} tried to access ${req.path}`);
  return res
    .status(403)
    .render("alreadyLoggedIn", { title: "Already logged in", user: req.user });
}

module.exports = { isLoggedIn, isGuest };