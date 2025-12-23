const ShareService = require("../services/shareService");
const DownloadService = require("../services/downloadService"); // AJOUT
const path = require("path");
const fs = require("fs");
const prisma = require("../prismaClient");
const fetch = require("node-fetch");

class ShareController {
  static async createShareLink(req, res) {
    try {
      const { folderId } = req.params;
      const { duration } = req.body;

      const durationDays = parseInt(duration);

      req.session.shareDuration = durationDays;

      const shareLink = await ShareService.createShareLink(
        req.user.id,
        parseInt(folderId),
        durationDays
      );

      const shareUrl = `${req.protocol}://${req.get("host")}/share/${
        shareLink.token
      }`;

      req.session.success = `Share link created! Valid for ${durationDays} days.`;
      req.session.shareUrl = shareUrl;

      res.redirect(`/shares`);
    } catch (error) {
      console.error("[SHARE] Error:", error);
      req.session.error = "Failed to create share link";
      res.redirect("back");
    }
  }

  static async viewSharedFolder(req, res) {
    try {
      const { token } = req.params;

      res.render("shared-folder", {
        title: `Shared: ${req.sharedFolder.name}`,
        folder: req.sharedFolder,
        shareToken: token,
        shareLink: req.shareLink,
        isSharedAccess: true,
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });
    } catch (error) {
      console.error("[SHARE_VIEW] Error:", error);
      res.status(500).render("404", {
        title: "Error",
        message: "Could not load shared folder",
      });
    }
  }

  static async viewSharedSubfolder(req, res) {
    try {
      const { token, folderId } = req.params;

      const subfolder = await prisma.folder.findFirst({
        where: {
          id: parseInt(folderId),
          OR: [
            { id: req.sharedFolder.id },
            { parentId: req.sharedFolder.id },
            { parent: { parentId: req.sharedFolder.id } },
          ],
        },
        include: {
          files: true,
          children: {
            include: {
              _count: {
                select: { files: true, children: true },
              },
            },
          },
          user: {
            select: { email: true },
          },
          _count: {
            select: { files: true, children: true },
          },
        },
      });

      if (!subfolder) {
        return res.status(404).render("404", {
          title: "Folder Not Found",
          message: "This folder is not available in this shared link.",
        });
      }

      res.render("shared-folder", {
        title: `Shared: ${subfolder.name}`,
        folder: subfolder,
        shareToken: token,
        shareLink: req.shareLink,
        isSharedAccess: true,
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });
    } catch (error) {
      console.error("[SHARE_SUBFOLDER] Error:", error);
      res.status(500).send("Could not load subfolder");
    }
  }

  static async downloadSharedFile(req, res) {
    try {
      const { token, fileId } = req.params;

      const file = await ShareService.getSharedFile(fileId, token);

      if (!file || !file.url) {
        return res.status(404).render("404", {
          title: "File Not Found",
          message: "The requested file is not available.",
        });
      }

      await DownloadService.streamFile(file, res);
    } catch (error) {
      console.error("[SHARE_DOWNLOAD] Error:", error);
      if (!res.headersSent) {
        res.status(500).send("Download failed");
      }
    }
  }

  static async downloadSharedFolderZip(req, res) {
    try {
      const archiver = require("archiver");
      const { token } = req.params;
      const folder = req.sharedFolder;

      const zipFileName = `${folder.name.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_${Date.now()}.zip`;

      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      res.attachment(`${folder.name}.zip`);

      archive.pipe(res);

      archive.on("error", (err) => {
        console.error("[ZIP] Archive error:", err);
        if (!res.headersSent) {
          res.status(500).send("Failed to create ZIP file");
        }
      });

      const addFolderToArchive = async (folderId, currentPath = "") => {
        const currentFolder = await prisma.folder.findUnique({
          where: { id: folderId },
          include: {
            files: true,
            children: true,
          },
        });

        for (const file of currentFolder.files) {
          if (file.url) {
            try {
              console.log(
                `[ZIP] Téléchargement: ${file.originalName} depuis ${file.url}`
              );

              const response = await fetch(file.url);

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }

              const buffer = await response.buffer();

              const zipPath = currentPath
                ? `${currentPath}/${file.originalName}`
                : file.originalName;

              archive.append(buffer, { name: zipPath });

              console.log(
                `[ZIP] ✓ Ajouté: ${zipPath} (${buffer.length} bytes)`
              );
            } catch (error) {
              console.error(
                `[ZIP] ✗ Erreur avec ${file.originalName}:`,
                error.message
              );
              archive.append(
                `Erreur: impossible de télécharger ${file.originalName}\n${error.message}`,
                {
                  name: `${currentPath ? currentPath + "/" : ""}ERREUR_${
                    file.originalName
                  }.txt`,
                }
              );
            }
          } else {
            console.warn(`[ZIP] Fichier sans URL: ${file.originalName}`);
          }
        }

        for (const child of currentFolder.children) {
          const childPath = currentPath
            ? `${currentPath}/${child.name}`
            : child.name;

          await addFolderToArchive(child.id, childPath);
        }
      };

      res.setTimeout(300000);

      console.log(
        `[ZIP] Début de création pour le dossier: ${folder.name} (ID: ${folder.id})`
      );
      await addFolderToArchive(folder.id, folder.name);

      archive.finalize();

      console.log(`[ZIP] Archive finalisée, envoi au client...`);
    } catch (error) {
      console.error("[ZIP_DOWNLOAD] Error:", error);
      if (!res.headersSent) {
        res.status(500).send("Failed to create ZIP file");
      }
    }
  }

  static async listUserShares(req, res) {
    try {
      const shares = await ShareService.getUserShareLinks(req.user.id);

      res.render("my-shares", {
        title: "My Share Links",
        user: req.user,
        shares,
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });
    } catch (error) {
      console.error("[SHARE_LIST] Error:", error);
      req.session.error = "Failed to load share links";
      res.redirect("/dashboard");
    }
  }

  static async revokeShareLink(req, res) {
    try {
      const { shareId } = req.params;

      await prisma.shareLink.delete({
        where: { id: shareId, userId: req.user.id },
      });

      req.session.success = "Share link revoked";
      res.redirect("/shares");
    } catch (error) {
      console.error("[SHARE_REVOKE] Error:", error);
      req.session.error = "Failed to revoke share link";
      res.redirect("back");
    }
  }
}

module.exports = ShareController;
