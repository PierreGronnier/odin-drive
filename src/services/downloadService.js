const fetch = require("node-fetch");

class DownloadService {
  static async streamFile(file, res) {
    try {
      const response = await fetch(file.url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file: ${response.status} ${response.statusText}`
        );
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(file.originalName)}"`
      );
      res.setHeader(
        "Content-Type",
        file.mimetype || "application/octet-stream"
      );
      res.setHeader(
        "Content-Length",
        response.headers.get("content-length") || file.size
      );
      res.setHeader("Cache-Control", "no-cache");

      response.body.pipe(res);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DownloadService;
