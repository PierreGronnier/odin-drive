const express = require("express");
const { isLoggedIn, isGuest } = require("./middlewares/authMiddleware");
const upload = require("./config/multer");
const FileController = require("./controllers/fileController");
const FolderController = require("./controllers/folderController");

const router = express.Router();

// Routes publiques
router.get("/", isGuest, (req, res) => {
  res.render("home", { title: "Odin Drive Home" });
});

// Routes protégées
router.get("/dashboard", isLoggedIn, FileController.getDashboard);
router.get("/folder/:id", isLoggedIn, FolderController.renderFolder); // ← CHANGÉ !

// Routes fichiers
router.post(
  "/upload",
  isLoggedIn,
  upload.single("file"),
  FileController.uploadFile
);
router.get("/download/:id", isLoggedIn, FileController.downloadFile);
router.post("/delete/:id", isLoggedIn, FileController.deleteFile);

// Routes dossiers
router.post("/folders", isLoggedIn, FolderController.createFolder);
router.put("/folders/:id", isLoggedIn, FolderController.updateFolder);
router.delete("/folders/:id", isLoggedIn, FolderController.deleteFolder);

module.exports = router;
