// Amazon Rufus Blocker v4 - Content Script
// Strategy: slide the Rufus panel off-screen, toggle it back for the cart

(function () {
  "use strict";

  let rufusPanel = null;
  let backdrop = null;
  let initialized = false;

  // Find the Rufus panel (the direct container, not body)
  function findRufusPanel() {
    if (rufusPanel) return rufusPanel;

    // Look for elements with rufus-docked classes that are NOT body
    const candidates = document.querySelectorAll(
      '[class*="rufus-docked-adjustable"], [class*="rufus-docked-left"]:not(body)'
    );
    for (const el of candidates) {
      if (el !== document.body && el !== document.documentElement) {
        rufusPanel = el;
        return el;
      }
    }
    return null;
  }

  // Clean body: remove rufus classes and fix padding
  function cleanBody() {
    const body = document.body;
    if (!body) return;

    // Zero out Rufus CSS vars
    ["--rufus-docked-panel-width",
     "--total-rufus-panel-full-width",
     "--total-rufus-panel-half-width",
     "--rufus-animation-min-height"
    ].forEach((v) => {
      if (body.style.getPropertyValue(v)) {
        body.style.setProperty(v, "0px");
      }
    });

    // Fix padding
    const pl = parseInt(body.style.getPropertyValue("padding-left"), 10);
    if (pl >= 300) {
      body.style.setProperty("padding-left", "12px");
    }
  }

  // Create the backdrop overlay for closing the cart
  function ensureBackdrop() {
    if (backdrop) return backdrop;
    backdrop = document.createElement("div");
    backdrop.id = "rb-backdrop";
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", closeCart);
    return backdrop;
  }

  // Open the cart panel
  function openCart() {
    const panel = findRufusPanel();
    if (!panel) return;
    panel.classList.add("rb-cart-open");
    ensureBackdrop().classList.add("rb-visible");
  }

  // Close the cart panel
  function closeCart() {
    const panel = findRufusPanel();
    if (panel) panel.classList.remove("rb-cart-open");
    if (backdrop) backdrop.classList.remove("rb-visible");
  }

  // Toggle cart
  function toggleCart(e) {
    const panel = findRufusPanel();
    if (!panel) return;

    if (panel.classList.contains("rb-cart-open")) {
      closeCart();
    } else {
      openCart();
    }
  }

  // Attach click handler to the nav cart button
  function hookCartButton() {
    // Amazon's cart link in the navbar
    const cartLink = document.getElementById("nav-cart")
      || document.querySelector("#nav-cart-count")?.closest("a")
      || document.querySelector('[data-csa-c-slot-id="nav-cart"]')
      || document.querySelector("#nav-cart-container a");

    if (!cartLink) return false;

    // Don't hook if already on the cart page
    if (window.location.pathname.includes("/cart") ||
        window.location.pathname.includes("/gp/cart")) {
      return true; // No hook needed on cart page itself
    }

    cartLink.addEventListener("click", (e) => {
      // If middle-click or ctrl/cmd-click, let it navigate normally
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      e.stopPropagation();
      toggleCart(e);
    }, true);

    return true;
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  // Main init
  function init() {
    if (initialized) return;
    cleanBody();
    findRufusPanel();
    ensureBackdrop();
    if (hookCartButton()) {
      initialized = true;
    }
  }

  // Run when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", () => {
    init();
    setTimeout(init, 500);
    setTimeout(init, 1500);
    setTimeout(init, 3000);
  });

  // MutationObserver: watch for Amazon re-applying styles and late DOM injection
  const observer = new MutationObserver((mutations) => {
    let needsClean = false;

    for (const mutation of mutations) {
      // Body style/class changed
      if (mutation.target === document.body) {
        if (mutation.attributeName === "style") {
          const pl = parseInt(
            document.body.style.getPropertyValue("padding-left"), 10
          );
          if (pl >= 300) needsClean = true;
        }
        if (mutation.attributeName === "class") {
          const bc = document.body.className || "";
          if (bc.includes("rufus")) needsClean = true;
        }
      }

      // New nodes: try to init if not done yet
      if (mutation.type === "childList" && !initialized) {
        init();
      }
    }

    if (needsClean) cleanBody();
  });

  function startObserver() {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style"],
      });
    } else {
      requestAnimationFrame(startObserver);
    }
  }

  startObserver();
})();
