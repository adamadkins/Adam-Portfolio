(() => {
  "use strict";

  // Anything already on screen stays put, so only what's below the fold is hidden and fades in as you
  // scroll to it. (Without this, the first screen showed, then vanished, then faded back in.)
  document.querySelectorAll(".reveal").forEach((node) => {
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) node.classList.add("visible");
  });
  document.documentElement.classList.add("js");

  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-navigation");
  const menuScrim = document.getElementById("menu-scrim");
  const mobileMenuMedia = window.matchMedia("(max-width: 700px)");
  const dialog = document.getElementById("case-dialog");
  const closeButton = document.getElementById("dialog-close");

  const caseStudies = {
    chasing606: {
      label: "E-COMMERCE / DESIGN & DEVELOPMENT",
      title: "Chasing606",
      summary: "An outdoor-inspired brand brought together through a modern storefront experience.",
      mobileDescription: "A custom storefront with brand storytelling, responsive product galleries, intuitive filters, and integrated shopping.",
      description: "A brand-focused web experience designed to connect storytelling, product discovery, and shopping. The work includes responsive product galleries, intuitive filtering, custom interactions, and e-commerce integration. The goal: make exploring the catalog feel as considered as the brand itself.",
      tags: ["Web design", "Front-end development", "E-commerce", "Responsive UI"],
      repo: "https://chasing606.adkins-adam04.workers.dev/"
    },
    ppm: {
      label: "LOCAL BUSINESS / WEBSITE REDESIGN",
      title: "Porter Property Maintenance",
      summary: "Making an established service business easier to understand, explore, and contact.",
      mobileDescription: "A responsive redesign with clearer pressure-washing and property-care services, easier navigation, and more direct contact options.",
      description: "A redesign with cleaner navigation, more focused service messaging, a responsive layout, and clear calls to action. Built to make the company's property care and pressure-washing services easier to discover across desktop and mobile.",
      tags: ["Website redesign", "Local business", "Responsive UI", "UX"],
      repo: "https://porterpm.com/"
    }
  };

  // Keep each noninteractive website preview fitted to its visible frame.
  // Fixed CSS scales caused previews to crop or look disproportionately small
  // at different browser widths.
  const previewViewports = document.querySelectorAll(".site-preview-viewport");
  if (previewViewports.length) {
    const sourceWidth = 1200;
    const fitPreviews = () => {
      previewViewports.forEach((viewport) => {
        const available = viewport.clientWidth;
        if (available > 0) {
          viewport.style.setProperty(
            "--preview-scale",
            String(Math.min(1, available / sourceWidth)),
          );
        }
      });
    };
    fitPreviews();
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(fitPreviews);
      previewViewports.forEach((viewport) => observer.observe(viewport));
    } else {
      window.addEventListener("resize", fitPreviews, { passive: true });
    }
  }

  const updateHeader = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  function setMenuOpen(nextOpen, { restoreFocus = false } = {}) {
    if (!menuToggle || !nav) return;
    const wasOpen = nav.classList.contains("open");
    const isOpen = Boolean(nextOpen && mobileMenuMedia.matches);
    nav.classList.toggle("open", isOpen);
    // Keep the closed menu out of keyboard navigation while its closing animation plays.
    nav.inert = mobileMenuMedia.matches && !isOpen;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", isOpen);
    header?.classList.toggle("menu-active", isOpen);
    menuScrim?.classList.toggle("active", isOpen);
    if (restoreFocus && wasOpen) menuToggle.focus();
  }

  function closeMenu(options = {}) {
    setMenuOpen(false, options);
  }

  if (menuToggle && nav) {
    nav.inert = mobileMenuMedia.matches;
    menuToggle.addEventListener("click", () => {
      setMenuOpen(!nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });
    menuScrim?.addEventListener("click", () => closeMenu());
    document.addEventListener("pointerdown", (event) => {
      if (nav.classList.contains("open") && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });
    window.addEventListener("resize", () => {
      if (!mobileMenuMedia.matches) closeMenu();
      nav.inert = mobileMenuMedia.matches && !nav.classList.contains("open");
    });
  }

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -35px 0px", threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
  } else {
    document.querySelectorAll(".reveal").forEach((node) => node.classList.add("visible"));
  }

  // Animate project details in both directions without removing the native
  // dialog's focus trapping, Escape handling or backdrop behavior.
  const reducedDialogMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let closeDialogTimer = null;

  function closeDialog() {
    if (!dialog?.open || dialog.classList.contains("is-closing")) return;
    if (reducedDialogMotion.matches) {
      dialog.close();
      return;
    }
    dialog.classList.add("is-closing");
    closeDialogTimer = window.setTimeout(() => {
      closeDialogTimer = null;
      if (dialog.open) dialog.close();
    }, 200);
  }

  function openCase(id) {
    if (!dialog || typeof dialog.showModal !== "function") return;
    const study = caseStudies[id];
    if (!study) return;
    if (closeDialogTimer !== null) {
      window.clearTimeout(closeDialogTimer);
      closeDialogTimer = null;
    }
    dialog.classList.remove("is-closing");

    document.getElementById("case-label").textContent = study.label;
    const heading = document.getElementById("case-title");
    heading.textContent = study.title;
    document.getElementById("case-summary").textContent = study.summary;
    document.getElementById("case-description").textContent =
      mobileMenuMedia.matches ? study.mobileDescription : study.description;
    const chips = document.getElementById("case-chips");
    chips.replaceChildren();
    study.tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.textContent = tag;
      chips.append(chip);
    });
    const repo = document.getElementById("case-repo");
    repo.href = study.repo;
    repo.textContent = "";
    repo.append(document.createTextNode("Visit live website "));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    repo.append(arrow);
    closeMenu();
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add("dialog-open");
    // Focus the title without displaying a ring around the close button.
    heading.focus({ preventScroll: true });
  }

  document.querySelectorAll("[data-case]").forEach((trigger) => {
    trigger.addEventListener("click", () => openCase(trigger.dataset.case));
  });

  if (dialog) {
    closeButton?.addEventListener("click", closeDialog);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener("close", () => {
      dialog.classList.remove("is-closing");
      if (closeDialogTimer !== null) {
        window.clearTimeout(closeDialogTimer);
        closeDialogTimer = null;
      }
      document.body.classList.remove("dialog-open");
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("open")) {
      closeMenu({ restoreFocus: true });
    }
  });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
