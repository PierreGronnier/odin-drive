const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("./passport");
const prisma = require("../prismaClient");

const router = express.Router();

// GET REGISTER
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Create Account",
  });
});

// POST REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.redirect("/auth/login");
  } catch (err) {
    console.log(err);
    res.send("Error with account creation");
  }
});

// GET LOGIN
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Log In",
  });
});

// POST LOGIN
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.render("login", {
        title: "Log In",
        error: info.message || "Email or password incorrect",
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
