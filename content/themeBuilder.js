console.log("🎨 Simple Theme Builder Loaded");

function SimpleThemeBuilder() {
  // Prevent multiple panels
  if (window.SimpleThemeOpen) return;
  window.SimpleThemeOpen = true;

  const THEME_STORAGE_KEY = "KiteSimpleTheme";
  const selectors = window.KiteThemeSelectors || []; // Comes from main context
  const saved = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || "{}");
  const modified = {}; // Tracks unsaved modifications

  // ===============================
  // 🧱 Create Floating Theme Panel
  // ===============================
  const panel = document.createElement("div");
  panel.className = "simple-theme-panel";
  panel.style.cssText = `
    position: fixed;
    top: 60px;
    left: calc(50% - 160px);
    background: #fff;
    border: 1px solid #ccc;
    box-shadow: 0 6px 24px rgba(0,0,0,0.15);
    padding: 14px 18px;
    z-index: 99999;
    font-family: sans-serif;
    width: 320px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 8px;
  `;

  // Inner HTML: header, dynamic controls, and footer actions
  panel.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; cursor: move;">
      <strong>🎨 Text Color Editor</strong>
      <button id="closeThemePanel" style="font-size: 16px;">✖</button>
    </div>
    <div id="themeControls" style="margin-top: 12px; display: flex; flex-direction: column; gap: 12px;"></div>
    <div style="margin-top: 14px; text-align: right;">
      <button id="saveTheme" style="margin-right: 8px;">💾 Save</button>
      <button id="resetTheme" style="margin-right: 8px;">♻️ Reset</button>
      <button id="cancelTheme">Cancel</button>
    </div>
  `;
  document.body.appendChild(panel);

  const controlsContainer = panel.querySelector("#themeControls");

  // ===============================
  // 🔤 Load Google Font Options
  // ===============================
  const fontOptions = [
    { name: "Inter" }, { name: "Roboto" }, { name: "Open Sans" },
    { name: "Lato" }, { name: "Montserrat" }, { name: "Poppins" },
    { name: "Schoolbell" }, { name: "Caveat" }, { name: "Domine" }
  ];

  // Load font link if not already present
  if (!document.getElementById("theme-font-link")) {
    const link = document.createElement("link");
    link.id = "theme-font-link";
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${fontOptions.map(f => `family=${f.name.replace(/ /g, "+")}`).join("&")}&display=swap`;
    document.head.appendChild(link);
  }

  // ===============================
  // 🎨 Create Color Inputs for Each Selector
  // ===============================
  selectors.forEach(({ label, selector, property }) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "space-between";
    wrapper.style.alignItems = "center";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    labelEl.style.fontSize = "14px";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = saved.styles?.[selector]?.[property] || "#000000";
    colorInput.dataset.selector = selector;
    colorInput.dataset.property = property;
    colorInput.style.width = "50px";

    // Live preview color changes
    colorInput.addEventListener("input", () => {
      modified[selector] = modified[selector] || {};
      modified[selector][property] = colorInput.value;
      applyStyle(selector, property, colorInput.value);
    });

    wrapper.appendChild(labelEl);
    wrapper.appendChild(colorInput);
    controlsContainer.appendChild(wrapper);
  });

  // ===============================
  // 🔠 Font Controls Section
  // ===============================
  const fontSection = document.createElement("div");
  fontSection.innerHTML = `
    <label style="font-size: 14px;">Font:
      <select id="customFontName" style="width: 100%;">
        <option value="">Default</option>
        ${fontOptions.map(f => `<option value="${f.name}">${f.name}</option>`).join("")}
      </select>
    </label>
    <label style="font-size: 14px;">Size:
      <input type="text" id="customFontSize" placeholder="e.g. 14px" style="width: 100%;">
    </label>
    <label style="font-size: 14px;">Weight:
      <input type="text" id="customFontWeight" placeholder="e.g. 400" style="width: 100%;">
    </label>
  `;
  controlsContainer.appendChild(fontSection);

  const fontNameEl = fontSection.querySelector("#customFontName");
  const fontSizeEl = fontSection.querySelector("#customFontSize");
  const fontWeightEl = fontSection.querySelector("#customFontWeight");

  // Set saved values (if any)
  fontNameEl.value = saved.fonts?.name || "";
  fontSizeEl.value = saved.fonts?.size || "";
  fontWeightEl.value = saved.fonts?.weight || "";

  function normalizeFontSize(value) {
    if (!value) return "";
    return /^\d+$/.test(value) ? `${value}px` : value;
  }

  // 🔄 Apply font styles live
  function applyFontStyle(name, size, weight) {
    const combinedSelectors = selectors.map(s => s.selector).join(", ");
    let styleTag = document.getElementById("theme-font-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "theme-font-style";
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      ${combinedSelectors} {
        ${name ? `font-family: '${name}', sans-serif !important;` : ""}
        ${size ? `font-size: ${normalizeFontSize(size)} !important;` : ""}
        ${weight ? `font-weight: ${weight} !important;` : ""}
      }
    `;
  }

  // Live update preview for fonts
  [fontNameEl, fontSizeEl, fontWeightEl].forEach(el =>
    el.addEventListener("input", () => {
      applyFontStyle(fontNameEl.value, fontSizeEl.value, fontWeightEl.value);
    })
  );

  // ===============================
  // 💾 Save & Apply Theme
  // ===============================
  panel.querySelector("#saveTheme").addEventListener("click", () => {
    const theme = {
      fonts: {
        name: fontNameEl.value.trim(),
        size: normalizeFontSize(fontSizeEl.value.trim()),
        weight: fontWeightEl.value.trim()
      },
      styles: {}
    };

    // Merge style edits
    for (const [selector, props] of Object.entries(modified)) {
      theme.styles[selector] = props;
    }

    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
    applyFontStyle(theme.fonts.name, theme.fonts.size, theme.fonts.weight);
    closePanel();
  });

  // ===============================
  // ♻️ Reset to Default Theme
  // ===============================
  panel.querySelector("#resetTheme").addEventListener("click", () => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.querySelectorAll("style[id^='style-'], #theme-font-style").forEach(e => e.remove());
    closePanel();
  });

  // ===============================
  // ❌ Cancel / Close Actions
  // ===============================
  panel.querySelector("#cancelTheme").addEventListener("click", closePanel);
  panel.querySelector("#closeThemePanel").addEventListener("click", closePanel);

  function closePanel() {
    panel.remove();
    window.SimpleThemeOpen = false;
  }

  // ===============================
  // 🧪 Utility: Inline CSS Injection
  // ===============================
  function applyStyle(selector, property, value) {
    const id = `style-${btoa(selector + property).replace(/[^a-zA-Z0-9]/g, "")}`;
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `${selector} { ${property}: ${value} !important; }`;
  }

  // ===============================
  // 🖱️ Draggable Panel
  // ===============================
  let isDragging = false, offsetX, offsetY;
  const header = panel.querySelector("div");
  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = panel.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      panel.style.left = `${e.clientX - offsetX}px`;
      panel.style.top = `${e.clientY - offsetY}px`;
    }
  });
  document.addEventListener("mouseup", () => { isDragging = false; });

  // Reapply saved font settings on builder launch
  if (saved.fonts?.name || saved.fonts?.size || saved.fonts?.weight) {
    applyFontStyle(saved.fonts.name, saved.fonts.size, saved.fonts.weight);
  }
}

// Make globally accessible for lazy-loaded execution
window.SimpleThemeBuilder = SimpleThemeBuilder;
