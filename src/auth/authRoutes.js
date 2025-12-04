const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const passport = require("./passport");
const prisma = require("../prismaClient");
const { isGuest } = require("../middlewares/authMiddleware");
const ERRORS = require("../constants/errors"); 

const router = express.Router();

const registerValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value) => {
      const user = await prisma.user.findUnique({ where: { email: value } });
      if (user) {
        return Promise.reject(ERRORS.AUTH.EMAIL_EXISTS);
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
    console.error(`[REGISTER] Failed for email ${email}:`, {
      error: err.message,
      code: err.code,
      stack: err.stack
    });
    res.render("register", {
      title: "Create Account",
      error: ERRORS.GENERAL.INTERNAL_ERROR,
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
    if (err) {
      console.error(`[LOGIN] Authentication error for ${req.body.email}:`, err.message);
      return next(err);
    }
    
    if (!user) {
      console.error(`[LOGIN] Failed login attempt for ${req.body.email}: ${info?.message}`);
      return res.render("login", {
        title: "Log In",
        error: ERRORS.AUTH.INVALID_CREDENTIALS,
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error(`[LOGIN] Session error for user ${user.id}:`, err.message);
        return next(err);
      }
      
      console.log(`[LOGIN] Successful login for user ${user.id} (${user.email})`);
      req.session.success = "Login successful! Welcome!";
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// LOGOUT
router.get("/logout", (req, res) => {
  console.log(`[LOGOUT] User ${req.user?.id} logged out`);
  req.logout(() => {
    req.session.success = "You have been successfully logged out.";
    res.redirect("/");
  });
});

module.exports = router;