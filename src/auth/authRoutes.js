const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const passport = require("./passport");
const prisma = require("../prismaClient");
const { isGuest } = require("../middlewares/authMiddleware");

const router = express.Router();

const registerValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value) => {
      const user = await prisma.user.findUnique({ where: { email: value } });
      if (user) {
        return Promise.reject("An account with this email already exists.");
      }
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match.");
    }
    return true;
  }),
];

const loginValidationRules = [
  body("email").isEmail().withMessage("Please enter a valid email address."),
  body("password").notEmpty().withMessage("Password is required."),
];

// GET REGISTER
router.get("/register", isGuest, (req, res) => {
  res.render("register", {
    title: "Create Account",
    error: undefined,
  });
});

// POST REGISTER
router.post("/register", isGuest, registerValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("register", {
      title: "Create Account",
      error: errors.array()[0].msg,
      email: req.body.email,
    });
  }

  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    req.session.success = "Account created successfully! You can now log in.";
    res.redirect("/auth/login");
  } catch (err) {
    console.error("Unexpected registration error:", err);
    res.render("register", {
      title: "Create Account",
      error: "An unexpected error occurred during account creation.",
      email: req.body.email,
    });
  }
});

// GET LOGIN
router.get("/login", isGuest, (req, res) => {
  res.render("login", { title: "Log In" });
});

// POST LOGIN
router.post("/login", isGuest, loginValidationRules, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("login", {
      title: "Log In",
      error: errors.array()[0].msg,
    });
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render("login", {
        title: "Log In",
        error: info.message || "Email or password incorrect",
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.success = "Login successful! Welcome!";
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.success = "You have been successfully logged out.";
    res.redirect("/");
  });
});

module.exports = router;
