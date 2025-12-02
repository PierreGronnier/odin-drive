const ERRORS = require("../constants/errors");

function validateId(req, res, next) {
  if (req.params.id) {
    const id = Number(req.params.id);
    
    if (!Number.isInteger(id)) {
      console.error(`[VALIDATION] ID is not an integer: ${req.params.id} → ${id}`);
      req.session.error = ERRORS.GENERAL.INVALID_ID;
      return res.redirect("/dashboard");
    }
    
    if (id <= 0) {
      console.error(`[VALIDATION] ID is zero or negative: ${id}`);
      req.session.error = ERRORS.GENERAL.INVALID_ID;
      return res.redirect("/dashboard");
    }
    
    const MAX_INT4 = 2147483647;
    if (id > MAX_INT4) {
      console.error(`[VALIDATION] ID too large for database: ${id}`);
      req.session.error = ERRORS.GENERAL.INVALID_ID;
      return res.redirect("/dashboard");
    }
    
    req.params.id = id;
  }
  
  if (req.body && req.body.folderId && req.body.folderId !== '') {
    const folderId = Number(req.body.folderId);
    
    if (!Number.isInteger(folderId) || folderId <= 0 || folderId > MAX_INT4) {
      console.error(`[VALIDATION] Invalid folderId: ${req.body.folderId} → ${folderId}`);
      req.session.error = ERRORS.FOLDER.NOT_FOUND;
      return res.redirect('/dashboard');
    }
    
    req.body.folderId = folderId;
  }
  
  next();
}

module.exports = validateId;