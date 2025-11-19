function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/auth/login");
}

function isGuest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  return res
    .status(403)
    .render("alreadyLoggedIn", { title: "Déjà connecté", user: req.user });
}

module.exports = { isLoggedIn, isGuest };
