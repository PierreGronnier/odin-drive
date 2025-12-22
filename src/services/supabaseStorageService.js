const supabase = require("../config/supabase");
const path = require("path");

class SupabaseStorageService {
  static async uploadFile(
    fileBuffer,
    originalName,
    mimetype,
    userId,
    folderId = null
  ) {
    try {
      const fileExt = path.extname(originalName);
      const baseName = path.parse(originalName).name;
      const uniqueFilename = `${baseName}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}${fileExt}`;

      const bucketPath = folderId
        ? `user_${userId}/folder_${folderId}/${uniqueFilename}`
        : `user_${userId}/root/${uniqueFilename}`;

      const { error } = await supabase.storage
        .from("odin-drive")
        .upload(bucketPath, fileBuffer, {
          contentType: mimetype,
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("odin-drive").getPublicUrl(bucketPath);

      return {
        filename: uniqueFilename,
        originalName: originalName,
        url: publicUrl,
        bucketPath: bucketPath,
        size: fileBuffer.length,
        mimetype: mimetype,
      };
    } catch (error) {
      console.error("[SUPABASE_UPLOAD] Erreur:", error.message);
      throw new Error(`Upload échoué: ${error.message}`);
    }
  }

  static async deleteFile(bucketPath) {
    try {
      const { error } = await supabase.storage
        .from("odin-drive")
        .remove([bucketPath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("[SUPABASE_DELETE] Erreur:", error.message);
      throw new Error(`Suppression échouée: ${error.message}`);
    }
  }
}

module.exports = SupabaseStorageService;
