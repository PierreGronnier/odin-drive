const FileService = require("../services/fileService");

class FileController {
  static async getDashboard(req, res) {
    try {
      const files = await FileService.getUserFiles(req.user.id);

      res.render("dashboard", {
        title: "Your Drive",
        user: req.user,
        files: files,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.render("dashboard", {
        title: "Your Drive",
        user: req.user,
        files: [],
      });
    }
  }

  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        req.session.error = "Please select a file to upload";
        return res.redirect("/dashboard");
      }

      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        userId: req.user.id,
      };

      await FileService.createFile(fileData);

      req.session.success = `File "${req.file.originalname}" uploaded successfully!`;
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Upload error:", error);
      FileService.cleanupFile(req.file?.path);

      req.session.error = this.getErrorMessage(error);
      res.redirect("/dashboard");
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
