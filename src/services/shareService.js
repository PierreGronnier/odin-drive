const prisma = require('../prismaClient');

class ShareService {
  static async createShareLink(userId, folderId, durationDays) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    
    return await prisma.shareLink.create({
      data: {
        folderId,
        userId,
        expiresAt,
      },
      include: {
        folder: {
          include: {
            files: true,
            children: {
              include: {
                files: true,
                children: {
                  include: {
                    files: true,
                    children: true
                  }
                },
                _count: {
                  select: { files: true, children: true }
                }
              }
            }
          }
        }
      }
    });
  }
  
  static async validateShareToken(token) {
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        folder: {
          include: {
            files: true,
            children: {
              include: {
                files: true,
                children: {
                  include: {
                    files: true,
                    children: true
                  }
                },
                _count: {
                  select: { files: true, children: true }
                }
              }
            },
            user: {
              select: { email: true }
            },
            _count: {
              select: { files: true, children: true }
            }
          }
        }
      }
    });
    
    if (!shareLink) return null;
    if (new Date() > shareLink.expiresAt) {
      await this.deleteShareLink(shareLink.id);
      return null;
    }
    
    return shareLink;
  }
  
  static async deleteShareLink(shareId) {
    return await prisma.shareLink.delete({
      where: { id: shareId }
    });
  }
  
  static async getUserShareLinks(userId) {
    return await prisma.shareLink.findMany({
      where: { userId },
      include: {
        folder: {
          select: { 
            name: true,
            _count: {
              select: { files: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  static async getSharedFile(fileId, shareToken) {
    const shareLink = await this.validateShareToken(shareToken);
    if (!shareLink) return null;
    
    const file = await prisma.file.findFirst({
      where: {
        id: parseInt(fileId),
        OR: [
          { folderId: shareLink.folderId },
          { folder: { parentId: shareLink.folderId } },
          { folder: { parent: { parentId: shareLink.folderId } } }
        ]
      },
      include: {
        folder: true
      }
    });
    
    return file;
  }
}

module.exports = ShareService;