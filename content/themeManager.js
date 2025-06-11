console.log("🎨 themeManager.js loaded");

// ===============================================
// 🖌️ Apply Theme Preferences on Page Load
// ===============================================
(function applyUserThemeOnLoad() {
  const STORAGE_KEY = "KiteSimpleTheme";

  // Load saved theme settings from localStorage
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (!saved || (!saved.styles && !saved.fonts)) return;

  // Utility: Ensure font size has units (e.g., "14px")
  function normalizeFontSize(value) {
    if (!value) return "";
    return /^\d+$/.test(value) ? `${value}px` : value;
  }

  // Apply saved font styles to a list of selectors
  function applyFontStyles(selectors) {
    const css = `
      ${selectors.map(s => s.selector).join(", ")} {
        ${saved.fonts.name ? `font-family: '${saved.fonts.name}', sans-serif !important;` : ""}
        ${saved.fonts.size ? `font-size: ${normalizeFontSize(saved.fonts.size)} !important;` : ""}
        ${saved.fonts.weight ? `font-weight: ${saved.fonts.weight} !important;` : ""}
      }
    `;

    // Inject or update <style> tag for fonts
    let fontStyle = document.getElementById("theme-font-style");
    if (!fontStyle) {
      fontStyle = document.createElement("style");
      fontStyle.id = "theme-font-style";
      document.head.appendChild(fontStyle);
    }
    fontStyle.textContent = css;

    // Load Google Fonts if needed
    if (saved.fonts.name && !document.getElementById("theme-font-link")) {
      const link = document.createElement("link");
      link.id = "theme-font-link";
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${saved.fonts.name.replace(/ /g, "+")}&display=swap`;
      document.head.appendChild(link);
    }
  }

  // Apply custom color styles per selector/property
  function applyColorStyles() {
    Object.entries(saved.styles || {}).forEach(([selector, props]) => {
      Object.entries(props).forEach(([property, value]) => {
        // Unique ID per style to avoid duplication
        const id = `style-${btoa(selector + property).replace(/[^a-zA-Z0-9]/g, "")}`;

        // Create or update style element
        let style = document.getElementById(id);
        if (!style) {
          style = document.createElement("style");
          style.id = id;
          document.head.appendChild(style);
        }
        style.textContent = `${selector} { ${property}: ${value} !important; }`;
      });
    });
  }

  // Poll until theme selectors are defined globally
  const interval = setInterval(() => {
    if (window.KiteThemeSelectors && Array.isArray(window.KiteThemeSelectors)) {
      applyColorStyles();
      applyFontStyles(window.KiteThemeSelectors);
      clearInterval(interval); // Stop polling once applied
    }
  }, 50);
})();

// ===============================================
// 🎛️ UI: Inject Theme Toggle Button
// ===============================================
VK.waitUntilExists(".app-nav a[href='/dashboard']", function () {
  if (!$(".kite-theme-toggle").length) {
    // Insert toggle button just before dashboard link
    $("<a href='#' class='kite-theme-toggle'><span>🎨 Font </span></a>").insertBefore($(this));
  }
});

// ===============================================
// 🧠 Lazy-load Theme Builder (if needed)
// ===============================================
$(document).on("click", ".kite-theme-toggle", function (e) {
  e.preventDefault();

  // If builder already loaded, call it directly
  if (typeof window.SimpleThemeBuilder === "function") {
    window.SimpleThemeBuilder();
  } else {
    // Else, dynamically inject the builder script
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("content/themeBuilder.js");
    script.onload = () => window.SimpleThemeBuilder && window.SimpleThemeBuilder();
    document.head.appendChild(script);
  }
});

window.themeManager = { loaded: true };