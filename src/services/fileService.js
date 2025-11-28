const prisma = require("../prismaClient");
const fs = require("fs");

class FileService {
  static async getUserFiles(userId, folderId = null) {
    return await prisma.file.findMany({
      where: {
        userId,
        folderId: folderId || null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createFile(fileData) {
    return await prisma.file.create({
      data: fileData,
    });
  }

  static async getFileById(id, userId) {
    return await prisma.file.findFirst({
      where: { id: parseInt(id), userId },
    });
  }

  static async deleteFile(id, userId) {
    const file = await this.getFileById(id, userId);
    if (!file) {
      throw new Error("File not found");
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return await prisma.file.delete({
      where: { id: file.id },
    });
  }

  static async moveFile(fileId, userId, folderId) {
    const file = await this.getFileById(fileId, userId);
    if (!file) {
      throw new Error("File not found");
    }

    return await prisma.file.update({
      where: { id: file.id },
      data: { folderId: folderId ? parseInt(folderId) : null },
    });
  }

  static cleanupFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = FileService;
