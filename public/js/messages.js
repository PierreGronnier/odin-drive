document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    document.querySelectorAll(".message").forEach((message) => {
      message.style.opacity = "0";
      setTimeout(() => message.remove(), 300);
    });
  }, 5000);
});
