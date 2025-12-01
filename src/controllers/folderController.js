const FolderService = require("../services/folderService");

class FolderController {
  static async createFolder(req, res) {
    try {
      const { name, parentId } = req.body;

      if (!name || name.trim() === "") {
        req.session.error = "Folder name is required";
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
      console.error("Create folder error:", error);
      req.session.error = "Error creating folder";
      res.redirect("/dashboard");
    }
  }

  static async updateFolder(req, res) {
    try {
      const { name } = req.body;
      const { id } = req.params;

      if (!name || name.trim() === "") {
        req.session.error = "Folder name is required";
        return res.redirect("/dashboard");
      }

      await FolderService.updateFolder(id, req.user.id, name.trim());

      req.session.success = "Folder updated successfully!";

      return res.redirect("/dashboard");
    } catch (error) {
      console.error("Update folder error:", error);
      req.session.error = "Error updating folder";
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
      console.error("Delete folder error:", error);
      req.session.error = "Error deleting folder";
      res.redirect("/dashboard");
    }
  }

  static async renderFolder(req, res) {
  try {
    const folderId = req.params.id;
    
    const currentFolder = await FolderService.getFolderById(folderId, req.user.id);
    
    if (!currentFolder) {
      req.session.error = "Folder not found";
      return res.redirect("/dashboard");
    }

    const files = currentFolder.files || [];

    res.render("folder", {
      title: `📁 ${currentFolder.name}`,
      user: req.user,
      files: files,
      folders: currentFolder.children || [],
      currentFolder: currentFolder
    });
    
  } catch (error) {
    console.error("Render folder error:", error);
    req.session.error = "Error accessing folder";
    res.redirect("/dashboard");
  }
}
}

module.exports = FolderController;
