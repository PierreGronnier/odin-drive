const ShareService = require('../services/shareService');

async function shareAuth(req, res, next) {
  const token = req.params.token || req.query.token;
  
  if (token) {
    const shareLink = await ShareService.validateShareToken(token);
    
    if (!shareLink) {
      return res.status(404).render('404', {
        title: 'Share Link Expired',
        message: 'This share link has expired or is invalid.'
      });
    }
    
    req.shareLink = shareLink;
    req.sharedFolder = shareLink.folder;
    req.isSharedAccess = true;
    
    return next();
  }
  
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login');
  }
  
  next();
}

function sharedOrAuth(req, res, next) {
  const token = req.params.token || req.query.token;
  
  if (token) {
    return shareAuth(req, res, next);
  }
  
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login');
  }
  
  next();
}

module.exports = { shareAuth, sharedOrAuth };