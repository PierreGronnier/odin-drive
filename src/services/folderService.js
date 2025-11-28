const prisma = require("../prismaClient");

class FolderService {
  static async getUserFolders(userId) {
    return await prisma.folder.findMany({
      where: { userId },
      include: {
        files: true,
        children: true,
        _count: {
          select: {
            files: true,
            children: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getFolderById(id, userId) {
    return await prisma.folder.findFirst({
      where: { id: parseInt(id), userId },
      include: {
        files: {
          orderBy: { createdAt: "desc" },
        },
        children: {
          include: {
            _count: {
              select: {
                files: true,
                children: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async createFolder(folderData) {
    return await prisma.folder.create({
      data: folderData,
    });
  }

  static async updateFolder(id, userId, name) {
    return await prisma.folder.updateMany({
      where: { id: parseInt(id), userId },
      data: { name },
    });
  }

  static async deleteFolder(id, userId) {
    const folder = await this.getFolderById(id, userId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    if (folder.files.length > 0) {
      const fs = require("fs");
      folder.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    return await prisma.folder.delete({
      where: { id: folder.id },
    });
  }

  static async getRootFolders(userId) {
    return await prisma.folder.findMany({
      where: {
        userId,
        parentId: null,
      },
      include: {
        _count: {
          select: {
            files: true,
            children: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

module.exports = FolderService;
