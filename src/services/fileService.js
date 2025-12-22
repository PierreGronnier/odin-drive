const prisma = require("../prismaClient");
const SupabaseStorageService = require("./supabaseStorageService");

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

  static async createFile(fileData, fileBuffer, userId, folderId = null) {
    try {
      const supabaseFile = await SupabaseStorageService.uploadFile(
        fileBuffer,
        fileData.originalName,
        fileData.mimetype,
        userId,
        folderId
      );

      return await prisma.file.create({
        data: {
          filename: supabaseFile.filename,
          originalName: supabaseFile.originalName,
          url: supabaseFile.url,
          bucketPath: supabaseFile.bucketPath,
          size: supabaseFile.size,
          mimetype: supabaseFile.mimetype,
          userId: userId,
          folderId: folderId,
        },
      });
    } catch (error) {
      console.error("[FILE_SERVICE] Upload error:", error);
      throw error;
    }
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

    if (file.bucketPath) {
      await SupabaseStorageService.deleteFile(file.bucketPath);
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
    // Cette fonction n'est plus nécessaire car on ne stocke plus de fichiers locaux
    console.warn("cleanupFile called but local files are disabled.");
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

  static async getFileDownloadUrl(file) {
    return file.url;
  }
}

module.exports = FileService;
