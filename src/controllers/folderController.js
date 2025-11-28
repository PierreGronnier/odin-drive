const FolderService = require("../services/folderService");

class FolderController {
  static async createFolder(req, res) {
    try {
      const { name, parentId } = req.body;

      if (!name || name.trim() === "") {
        if (req.accepts("html")) {
          req.session.error = "Folder name is required";
          return res.redirect("/dashboard");
        }
        return res.status(400).json({ error: "Folder name is required" });
      }

      const folderData = {
        name: name.trim(),
        userId: req.user.id,
        parentId: parentId ? parseInt(parentId) : null,
      };

      await FolderService.createFolder(folderData);

      if (req.accepts("html")) {
        req.session.success = `Folder "${name}" created successfully!`;
        return res.redirect("/dashboard");
      }

      res.json({ success: true, message: "Folder created successfully" });
    } catch (error) {
      console.error("Create folder error:", error);

      if (req.accepts("html")) {
        req.session.error = "Error creating folder";
        return res.redirect("/dashboard");
      }

      res.status(500).json({ error: "Error creating folder" });
    }
  }

  static async updateFolder(req, res) {
    try {
      const { name } = req.body;
      const { id } = req.params;

      if (!name || name.trim() === "") {
        if (req.accepts("html")) {
          req.session.error = "Folder name is required";
          return res.redirect("/dashboard");
        }
        return res.status(400).json({ error: "Folder name is required" });
      }

      await FolderService.updateFolder(id, req.user.id, name.trim());

      if (req.accepts("html")) {
        req.session.success = "Folder updated successfully!";
        return res.redirect("/dashboard");
      }

      res.json({ success: true, message: "Folder updated successfully" });
    } catch (error) {
      console.error("Update folder error:", error);

      if (req.accepts("html")) {
        req.session.error = "Error updating folder";
        return res.redirect("/dashboard");
      }

      res.status(500).json({ error: "Error updating folder" });
    }
  }

  static async deleteFolder(req, res) {
    try {
      const { id } = req.params;

      await FolderService.deleteFolder(id, req.user.id);

      if (req.accepts("html")) {
        req.session.success = "Folder deleted successfully!";
        return res.redirect("/dashboard");
      }

      res.json({ success: true, message: "Folder deleted successfully" });
    } catch (error) {
      console.error("Delete folder error:", error);

      if (req.accepts("html")) {
        req.session.error = "Error deleting folder";
        return res.redirect("/dashboard");
      }

      res.status(500).json({ error: "Error deleting folder" });
    }
  }

  static async getFolder(req, res) {
    try {
      const { id } = req.params;
      const folder = await FolderService.getFolderById(id, req.user.id);

      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }

      res.json({ success: true, folder });
    } catch (error) {
      console.error("Get folder error:", error);
      res.status(500).json({ error: "Error fetching folder" });
    }
  }
}

module.exports = FolderController;
