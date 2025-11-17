const express = require("express");
const { isLoggedIn } = require("./middlewares/authMiddleware");

const router = express.Router();

// Page d'accueil (publique)
router.get("/", (req, res) => {
  res.render("home", { title: "Odin Drive Home" });
});

// Page Dashboard (protégée)
router.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("dashboard", { title: "Your Drive", user: req.user });
});

module.exports = router;
