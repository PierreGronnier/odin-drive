module.exports = {
  // Fichiers
  FILE: {
    NOT_FOUND: "File not found or you don't have permission",
    TOO_LARGE: "File too large. Maximum size is 10MB.",
    INVALID_TYPE: "File type not allowed",
    UPLOAD_FAILED: "Failed to upload file",
    DELETE_FAILED: "Failed to delete file",
    DOWNLOAD_FAILED: "Failed to download file",
  },

  // Dossiers
  FOLDER: {
    NOT_FOUND: "Folder not found or you don't have permission",
    NAME_REQUIRED: "Folder name is required",
    DELETE_FAILED: "Failed to delete folder",
    UPDATE_FAILED: "Failed to update folder",
    CREATE_FAILED: "Failed to create folder",
  },

  // Authentification
  AUTH: {
    UNAUTHORIZED: "You must be logged in to access this resource",
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_EXISTS: "An account with this email already exists",
  },

  // Général
  GENERAL: {
    INTERNAL_ERROR: "An unexpected error occurred. Please try again later.",
    VALIDATION_ERROR: "Validation error",
    INVALID_ID: "Invalid resource identifier",
  },
};
