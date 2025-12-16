const FileService = require("../services/fileService");
const FolderService = require("../services/folderService");
const ERRORS = require("../constants/errors");

class FileController {
  static async getDashboard(req, res) {
    try {
      const folders = await FolderService.getRootFolders(req.user.id);

      const page = parseInt(req.query.page) || 1;
      const limit = 10;

      const filesData = await FileService.getAllUserFilesPaginated(
        req.user.id,
        page,
        limit
      );

      const allFiles = await FileService.getAllUserFiles(req.user.id);

      let totalFolders = 0;
      try {
        totalFolders = await FolderService.countUserFolders(req.user.id);
      } catch (e) {
        console.error(
          `[DASHBOARD] Failed to count folders for user ${req.user.id}:`,
          e.message
        );
        totalFolders = folders.length;
      }

      const totalFiles = allFiles.length;
      const totalSize = allFiles.reduce(
        (sum, file) => sum + (file.size || 0),
        0
      );

      res.render("dashboard", {
        title: "Your Drive",
        user: req.user,
        folders: folders,
        files: filesData.files,
        pagination: {
          currentPage: filesData.page,
          totalPages: filesData.totalPages,
          hasNext: filesData.hasNextPage,
          hasPrev: filesData.hasPrevPage,
          totalFiles: filesData.total,
          limit: filesData.limit,
        },
        totalFolders: totalFolders,
        totalFiles: totalFiles,
        totalSize: totalSize,
      });
    } catch (error) {
      console.error(`[DASHBOARD] Error for user ${req.user?.id}:`, {
        message: error.message,
        stack: error.stack,
        userId: req.user?.id,
      });
      req.session.error = ERRORS.GENERAL.INTERNAL_ERROR;
      res.render("dashboard", {
        title: "Your Drive",
        user: req.user,
        folders: [],
        files: [],
        pagination: null,
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
      console.error(`[UPLOAD] Failed for user ${req.user.id}:`, {
        fileName: req.file?.originalname,
        folderId: req.body.folderId,
        fileSize: req.file?.size,
        error: error.message,
        code: error.code,
      });

      FileService.cleanupFile(req.file?.path);
      req.session.error = this.getErrorMessage(error);
      res.redirect(req.headers.referer || "/dashboard");
    }
  }

  static async downloadFile(req, res) {
    try {
      const file = await FileService.getFileById(req.params.id, req.user.id);

      if (!file) {
        console.error(
          `[DOWNLOAD] File not found: ID ${req.params.id}, User ${req.user.id}`
        );
        req.session.error = ERRORS.FILE.NOT_FOUND;
        return res.redirect("/dashboard");
      }

      if (!require("fs").existsSync(file.path)) {
        console.error(`[DOWNLOAD] File missing on disk: ${file.path}`);
        req.session.error = ERRORS.FILE.NOT_FOUND;
        return res.redirect("/dashboard");
      }

      res.download(file.path, file.originalName);
    } catch (error) {
      console.error(`[DOWNLOAD] Error for user ${req.user.id}:`, {
        fileId: req.params.id,
        error: error.message,
        stack: error.stack,
      });
      req.session.error = ERRORS.FILE.DOWNLOAD_FAILED;
      res.redirect("/dashboard");
    }
  }

  static async deleteFile(req, res) {
    try {
      await FileService.deleteFile(req.params.id, req.user.id);

      req.session.success = "File deleted successfully!";
      res.redirect("/dashboard");
    } catch (error) {
      console.error(`[DELETE_FILE] Failed for user ${req.user.id}:`, {
        fileId: req.params.id,
        error: error.message,
        code: error.code,
      });
      req.session.error = ERRORS.FILE.DELETE_FAILED;
      res.redirect("/dashboard");
    }
  }

  static getErrorMessage(error) {
    console.error(`[FILE_ERROR] Type: ${error.constructor.name}`);
    console.error(`Message: ${error.message}`);
    if (error.code) console.error(`Code: ${error.code}`);

    if (error.message && error.message.startsWith("INVALID_FILE_TYPE:")) {
      const mimeType = error.message.split(":")[1];
      return `File type "${mimeType}" is not allowed. Please upload a supported file type.`;
    }
    if (error.code === "P2002") {
      return "A file with this name already exists";
    }
    if (error instanceof require("multer").MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return ERRORS.FILE.TOO_LARGE;
      }
      return `Upload error: ${error.message}`;
    }
    return ERRORS.GENERAL.INTERNAL_ERROR;
  }
}

module.exports = FileController;
