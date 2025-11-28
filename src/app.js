const express = require("express");
const session = require("express-session");
const PrismaSessionStore =
  require("@quixo3/prisma-session-store").PrismaSessionStore;
const path = require("path");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const userLocals = require("./middlewares/userLocals");
const flashMiddleware = require("./middlewares/flashMiddleware");
const viewHelpers = require("./middlewares/viewHelpers");
const multerErrorHandler = require("./middlewares/multerErrorHandler");
const prisma = require("./prismaClient");
const passport = require("./auth/passport");
const authRoutes = require("./auth/authRoutes");
const mainRoutes = require("./router");
const methodOverride = require("method-override");

dotenv.config();

const app = express();

// Middlewares de base
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(expressLayouts);
app.set("layout", "layout");

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
  })
);

// Passport et middlewares perso
app.use(passport.initialize());
app.use(passport.session());
app.use(userLocals);
app.use(flashMiddleware);
app.use(viewHelpers);
app.use(methodOverride("_method"));

// ROUTES
app.use("/", mainRoutes);
app.use("/auth", authRoutes);

// Gestion d'erreurs Multer
app.use(multerErrorHandler);

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
