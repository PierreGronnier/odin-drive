const express = require("express");
const { isLoggedIn, isGuest } = require("./middlewares/authMiddleware");

const router = express.Router();

// Page d'accueil publique (non-connectée)
router.get("/", isGuest, (req, res) => {
  res.render("home", { title: "Odin Drive Home" });
});

// Dashboard (connecté uniquement)
router.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("dashboard", { title: "Your Drive", user: req.user });
});

module.exports = router;
