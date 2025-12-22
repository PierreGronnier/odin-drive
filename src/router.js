const express = require("express");
const { isLoggedIn, isGuest } = require("./middlewares/authMiddleware");
const upload = require("./config/multer-supabase");
const FileController = require("./controllers/fileController");
const FolderController = require("./controllers/folderController");
const validateId = require("./middlewares/validateId");
const { shareAuth } = require("./middlewares/shareAuth");
const ShareController = require("./controllers/shareController");

const router = express.Router();

// Routes publiques
router.get("/", isGuest, (req, res) => {
  res.render("home", { title: "Odin Drive Home" });
});

// Routes protégées
router.get("/dashboard", isLoggedIn, FileController.getDashboard);
router.get(
  "/folder/:id",
  isLoggedIn,
  validateId,
  FolderController.renderFolder
);

// Routes fichiers
router.post(
  "/upload",
  isLoggedIn,
  validateId,
  upload.single("file"),
  FileController.uploadFile
);
router.get("/download/:id", isLoggedIn, FileController.downloadFile);
router.post("/delete/:id", isLoggedIn, validateId, FileController.deleteFile);

// Routes dossiers
router.post("/folders", isLoggedIn, FolderController.createFolder);
router.put(
  "/folders/:id",
  isLoggedIn,
  validateId,
  FolderController.updateFolder
);
router.delete(
  "/folders/:id",
  isLoggedIn,
  validateId,
  FolderController.deleteFolder
);

// Routes de partage
router.post(
  "/folders/:folderId/share",
  isLoggedIn,
  ShareController.createShareLink
);
router.get("/shares", isLoggedIn, ShareController.listUserShares);
router.delete("/shares/:shareId", isLoggedIn, ShareController.revokeShareLink);

// Routes PUBLIQUES de partage (avec middleware shareAuth)
router.get("/share/:token", shareAuth, ShareController.viewSharedFolder);
router.get(
  "/share/:token/folder/:folderId",
  shareAuth,
  ShareController.viewSharedSubfolder
);
router.get(
  "/share/:token/download/:fileId",
  shareAuth,
  ShareController.downloadSharedFile
);
router.post(
  "/share/:token/download-zip",
  shareAuth,
  ShareController.downloadSharedFolderZip
);

module.exports = router;
