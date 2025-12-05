const FolderService = require('../services/folderService');
const ERRORS = require('../constants/errors');

class FolderController {
  static async createFolder(req, res) {
    try {
      const { name, parentId } = req.body;

      if (!name || name.trim() === "") {
        req.session.error = ERRORS.FOLDER.NAME_REQUIRED;
        return res.redirect("/dashboard");
      }

      const folderData = {
        name: name.trim(),
        userId: req.user.id,
        parentId: parentId ? parseInt(parentId) : null,
      };

      await FolderService.createFolder(folderData);

      req.session.success = `Folder "${name}" created successfully!`;

      if (parentId) {
        return res.redirect(`/folder/${parentId}`);
      }
      return res.redirect("/dashboard");
    } catch (error) {
      console.error(`[CREATE_FOLDER] Failed for user ${req.user.id}:`, {
        name: req.body.name,
        parentId: req.body.parentId,
        error: error.message,
        code: error.code
      });
      req.session.error = ERRORS.FOLDER.CREATE_FAILED;
      res.redirect("/dashboard");
    }
  }

  static async updateFolder(req, res) {
    try {
      const { name } = req.body;
      const { id } = req.params;

      if (!name || name.trim() === "") {
        req.session.error = ERRORS.FOLDER.NAME_REQUIRED;
        return res.redirect("/dashboard");
      }

      await FolderService.updateFolder(id, req.user.id, name.trim());

      req.session.success = "Folder updated successfully!";

      return res.redirect("/dashboard");
    } catch (error) {
      console.error(`[UPDATE_FOLDER] Failed for user ${req.user.id}:`, {
        folderId: req.params.id,
        newName: req.body.name,
        error: error.message,
        code: error.code
      });
      req.session.error = ERRORS.FOLDER.UPDATE_FAILED;
      res.redirect("/dashboard");
    }
  }

  static async deleteFolder(req, res) {
    try {
      const { id } = req.params;

      await FolderService.deleteFolder(id, req.user.id);

      req.session.success = "Folder deleted successfully!";
      return res.redirect("/dashboard");
    } catch (error) {
      console.error(`[DELETE_FOLDER] Failed for user ${req.user.id}:`, {
        folderId: req.params.id,
        error: error.message,
        code: error.code
      });
      req.session.error = ERRORS.FOLDER.DELETE_FAILED;
      res.redirect("/dashboard");
    }
  }

  static async renderFolder(req, res) {
    try {
      const folderId = req.params.id; 
      
      const currentFolder = await FolderService.getFolderById(folderId, req.user.id);
      
      if (!currentFolder) {
        console.error(`[RENDER_FOLDER] Folder not found: ID ${folderId}, User ${req.user.id}`);
        req.session.error = ERRORS.FOLDER.NOT_FOUND;
        return res.redirect("/dashboard");
      }

      const files = currentFolder.files || [];

      res.render("folder", {
        title: `${currentFolder.name}`,
        user: req.user,
        files: files,
        folders: currentFolder.children || [],
        currentFolder: currentFolder,
        baseUrl: `${req.protocol}://${req.get('host')}`
      });
      
    } catch (error) {
      if (error.code?.startsWith('P') || error.message?.includes('Prisma')) {
        console.error(`[PRISMA_ERROR] Folder ${req.params.id} for user ${req.user.id}:`, {
          error: error.message.split('\n')[0]
        });
        req.session.error = ERRORS.GENERAL.INTERNAL_ERROR;
      } else {
        console.error(`[RENDER_FOLDER] Error for user ${req.user.id}:`, {
          folderId: req.params.id,
          error: error.message
        });
        req.session.error = ERRORS.GENERAL.INTERNAL_ERROR;
      }
      
      res.redirect("/dashboard");
    }
  }
}

module.exports = FolderController;