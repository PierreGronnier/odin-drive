function viewHelpers(req, res, next) {
  // Helper pour les icônes de fichiers
  res.locals.getFileIcon = (mimetype) => {
    if (mimetype.startsWith("image/")) return "/icon/img.png";
    if (mimetype.startsWith("video/")) return "/icon/video.png";
    if (mimetype.startsWith("audio/")) return "/icon/audio.png";
    if (mimetype === "application/pdf") return "/icon/pdf.png";
    if (mimetype.includes("word") || mimetype.includes("document")) return "/icon/doc.png";
    if (mimetype.includes("excel") || mimetype.includes("spreadsheet"))
      return "/icon/word.png";
    if (mimetype.includes("zip") || mimetype.includes("rar")) return "/icon/zip.png";
    if (mimetype.startsWith("text/")) return "/icon/txt.png";
    return "📁";
  };

  // Helper pour formater la taille
  res.locals.formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  res.locals.isSharedAccess = false;
  next();
}

module.exports = viewHelpers;
