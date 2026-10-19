(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-navigation");
  const dialog = document.getElementById("case-dialog");
  const closeButton = document.getElementById("dialog-close");

  const caseStudies = {
    chasing606: {
      label: "E-COMMERCE / DESIGN & DEVELOPMENT",
      title: "Chasing606",
      summary: "An outdoor-inspired brand brought together through a modern storefront experience.",
      description: "A brand-focused web experience designed to connect storytelling, product discovery, and shopping. The work includes responsive product galleries, intuitive filtering, custom interactions, and e-commerce integration. The goal: make exploring the catalog feel as considered as the brand itself.",
      tags: ["Web design", "Front-end development", "E-commerce", "Responsive UI"],
      repo: "https://github.com/adamadkins/Chasing606"
    },
    ppm: {
      label: "LOCAL BUSINESS / WEBSITE REDESIGN",
      title: "Porter Property Maintenance",
      summary: "Making an established service business easier to understand, explore, and contact.",
      description: "A redesign with cleaner navigation, more focused service messaging, a responsive layout, and clear calls to action. Built to make the company's property care and pressure-washing services easier to discover across desktop and mobile.",
      tags: ["Website redesign", "Local business", "Responsive UI", "UX"],
      repo: "https://github.com/adamadkins/PPM-LLC"
    },
    prichard: {
      label: "UNCOMMISSIONED DESIGN CONCEPT",
      title: "Prichard Lawn Care",
      summary: "An independent exploration of how a lawn care website could be clearer and more inviting.",
      description: "A self-directed redesign concept exploring concise service information, thoughtful hierarchy, and a refreshed visual presentation. This is speculative portfolio work, not an official commission or an endorsement by the business.",
      tags: ["Design concept", "Service business", "UI exploration"],
      repo: "https://github.com/adamadkins/Adam-Portfolio"
    }
  };

  const updateHeader = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  function closeMenu({ restoreFocus = false } = {}) {
    if (!menuToggle || !nav) return;
    const wasOpen = nav.classList.contains("open");
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
    if (restoreFocus && wasOpen) menuToggle.focus();
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const nextOpen = !nav.classList.contains("open");
      nav.classList.toggle("open", nextOpen);
      menuToggle.setAttribute("aria-expanded", String(nextOpen));
      menuToggle.setAttribute("aria-label", nextOpen ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", nextOpen);
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });
    document.addEventListener("pointerdown", (event) => {
      if (nav.classList.contains("open") && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) closeMenu();
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
    repo.append(document.createTextNode(id === "prichard" ? "Explore my work " : "View repository "));
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
