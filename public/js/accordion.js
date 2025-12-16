document.addEventListener("DOMContentLoaded", function () {
  function saveSectionState(sectionId, isOpen) {
    if (typeof Storage !== "undefined") {
      localStorage.setItem(`section_${sectionId}`, isOpen ? "open" : "closed");
    }
  }

  function getSectionState(sectionId, defaultState = "closed") {
    if (typeof Storage !== "undefined") {
      return localStorage.getItem(`section_${sectionId}`) || defaultState;
    }
    return defaultState;
  }

  // Fonction pour les sections principales (Your Folders, Recent Files, etc.)
  function initCollapsibleSections() {
    document.querySelectorAll(".collapsible-section").forEach((section) => {
      const header = section.querySelector(".section-header");
      const content = section.querySelector(".section-content");
      const toggleBtn = section.querySelector(".section-toggle");
      const sectionId = section.dataset.sectionId;

      if (!header || !content || !sectionId) return;

      const savedState = getSectionState(
        sectionId,
        section.dataset.defaultState || "closed"
      );
      const isInitiallyOpen = savedState === "open";

      if (isInitiallyOpen) {
        content.style.display = "block";
        if (toggleBtn) {
          toggleBtn.classList.add("open");
          toggleBtn.innerHTML = '<i class="icon-sm">▼</i>';
        }
      } else {
        content.style.display = "none";
        if (toggleBtn) {
          toggleBtn.classList.remove("open");
          toggleBtn.innerHTML = '<i class="icon-sm">▶</i>';
        }
      }

      header.addEventListener("click", function (e) {
        if (e.target.closest("button") && !e.target.closest(".section-toggle"))
          return;

        const isOpen = content.style.display === "block";

        if (isOpen) {
          content.style.display = "none";
          if (toggleBtn) {
            toggleBtn.classList.remove("open");
            toggleBtn.innerHTML = '<i class="icon-sm">▶</i>';
          }
          saveSectionState(sectionId, false);
        } else {
          content.style.display = "block";
          if (toggleBtn) {
            toggleBtn.classList.add("open");
            toggleBtn.innerHTML = '<i class="icon-sm">▼</i>';
          }
          saveSectionState(sectionId, true);
        }
      });

      if (toggleBtn) {
        toggleBtn.addEventListener("click", function (e) {
          e.stopPropagation();

          const isOpen = content.style.display === "block";

          if (isOpen) {
            content.style.display = "none";
            toggleBtn.classList.remove("open");
            toggleBtn.innerHTML = '<i class="icon-sm">▶</i>';
            saveSectionState(sectionId, false);
          } else {
            content.style.display = "block";
            toggleBtn.classList.add("open");
            toggleBtn.innerHTML = '<i class="icon-sm">▼</i>';
            saveSectionState(sectionId, true);
          }
        });
      }
    });
  }

  // Fonction pour les sections individuelles (Share this folder, Upload files)
  function initCollapsibleContent() {
    document.querySelectorAll(".collapsible-content").forEach((content) => {
      const contentId = content.dataset.contentId;
      let toggleBtn = null;

      // Trouver le bouton toggle correspondant
      if (contentId) {
        // Chercher le bouton avec l'attribut data-target correspondant
        toggleBtn = document.querySelector(
          `.content-toggle[data-target="${content.id}"]`
        );

        // Si pas trouvé, chercher dans l'élément précédent
        if (!toggleBtn) {
          const header = content.previousElementSibling;
          if (header && header.classList.contains("collapsible-header")) {
            toggleBtn = header.querySelector(".content-toggle");
          }
        }
      }

      if (!toggleBtn || !contentId) return;

      const savedState = getSectionState(contentId, "closed");
      const isInitiallyOpen = savedState === "open";

      if (isInitiallyOpen) {
        content.style.display = "block";
        toggleBtn.classList.add("open");
        toggleBtn.innerHTML = '<i class="icon-sm">▼</i>';
      } else {
        content.style.display = "none";
        toggleBtn.classList.remove("open");
        toggleBtn.innerHTML = '<i class="icon-sm">▶</i>';
      }

      toggleBtn.addEventListener("click", function () {
        const isOpen = content.style.display === "block";

        if (isOpen) {
          content.style.display = "none";
          toggleBtn.classList.remove("open");
          toggleBtn.innerHTML = '<i class="icon-sm">▶</i>';
          saveSectionState(contentId, false);
        } else {
          content.style.display = "block";
          toggleBtn.classList.add("open");
          toggleBtn.innerHTML = '<i class="icon-sm">▼</i>';
          saveSectionState(contentId, true);
        }
      });

      // Ajouter l'événement sur tout le header si c'est un collapsible-header
      const header = content.previousElementSibling;
      if (header && header.classList.contains("collapsible-header")) {
        header.addEventListener("click", function (e) {
          if (
            e.target.closest("button") &&
            !e.target.closest(".content-toggle")
          )
            return;

          const isOpen = content.style.display === "block";

          if (isOpen) {
            content.style.display = "none";
            toggleBtn.classList.remove("open");
            toggleBtn.innerHTML = '<i class="icon-sm">▶</i>';
            saveSectionState(contentId, false);
          } else {
            content.style.display = "block";
            toggleBtn.classList.add("open");
            toggleBtn.innerHTML = '<i class="icon-sm">▼</i>';
            saveSectionState(contentId, true);
          }
        });
      }
    });
  }

  // Initialiser tout
  initCollapsibleSections();
  initCollapsibleContent();

  // Fonction pour sauvegarder l'état lors du rafraîchissement de la page
  window.addEventListener("beforeunload", function () {
    // Sauvegarder l'état actuel de toutes les sections
    document.querySelectorAll(".collapsible-section").forEach((section) => {
      const sectionId = section.dataset.sectionId;
      const content = section.querySelector(".section-content");
      if (sectionId && content) {
        const isOpen = content.style.display === "block";
        saveSectionState(sectionId, isOpen);
      }
    });

    document.querySelectorAll(".collapsible-content").forEach((content) => {
      const contentId = content.dataset.contentId;
      if (contentId) {
        const isOpen = content.style.display === "block";
        saveSectionState(contentId, isOpen);
      }
    });
  });
});
