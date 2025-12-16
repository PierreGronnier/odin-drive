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

  static async getUserFilesPaginated(
    userId,
    folderId = null,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: {
          userId,
          folderId: folderId || null,
        },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
        include: {
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.file.count({
        where: {
          userId,
          folderId: folderId || null,
        },
      }),
    ]);

    return {
      files,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  static async getAllUserFilesPaginated(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { userId },
        include: {
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
      }),
      prisma.file.count({
        where: { userId },
      }),
    ]);

    return {
      files,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
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

  static async getAllUserFiles(userId) {
    return await prisma.file.findMany({
      where: { userId },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

module.exports = FileService;
