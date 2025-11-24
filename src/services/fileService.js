const prisma = require("../prismaClient");
const fs = require("fs");

class FileService {
  static async getUserFiles(userId) {
    return await prisma.file.findMany({
      where: { userId },
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

  static cleanupFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = FileService;
