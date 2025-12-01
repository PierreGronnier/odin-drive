const FileService = require("../services/fileService");
const FolderService = require("../services/folderService");

class FileController {
  static async getDashboard(req, res) {
    try {
      const folders = await FolderService.getRootFolders(req.user.id);

      const allFiles = await FileService.getAllUserFiles(req.user.id);

      let totalFolders = 0;
      try {
        totalFolders = await FolderService.countUserFolders(req.user.id);
      } catch (e) {
        totalFolders = folders.length;
      }

      const totalFiles = allFiles.length;
      const totalSize = allFiles.reduce(
        (sum, file) => sum + (file.size || 0),
        0
      );

      const recentFiles = allFiles.slice(0, 10);

      res.render("dashboard", {
        title: "Your Drive",
        user: req.user,
        folders: folders,
        files: recentFiles,
        totalFolders: totalFolders,
        totalFiles: totalFiles,
        totalSize: totalSize,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.render("dashboard", {
        title: "Your Drive",
        user: req.user,
        folders: [],
        files: [],
        totalFolders: 0,
        totalFiles: 0,
        totalSize: 0,
      });
    }
  }

  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        req.session.error = "Please select a file to upload";
        return res.redirect(req.headers.referer || "/dashboard");
      }

      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        userId: req.user.id,
        folderId: req.body.folderId ? parseInt(req.body.folderId) : null,
      };

      await FileService.createFile(fileData);

      req.session.success = `File "${req.file.originalname}" uploaded successfully!`;

      if (req.body.folderId) {
        return res.redirect(`/folder/${req.body.folderId}`);
      }
      return res.redirect("/dashboard");
    } catch (error) {
      console.error("Upload error:", error);
      FileService.cleanupFile(req.file?.path);
      req.session.error = this.getErrorMessage(error);
      res.redirect(req.headers.referer || "/dashboard");
    }
  }

  static async downloadFile(req, res) {
    try {
      const file = await FileService.getFileById(req.params.id, req.user.id);

      if (!file) {
        req.session.error = "File not found";
        return res.redirect("/dashboard");
      }

      if (!require("fs").existsSync(file.path)) {
        req.session.error = "File no longer exists on server";
        return res.redirect("/dashboard");
      }

      res.download(file.path, file.originalName);
    } catch (error) {
      console.error("Download error:", error);
      req.session.error = "Error downloading file";
      res.redirect("/dashboard");
    }
  }

  static async deleteFile(req, res) {
    try {
      await FileService.deleteFile(req.params.id, req.user.id);

      req.session.success = "File deleted successfully!";
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Delete error:", error);
      req.session.error = "Error deleting file";
      res.redirect("/dashboard");
    }
  }

  static getErrorMessage(error) {
    if (error.message && error.message.startsWith("INVALID_FILE_TYPE:")) {
      const mimeType = error.message.split(":")[1];
      return `File type "${mimeType}" is not allowed. Please upload a supported file type.`;
    }
    if (error.code === "P2002") {
      return "A file with this name already exists";
    }
    if (error instanceof require("multer").MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return "File too large. Maximum size is 100MB.";
      }
      return `Upload error: ${error.message}`;
    }
    return "An unexpected error occurred";
  }
}

module.exports = FileController;
