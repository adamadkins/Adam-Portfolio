(() => {
  "use strict";

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
      description: "A brand-focused web experience designed to connect storytelling, product discovery, and shopping. The work includes responsive product galleries, intuitive filtering, custom interactions, and e-commerce integration. The goal: make exploring the catalog feel as considered as the brand itself.",
      tags: ["Web design", "Front-end development", "E-commerce", "Responsive UI"],
      repo: "https://chasing606.adkins-adam04.workers.dev/"
    },
    ppm: {
      label: "LOCAL BUSINESS / WEBSITE REDESIGN",
      title: "Porter Property Maintenance",
      summary: "Making an established service business easier to understand, explore, and contact.",
      description: "A redesign with cleaner navigation, more focused service messaging, a responsive layout, and clear calls to action. Built to make the company's property care and pressure-washing services easier to discover across desktop and mobile.",
      tags: ["Website redesign", "Local business", "Responsive UI", "UX"],
      repo: "https://porterpm.com/"
    }
  };

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

  function closeDialog() {
    if (dialog && dialog.open) dialog.close();
  }

  function openCase(id) {
    if (!dialog || typeof dialog.showModal !== "function") return;
    const study = caseStudies[id];
    if (!study) return;

    document.getElementById("case-label").textContent = study.label;
    document.getElementById("case-title").textContent = study.title;
    document.getElementById("case-summary").textContent = study.summary;
    document.getElementById("case-description").textContent = study.description;
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
    repo.append(document.createTextNode( "Visit live website " ));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    repo.append(arrow);
    closeMenu();
    dialog.showModal();
    document.body.classList.add("dialog-open");
    closeButton?.focus();
  }

  document.querySelectorAll("[data-case]").forEach((trigger) => {
    trigger.addEventListener("click", () => openCase(trigger.dataset.case));
  });

  if (dialog) {
    closeButton?.addEventListener("click", closeDialog);
    dialog.addEventListener("close", () => {
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
