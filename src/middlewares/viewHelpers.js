function viewHelpers(req, res, next) {
  // Helper pour les icônes de fichiers
  res.locals.getFileIcon = (mimetype) => {
    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype.startsWith("video/")) return "🎬";
    if (mimetype.startsWith("audio/")) return "🎵";
    if (mimetype === "application/pdf") return "📄";
    if (mimetype.includes("word") || mimetype.includes("document")) return "📝";
    if (mimetype.includes("excel") || mimetype.includes("spreadsheet"))
      return "📊";
    if (mimetype.includes("zip") || mimetype.includes("rar")) return "📦";
    if (mimetype.startsWith("text/")) return "📃";
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

  next();
}

module.exports = viewHelpers;
