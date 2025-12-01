// MODAL FUNCTIONS
function openCreateFolderModal(parentId = null) {
  const modal = document.getElementById("createFolderModal");
  const title = document.getElementById("createModalTitle");
  const button = document.getElementById("createModalButton");
  const parentInput = document.getElementById("modalParentId");

  parentInput.value = parentId || "";

  if (parentId) {
    title.textContent = "Create Subfolder";
    button.textContent = "Create Subfolder";
  } else {
    title.textContent = "Create New Folder";
    button.textContent = "Create Folder";
  }

  modal.style.display = "block";
}

function closeCreateFolderModal() {
  document.getElementById("createFolderModal").style.display = "none";
}

function openEditFolderModal(folderId, folderName) {
  document.getElementById("editFolderName").value = folderName;
  document.getElementById(
    "editFolderForm"
  ).action = `/folders/${folderId}?_method=PUT`;
  document.getElementById("editFolderModal").style.display = "block";
}

function closeEditFolderModal() {
  document.getElementById("editFolderModal").style.display = "none";
}

function openDeleteFolderModal(folderId, folderName) {
  document.getElementById("deleteFolderName").textContent = folderName;
  document.getElementById(
    "deleteFolderForm"
  ).action = `/folders/${folderId}?_method=DELETE`;
  document.getElementById("deleteFolderModal").style.display = "block";
}

function closeDeleteFolderModal() {
  document.getElementById("deleteFolderModal").style.display = "none";
}

// FOLDER NAVIGATION
function openFolder(folderId) {
  window.location.href = `/folder/${folderId}`;
}

// FILE UPLOAD FUNCTIONS
function handleFileSelect(input) {
  const uploadPlaceholder = document.getElementById("folderUploadPlaceholder");
  const filePreview = document.getElementById("folderFilePreview");
  const fileName = document.getElementById("folderFileName");
  const fileSize = document.getElementById("folderFileSize");
  const fileMessage = document.getElementById("folderFileMessage");

  const maxSizeMB = 100;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (input.files.length > 0) {
    const file = input.files[0];
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

    uploadPlaceholder.style.display = "none";
    filePreview.style.display = "block";
    fileName.textContent = file.name;
    fileSize.textContent = `${fileSizeMB}MB`;

    if (file.size > maxSizeBytes) {
      fileMessage.innerHTML = `<div class="message error">
        <i class="message-icon">✗</i>
        File too large: ${fileSizeMB}MB > ${maxSizeMB}MB max
      </div>`;
    } else {
      fileMessage.innerHTML = `<div class="message success">
        <i class="message-icon">✓</i>
        Ready to upload: ${fileSizeMB}MB / ${maxSizeMB}MB
      </div>`;
    }
  } else {
    removeSelectedFile();
  }
}

function removeSelectedFile() {
  const fileInput = document.getElementById("folderFileInput");
  const uploadPlaceholder = document.getElementById("folderUploadPlaceholder");
  const filePreview = document.getElementById("folderFilePreview");
  const fileMessage = document.getElementById("folderFileMessage");

  fileInput.value = "";
  uploadPlaceholder.style.display = "block";
  filePreview.style.display = "none";
  fileMessage.innerHTML = "";
  if (event) event.stopPropagation();
}

function validateFileSize(form) {
  const fileInput = form.querySelector('input[type="file"]');
  const maxSize = 100 * 1024 * 1024;

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

    if (file.size > maxSize) {
      alert(
        `❌ File too large!\n\nYour file: ${fileSizeMB}MB\nMaximum allowed: 100MB`
      );
      return false;
    }
  }
  return true;
}

// DRAG & DROP pour FOLDER UPLOAD
document.addEventListener("DOMContentLoaded", function () {
  const folderFileInput = document.getElementById("folderFileInput");
  if (folderFileInput) {
    const fileInputLabel = folderFileInput.nextElementSibling;

    if (fileInputLabel) {
      fileInputLabel.addEventListener("dragover", (e) => {
        e.preventDefault();
        fileInputLabel.classList.add("dragover");
      });

      fileInputLabel.addEventListener("dragleave", () => {
        fileInputLabel.classList.remove("dragover");
      });

      fileInputLabel.addEventListener("drop", (e) => {
        e.preventDefault();
        fileInputLabel.classList.remove("dragover");
        folderFileInput.files = e.dataTransfer.files;
        handleFileSelect(folderFileInput);
      });
    }
  }
});

// MODAL CLOSE ON CLICK OUTSIDE
window.onclick = function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};

// INITIALIZATION
document.addEventListener("DOMContentLoaded", function () {
  const folderFileInput = document.getElementById("folderFileInput");
  if (folderFileInput) {
    setupDragAndDrop("folderFileInput");
  }
});
