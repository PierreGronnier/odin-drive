const ShareService = require('../services/shareService');
const ERRORS = require('../constants/errors');

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
      
      const shareUrl = `${req.protocol}://${req.get('host')}/share/${shareLink.token}`;
      
      req.session.success = `Share link created! Valid for ${durationDays} days.`;
      req.session.shareUrl = shareUrl;
      
      res.redirect(`/folder/${folderId}`);
    } catch (error) {
      console.error('[SHARE] Error:', error);
      req.session.error = 'Failed to create share link';
      res.redirect('back');
    }
  }
  
  static async viewSharedFolder(req, res) {
    try {
      const { token } = req.params;
      
      res.render('shared-folder', {
        title: `Shared: ${req.sharedFolder.name}`,
        folder: req.sharedFolder,
        shareToken: token,
        shareLink: req.shareLink, // ← AJOUTÉ ICI
        isSharedAccess: true,
        baseUrl: `${req.protocol}://${req.get('host')}`
      });
    } catch (error) {
      console.error('[SHARE_VIEW] Error:', error);
      res.status(500).render('404', {
        title: 'Error',
        message: 'Could not load shared folder'
      });
    }
  }
  
  static async downloadSharedFile(req, res) {
    try {
      const { token, fileId } = req.params;
      
      const file = await ShareService.getSharedFile(fileId, token);
      
      if (!file || !require('fs').existsSync(file.path)) {
        return res.status(404).render('404', {
          title: 'File Not Found',
          message: 'The requested file is not available.'
        });
      }
      
      res.download(file.path, file.originalName);
    } catch (error) {
      console.error('[SHARE_DOWNLOAD] Error:', error);
      res.status(500).send('Download failed');
    }
  }
  
  static async listUserShares(req, res) {
    try {
      const shares = await ShareService.getUserShareLinks(req.user.id);
      
      res.render('my-shares', {
        title: 'My Share Links',
        user: req.user,
        shares,
        baseUrl: `${req.protocol}://${req.get('host')}`
      });
    } catch (error) {
      console.error('[SHARE_LIST] Error:', error);
      req.session.error = 'Failed to load share links';
      res.redirect('/dashboard');
    }
  }
  
  static async revokeShareLink(req, res) {
    try {
      const { shareId } = req.params;
      
      await prisma.shareLink.delete({
        where: { id: shareId, userId: req.user.id }
      });
      
      req.session.success = 'Share link revoked';
      res.redirect('/shares');
    } catch (error) {
      console.error('[SHARE_REVOKE] Error:', error);
      req.session.error = 'Failed to revoke share link';
      res.redirect('back');
    }
  }
}

module.exports = ShareController;