// ==================================================
// 🚀 Main.js — All-In-One Kite Enhancer
// ==================================================

"use strict";
console.log("🚀 main.js loaded");

// Helper: Returns true if running as unpacked (no update_url = dev mode)
function isDevMode() {
  return !('update_url' in chrome.runtime.getManifest());
}

// ==========================================
// ✅ All Main UI Enhancements
// ==========================================

/* 
   - ThemeManager
   - Font/Zoom Controls
   - USD Conversion Toggle
   - Recovery Column & Tips
   - 52W High Column
   - Amount input helpers
   - Hide Squared-Off rows
   - Hide Chart Footer
   - Full Width Container
   - Holdings column toggler
   - QuickWatch toggle
   - GTT Nav shortcut
   - Tooltip USD Conversion
   - Quote Banner below Recovery Tip
*/

// ====================================================================================== USD toggle button style

VK.addStyle(`
    .ext-usd-toggle {
        display: inline-block;
        padding: 0 8px;
        height: 10px;
        line-height: 48px;
        color: #fff;
        background:rgba(255, 255, 255, 0);
        border-radius: 4px;
        font-size: 13px;
        text-align: center;
    }
    .ext-usd-toggle:hover {
        background:rgba(255, 255, 255, 0);
    }
    .app-nav .ext-usd-toggle {
        margin-right: 8px;
    }
`);

// ====================================================================================== Style enhancements for recovery and 52W columns

VK.addStyle(`
    td[data-label='Net chg.'],
    td[data-label='Day chg.'],
    td.ext-recovery-cell {
        font-size: 13px 
        font-weight: 500;
    }

    th:contains('Net chg.'),
    th:contains('Day chg.'),
    th.ext-recovery-header {
        font-size: 13px 
        font-weight: 500;
    }
`);

// ====================================================================================== 52-week High

VK.addStyle(`
  .ext-52w-header,
  .ext-52w-cell {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
`);



// ====================================================================================== Hide the Kite logo in the header

VK.addStyle(`
    .app .header .logo {
        display: none;
    }
`);


// ====================================================================================== Copy Symbol
$(document).on('click', '.vddl-list .instrument .symbol .nice-name', function (event) {
    if (event.altKey || !event.ctrlKey || !event.shiftKey) {
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();

    prompt("Copy it if you like!", $(event.target).text());
});


// ====================================================================================== Buy Dialog Enhancements (Amount input support)

function getPrice() {
    let limitDom = $(this).closest(".order-window").find(".price input[type=number]");
    let price = 0;

    if (!limitDom.prop("disabled")) {
        price = limitDom.val();
    } else {
        let lastPriceDom = $(this).closest(".order-window").find(".last-price").last()
        price = lastPriceDom.text();
    }
    price = parseFloat(price.match(/[\d,\.]+/)[0].replace(/,/g, ""));
    return price;
}

// Update Zerodha quantity field based on entered amount
function updateZerodhaField() {
    let $input = $(this).closest(".order-window").find(".quantity input");
    let inputLabel = $input.attr("label");
    let quantity = 0;

    if (inputLabel.indexOf("Qty") !== -1 || inputLabel.indexOf("Quantity") !== -1) {
        let price = getPrice.apply(this);
        quantity = Math.round($(this).closest(".order-window").find(".ext-amount-input").val() / price);
        let step = parseInt($(this).closest(".order-window").find(".quantity input").prop("step"));
        if (quantity % step !== 0) {
            let remainder = quantity % step;
            if (remainder <= step / 2) {
                quantity = quantity - remainder;
            } else {
                quantity = quantity + step - remainder;
            }
        }
    }
    if (inputLabel.indexOf("Amt") !== -1 || inputLabel.indexOf("Amount") !== -1) {
        quantity = $(this).closest(".order-window").find(".ext-amount-input").val()
    }

    $(this).closest(".order-window").find(".quantity input").val2(quantity);
}

// Update the custom amount input based on quantity * price
function updateOurField() {
    let price = getPrice.apply(this);
    let $input = $(this).closest(".order-window").find(".quantity input");
    let inputLabel = $input.attr("label");
    let amount =0;
    if (inputLabel.indexOf("Qty") !== -1 || inputLabel.indexOf("Quantity") !== -1) {
        amount = parseInt($input.val() * price);
    }
    if (inputLabel.indexOf("Amt") !== -1 || inputLabel.indexOf("Amount") !== -1) {
        amount = parseInt($input.val());
    }
    $(this).closest(".order-window").find(".ext-amount-input").val(amount);
}

// When user clicks a predefined amount link (like 2K, 1L, etc.)
$(document).on("click", ".order-window .ext-amount-selector", function (e) {
    e.preventDefault();
    $(this).closest(".order-window").find(".ext-amount-input").val($(this).data("amount").toString().replace(/,/g, ""));
    updateZerodhaField.apply(this)
    updateOurField.apply(this);
});

// Sync amount field when user types a number directly
$(document).on("input change", ".order-window .ext-amount-input", function () {
    updateZerodhaField.apply(this);
});

// Update amount field when any core field is modified
$(document).on("input change click submit", ".order-window .quantity input, .price input[type=number], .order-window button, .order-window [type=radio][name='exchange']", function (e) {
    if (e.originalEvent.isTrusted == true) {
        updateOurField.apply(this);
    }
});

// Inject amount field + quick selectors once buy window is present
VK.waitUntilMore(".order-window:not(:has(.ext-amount))", function () {
  const amounts = [
    100, 500, 1000, 2000, 2500, 5000, 10000, 15000, 20000, 25000,
    50000, 75000, 100000, 150000, 200000, 250000, 300000, 350000,
    400000, 450000, 500000, 750000, 1000000, 1250000, 1500000,
    1750000, 2000000, 2500000, 5000000, 7500000, 10000000, 20000000, 50000000, 75000000
  ];

  const formatAmount = (val) => val >= 10000000 ? (val / 10000000) + "C"
                        : val >= 100000 ? (val / 100000) + "L"
                        : val >= 1000 ? (val / 1000) + "K"
                        : val;

  const links = amounts.map(a => `
    <label>&nbsp;<a href="#" class="ext-amount-selector" data-amount="${a}">${formatAmount(a)}</a></label>
  `).join("");

  const html = `
    <br><div class="ext-amount" style="">
      <label>Amount (₹): <input type="number" class="ext-amount-input" style="width: 100px;"></label><br>
      ${links}
    </div>
  `;

  $(this).find("footer").append($(html));
  updateOurField.apply(this);
});

// ====================================================================================== Hide Squared-off

window.squaredOffVisibility = 0;
window.toggleSquaredOffVisibility = function (visiblity) {
    if (visiblity === undefined) {
        window.squaredOffVisibility = !window.squaredOffVisibility;
    } else {
        window.squaredOffVisibility = visiblity;
    }
    if (window.squaredOffVisibility) {
        VK.addStyle(".ext-hidden {visibility: collapse;}");
    } else {
        VK.addStyle(".ext-hidden {visibility: visible;}");
    }
}
window.toggleSquaredOffVisibility(window.squaredOffVisibility);

$(document).on("click", ".ext-checkbox", function () {
    window.toggleSquaredOffVisibility($(this).is(":checked"));
});

function addSquaredToolbar() {
    if ($(".data-table div.toolbar span.ext-toolbar").length == 0) {
        $(".data-table div.toolbar").prepend('<span class="ext-toolbar"><label><input type="checkbox" class="ext-checkbox">&nbsp;Hide Squared off&nbsp;</label></span>');
    }
    $(".ext-checkbox").prop("checked", window.squaredOffVisibility);
}

setInterval(function () {
    addSquaredToolbar();
    if (location.href == "https://kite.zerodha.com/holdings") {
        $("table tbody tr").each(function () {
            if ($(this).find("td:nth(1)").text().trim() == "0") {
                $(this).addClass("ext-hidden");
            } else {
                $(this).removeClass("ext-hidden");
            }
        });
    }

    if (location.href == "https://kite.zerodha.com/orders") {
        $("table tbody tr").each(function () {
            let $td = $(this).find("td.order-status");
            let text = $td.text().trim();
            let visible = ["REJECTED", "CANCELLED AMO"].indexOf(text) === -1;
            if (!visible) {
                $(this).addClass("ext-hidden");
            } else {
                $(this).removeClass("ext-hidden");
            }
        });
    }
    if (location.href == "https://kite.zerodha.com/positions") {
        $("table tbody tr").each(function () {
            if ($(this).find("td:nth(1)").hasClass("greyed")) {
                //if ($(this).find("td:nth(1)").text().trim() == "CNC") {
                $(this).addClass("ext-hidden");
            } else {
                $(this).removeClass("ext-hidden");
            }
        });

        $(".ext-checkbox").prop("checked", window.squaredOffVisibility);

    }
}, 500);


// ====================================================================================== GTT Link on top bar

$(document).on("click", ".ext-gtt-link", async function (e) {
    e.preventDefault();
    $("a[href='/orders']").click2();
    await VK.timeout(1);
    $(".page-nav a[href='/orders/gtt']").click2();
});

setInterval(function () {
    if ($(".app-nav .ext-gtt-link").length == 0) {
        $("<a href='/orders/gtt' class='ext-gtt-link'><span>GTT</span></a>").insertAfter($(".app-nav a[href='/dashboard']"));
    }

    if (VK.parseURL().pathname == "/orders/gtt") {
        $(".router-link-active:not(.ext-gtt-link)").removeClass("router-link-active");
        $(".ext-gtt-link").addClass("router-link-active");
    } else {
        $(".ext-gtt-link").removeClass("router-link-active");
    }
}, 500);

// ====================================================================================== Hide Quickwatch section

window.quickwatch_enabled = true;

$(document).on("click", ".ext-quickwatch-button", function (e) {
    e.preventDefault();
    window.quickwatch_enabled = !window.quickwatch_enabled;

    $(".container-left").css("display", window.quickwatch_enabled ? "block" : "none");
    $(".ext-quickwatch-label").text(
        `👁️ QuickWatch ${window.quickwatch_enabled ? "✔" : "✘"}`
    );
});


setInterval(function () {
    if ($(".app-nav .ext-quickwatch-button").length === 0) {
        $("<a href='#' class='ext-quickwatch-button'>" +
            "<span class='ext-quickwatch-label'>👁️ QuickWatch ✔</span>" +
        "</a>").insertBefore($(".app-nav a[href='/dashboard']"));
    }
}, 500);


// ====================================================================================== Zoom levels with Zoom In / Out

window.zoomLevel = 4; // 100% = index 4
const zoomPercents = [80, 85, 90, 95, 100, 110, 115, 120, 125];
const zoomTargets = [
    ".marketwatch .items-wrapper .group-wrapper",
    ".app .page-nav",
    ".app section"
];

function applyZoomLevel() {
    const zoom = zoomPercents[window.zoomLevel];
    zoomTargets.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.zoom = `${zoom}%`;
        });
    });
}

$(document).on("click", ".ext-zoom-in", function (e) {
    e.preventDefault();
    window.zoomLevel++;
    if (window.zoomLevel >= zoomPercents.length) {
        window.zoomLevel = 4; // reset to 100%
    }
    applyZoomLevel();
});

$(document).on("click", ".ext-zoom-out", function (e) {
    e.preventDefault();
    window.zoomLevel--;
    if (window.zoomLevel < 0) {
        window.zoomLevel = 4; // reset to 100%
    }
    applyZoomLevel();
});

// Inject Zoom buttons into navbar
setInterval(function () {
    if ($(".app-nav .ext-zoom-controls").length === 0) {
        $(`<span class="ext-zoom-controls" style="margin-right: 10px;">
          <a href="#" class="ext-zoom-out" style="margin-right: 5px;" title="Zoom Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </a>
          <a href="#" class="ext-zoom-in" title="Zoom In">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </a>
        </span>`).insertBefore($(".app-nav a[href='/dashboard']"));

    }
}, 500);





// ====================================================================================== Full width

$(function () {
    VK.addStyle(`
        .app .wrapper, .container {
            max-width: 98%;
        }
        @media only screen and (min-width: 1500px) {
            .app .wrapper, .container {
                // max-width: 98%;
            }
        }
        .app .container .container-right {
           max-width: inherit;
        }
         body {
         overflow-x: hidden !important;
         }  
    `);

    setTimeout(function () {
        VK.addStyle(".bounce {right: 0px;}");
    }, 1);
});


// ====================================================================================== Hide annoying scroll area below charts
VK.waitUntilMore(".container-right .tvchart .instrument-market-data", function () {
    $(this).remove();
});
VK.waitUntilMore(".container-right .chart-wrapper .instrument-market-data", function () {
    $(this).remove();
});
setInterval(function () {
    $("#tv_chart_container").css("height", "calc(100vh - 64px)");
    $(".chart-wrapper .chart-container .chart-page iframe").css("height", "calc(100vh - 70px)");
}, 100);

// ====================================================================================== Hide Risk disclosures
if (isDevMode()) {
    (async () => {
        await VK.waitUntilExists("div.modal-header:contains(Risk disclosures on derivatives)");
        $(".modal-footer button:contains(I understand)").click();
    })();
}

// ======================================================================================  USD Conversion Toggle
// ==========================
// 💱 USD Conversion Toggle
// ==========================

window.INR_TO_USD = 85.0; // Default rate
window.usd_conversion_enabled = false;

// Inject USD toggle button into navbar
VK.waitUntilExists(".app-nav a[href='/dashboard']", function () {
    if ($(".app-nav .ext-usd-toggle").length === 0) {
        $("<a href='#' class='ext-usd-toggle'>" +
            "<span class='ext-usd-label'>🔴 USD Mode ✘</span>" +
        "</a>").insertBefore($(this));
    }
});

// Toggle on click
$(document).on("click", ".ext-usd-toggle", function (e) {
    e.preventDefault();
    window.usd_conversion_enabled = !window.usd_conversion_enabled;

    const newText = window.usd_conversion_enabled
        ? "🟢 USD Mode ✔"
        : "🔴 USD Mode ✘";

    $(this).find(".ext-usd-label").text(newText);

    convertToUSD(window.usd_conversion_enabled);
});

function convertToUSD(enable) {
  const rate = parseFloat(window.INR_TO_USD) || 85;

  const selectors = [
    ".holdings .stats .value",
    ".pnl",
    "h4.value",
    "td[data-label='Invested']",
    "td[data-label='Cur. val']",
    "td[data-label='P&L']",
    "td[data-label='Avg. cost']",
    "td[data-label='LTP']",
    ".value.text-red",
    ".value.text-green"
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      // Skip elements containing percentage signs
      const cleanText = el.cloneNode(true).textContent.trim();
      if (cleanText.includes('%')) return;

      // 🧼 Restore if toggling OFF
      if (!enable) {
        if (el.dataset.original) {
          el.innerHTML = el.dataset.original;
          delete el.dataset.original;
          delete el.dataset.usd;
          el.removeAttribute("title");
        }
        return;
      }

      // Already converted
      if (el.dataset.usd === "1") return;

      const match = cleanText.match(/-?\d[\d,]*\.?\d*/);
      if (!match) return;

      const number = parseFloat(match[0].replace(/,/g, ""));
      if (isNaN(number)) return;

      const usdFormatted = (Math.abs(number) / rate).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      const updated = cleanText.replace(match[0], `${number < 0 ? '-' : ''}$${usdFormatted}`);

      el.dataset.original = el.innerHTML;
      el.dataset.usd = "1";
      el.innerHTML = updated;

      el.title = `Converted from ₹${number.toLocaleString()} @ ₹${rate}/USD`;
    });
  });

  // ✅ Watchlist sidebar prices
  document.querySelectorAll(".marketwatch .item .price .last-price").forEach(el => {
    const original = el.dataset.original || el.textContent.trim();

    if (!enable) {
      if (el.dataset.original) {
        el.textContent = el.dataset.original;
        delete el.dataset.original;
        delete el.dataset.usd;
        el.removeAttribute("title");
      }
      return;
    }

    if (el.dataset.usd === "1") return;

    const num = parseFloat(original.replace(/,/g, ""));
    if (isNaN(num)) return;

    const usd = (num / rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    el.dataset.original = original;
    el.dataset.usd = "1";
    el.textContent = `$${usd}`;
    el.title = `Converted from ₹${num.toLocaleString()} @ ₹${rate}/USD`;
  });

  // ✅ 52W High Column
  document.querySelectorAll("td.ext-52w-cell").forEach(el => {
    const original = el.dataset.original || el.textContent.trim();

    if (!enable) {
      if (el.dataset.original) {
        el.textContent = el.dataset.original;
        delete el.dataset.original;
        delete el.dataset.usd;
        el.removeAttribute("title");
      }
      return;
    }

    if (el.dataset.usd === "1") return;

    const num = parseFloat(original.replace(/,/g, ""));
    if (isNaN(num)) return;

    const usd = (num / rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    el.dataset.original = original;
    el.dataset.usd = "1";
    el.textContent = `$${usd}`;
    el.title = `Converted from ₹${num.toLocaleString()} @ ₹${rate}/USD`;
  });

}


// Right-click to set rate
$(document).on("contextmenu", ".ext-usd-toggle", function (e) {
    e.preventDefault();
    const input = prompt("Enter INR to USD rate:", window.INR_TO_USD);
    if (input && !isNaN(parseFloat(input))) {
        window.INR_TO_USD = parseFloat(input);
        alert(`USD rate updated to ₹${window.INR_TO_USD}`);
        if (window.usd_conversion_enabled) convertToUSD(true);
    }
});

function renderInvestmentBar() {
    const statsSelector = ".holdings .stats";
    const investedEl = document.querySelector(`${statsSelector} h4.value`);
    const valueEl = document.querySelectorAll(`${statsSelector} h4.value`)[1]; // second .value element

    if (!investedEl || !valueEl) return;

    const rawInvested = parseFloat(investedEl.textContent.replace(/[^\d.-]/g, '').replace(/,/g, ''));
    const rawCurrent = parseFloat(valueEl.textContent.replace(/[^\d.-]/g, '').replace(/,/g, ''));

    if (isNaN(rawInvested) || isNaN(rawCurrent)) return;

    // Bar Wrapper
    if (!document.querySelector(".ext-investment-bar")) {
        const tooltip = `Invested: ₹${rawInvested.toLocaleString()}, Current: ₹${rawCurrent.toLocaleString()}`;
        const barHTML = `
            <div class="ext-investment-bar" title="${tooltip}" style="margin-top: 12px; height: 10px; width: 100%; background: #ddd; border-radius: 4px; overflow: hidden; display: flex; cursor: help;">
                <div class="ext-invest-bar-green" style="height: 100%; background: #4caf50;"></div>
                <div class="ext-invest-bar-red" style="height: 100%; background: #f44336;"></div>
            </div>
        `;

        investedEl.closest(".stats").insertAdjacentHTML("beforeend", barHTML);
    }

    const greenBar = document.querySelector(".ext-invest-bar-green");
    const redBar = document.querySelector(".ext-invest-bar-red");

    const percentage = Math.min(rawCurrent / rawInvested, 1);
    const greenWidth = (percentage * 100).toFixed(2) + "%";
    const redWidth = (100 - percentage * 100).toFixed(2) + "%";

    greenBar.style.width = greenWidth;
    redBar.style.width = redWidth;
    // Call recovery helper
    renderRecoveryCalculator(rawInvested, rawCurrent);
}

setInterval(renderInvestmentBar, 1000);

function renderRecoveryCalculator(invested, current) {
    // Remove existing recovery tag if any
    const old = document.querySelector(".ext-recovery-tip");
    if (old) old.remove();

    if (current >= invested) return; // No loss → no recovery tip

    const recoveryPct = ((invested - current) / current) * 100;
    const formatted = recoveryPct.toFixed(2);

    const tip = document.createElement("div");
    tip.className = "ext-recovery-tip";
    tip.style.marginTop = "4px";
    tip.style.fontSize = "12px";
    tip.style.color = "#888";
    tip.textContent = `🔁 Recover by +${formatted}% to Breakeven`;

    const stats = document.querySelector(".holdings .stats");
    if (stats) stats.appendChild(tip);
}

function injectRecoveryColumn() {
  const table = document.querySelector(".holdings table");
  if (!table) return;

  const headerRow = table.querySelector("thead tr");
  const rows = table.querySelectorAll("tbody tr");

  const headers = Array.from(headerRow.children).map(th => th.textContent.trim());

  let recoveryIndex = headers.findIndex(h => h === "Recovery");
  if (recoveryIndex === -1) {
    // Insert header before Day chg.
    const dayChgTh = Array.from(headerRow.children).find(th => th.textContent.trim() === "Day chg.");
    const th = document.createElement("th");
    th.textContent = "Recovery";
    th.className = "ext-recovery-header";
    th.style.textAlign = "right";
    headerRow.insertBefore(th, dayChgTh?.nextSibling || null);
    recoveryIndex = Array.from(headerRow.children).findIndex(th => th.textContent.trim() === "Recovery");
    console.log(`🧩 Recovery column header inserted at index ${recoveryIndex}`);
  }

  rows.forEach((row, rowIdx) => {
    if (row.querySelector(".ext-recovery-cell")) return;

    const invested = parseFloat(row.querySelector("td[data-label='Invested']")?.textContent.replace(/[^\d.-]/g, '').replace(/,/g, ''));
    const current = parseFloat(row.querySelector("td[data-label='Cur. val']")?.textContent.replace(/[^\d.-]/g, '').replace(/,/g, ''));

    const td = document.createElement("td");
    td.className = "ext-recovery-cell";
    td.setAttribute("data-label", "Recovery");
    td.style.textAlign = "right";

    if (!isNaN(invested) && !isNaN(current)) {
      if (current < invested) {
        const recovery = ((invested - current) / current) * 100;
        const diff = invested - current;
        td.textContent = `+${recovery.toFixed(2)}%`;
        td.title = `To breakeven, value must rise by ₹${diff.toLocaleString()} (${recovery.toFixed(2)}%)`;
        td.style.color = "#f44336";
      } else {
        td.textContent = "✔";
        td.style.color = "#4caf50";
        td.style.fontWeight = "bold";
      }
    }

    const children = Array.from(row.children);
    const refNode = children[recoveryIndex] || null;
    row.insertBefore(td, refNode);
    console.log(`✅ Inserted Recovery for row ${rowIdx} at index ${recoveryIndex}`);
  });
}



setInterval(() => {
    if (location.href.includes("/holdings")) {
        injectRecoveryColumn();
    }
}, 1000);

const style = document.createElement("style");
style.textContent = `
.ext-52w-bar {
  margin-top: 2px;
  height: 4px;
  width: 70%;
  background: #ddd;
  border-radius: 3px;
  overflow: hidden;
}
.ext-52w-bar .bar-fill {
  height: 100%;
}
`;
document.head.appendChild(style);

function normalizeSymbol(sym) {
  return sym
  ?.split(" ")[0]
  ?.replace(/[-.]/g, '')
  ?.replace(/-EQ$/, '')
  ?.toUpperCase()
  ?.trim();
}

(() => {
  const ext52wHighs = {};

  fetch("https://opensheet.vercel.app/12jNlOWmywXF3glc54jrFj_Vhlx1TUUFHBHgFQOuO2Uw/52_week_high_zerodha")
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      data.forEach(row => {
        const symbol = row.Symbol?.trim();
        let highStr = row.High52W?.trim();

        console.log('Raw High52W:', row.High52W, '→ Cleaned:', highStr);

        if (!symbol || !highStr || highStr === '--' || highStr === '-') return;

        highStr = highStr.replace(/[^0-9.]/g, '');

        const high = parseFloat(highStr);
        const normalizedSymbol = normalizeSymbol(symbol);

        if (!normalizedSymbol || isNaN(high) || high < 1 || high > 100000) return;

        ext52wHighs[normalizedSymbol] = high;
      });

      window.ext52wHighs = ext52wHighs;
      console.log("✅ Cleaned 52W data", window.ext52wHighs);
    })
    .catch(err => console.error("❌ Failed to load 52W data", err));
})();


function render52WeekBars() {
  const highs = window.ext52wHighs;
  if (!highs || Object.keys(highs).length === 0) return;

  const table = document.querySelector(".holdings table");
  if (!table) return;

  const theadRow = table.querySelector("thead tr");
  const has52wColumn = !!theadRow.querySelector("th.ext-52w-header");

  if (!has52wColumn) {
    // Inject header
    const ltpTh = Array.from(theadRow.children).find(th => th.textContent.trim().includes("LTP"));
    const th = document.createElement("th");
    th.textContent = "52W High";
    th.className = "ext-52w-header";
    th.style.textAlign = "right";
    ltpTh?.insertAdjacentElement("afterend", th);
  }

  document.querySelectorAll("table tbody tr").forEach((tr) => {
    // existing logic for injecting bar and data cell
    const instrumentCell = tr.querySelector("td[data-label='Instrument']");
    const ltpCell = tr.querySelector("td[data-label='LTP']");
    const symbolEl = instrumentCell?.querySelector("a.initial > span");
    const rawSymbol = symbolEl?.textContent?.trim();
    const high = highs[normalizeSymbol(rawSymbol)];
    const ltp = parseFloat(ltpCell?.textContent.replace(/,/g, ''));

    if (!high || isNaN(ltp)) return;
      if (!high) {
    console.warn(`Missing 52W high for: "${normalizeSymbol(rawSymbol)}"`);
    }


    const percent = Math.round((ltp / high) * 100);
    const color = percent >= 80 ? "#4caf50" : percent >= 50 ? "#ff9800" : "#f44336";

    instrumentCell?.querySelector(".ext-52w-bar")?.remove();
    const bar = document.createElement("div");
    bar.className = "ext-52w-bar";
    bar.title = `52W High: ₹${high}, LTP: ₹${ltp} (${percent}%)`;
    bar.innerHTML = `<div class="bar-fill" style="width:${percent}%; background:${color};"></div>`;
    symbolEl?.after(bar);

    const has52wCell = tr.querySelector("td.ext-52w-cell");
    if (!has52wCell) {
      const td = document.createElement("td");
      td.className = "ext-52w-cell";
      td.setAttribute("data-label", "52W High");
      td.textContent = high.toLocaleString();
      td.style.textAlign = "right";
      ltpCell?.insertAdjacentElement("afterend", td);
    } else {
      has52wCell.textContent = high.toLocaleString();
      has52wCell.setAttribute("data-label", "52W High");
    }
  });

  // ✅ NEW: Ensure consistency across all rows
  document.querySelectorAll("table tbody tr").forEach((tr) => {
    const ltpCell = tr.querySelector("td[data-label='LTP']");
    const has52wCell = tr.querySelector("td.ext-52w-cell");

    if (!has52wCell && ltpCell) {
      const td = document.createElement("td");
      td.className = "ext-52w-cell";
      td.setAttribute("data-label", "52W High");
      td.textContent = "-";
      td.style.textAlign = "right";
      ltpCell.insertAdjacentElement("afterend", td);
    }
  });
}




setInterval(() => {
  if (location.href.includes("/holdings")) {
    console.log("🔁 Checking for 52W bar injection...");
    render52WeekBars();
  }
}, 3000);


(function () {
  const STORAGE_KEY = "ext-column-visibility";
  const COLUMNS = [
    "Invested", "Cur. val", "P&L",
    "Day chg.", "Net chg.", "Recovery", "52W High"
  ];

  const loadPrefs = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  };

  const savePrefs = prefs =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

  const applyPrefs = () => {
    const prefs = loadPrefs();
    const table = document.querySelector(".holdings table");
    if (!table) return;

    const headers = table.querySelectorAll("thead th");
    headers.forEach(th => {
        const label = th.textContent.trim();
        const visible = prefs[label] !== false;

        // Toggle header visibility
        th.style.display = visible ? "" : "none";

        // Toggle corresponding td visibility by matching data-label
        const cells = table.querySelectorAll(`tbody td[data-label="${label}"]`);
        cells.forEach(td => {
        td.style.display = visible ? "" : "none";
        });
    });
    };



  const isDarkTheme = () => {
    const bg = getComputedStyle(document.body).backgroundColor;
    if (!bg) return false;
    const rgb = bg.match(/\d+/g)?.map(Number) || [];
    const luminance = rgb.length >= 3
      ? (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2])
      : 255;
    return luminance < 128;
  };

  const makeDraggable = (el) => {
    let isDragging = false, offsetX = 0, offsetY = 0;
    el.onmousedown = (e) => {
      isDragging = true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      document.onmousemove = (e) => {
        if (isDragging) {
          el.style.left = `${e.clientX - offsetX}px`;
          el.style.top = `${e.clientY - offsetY}px`;
        }
      };
      document.onmouseup = () => {
        isDragging = false;
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  };

  const togglePanel = () => {
    const existing = document.querySelector(".ext-column-panel");
    if (existing) return existing.remove();

    const prefs = loadPrefs();
    const dark = isDarkTheme();

    const panel = document.createElement("div");
    panel.className = "ext-column-panel";
    panel.style.cssText = `
      position: fixed;
      top: 70px; left: calc(100vw - 220px);
      z-index: 9999;
      background: ${dark ? "#1e1e1e" : "#fff"};
      color: ${dark ? "#eee" : "#000"};
      border: 1px solid ${dark ? "#444" : "#ccc"};
      padding: 12px 14px;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      font-size: 13px;
      width: 180px;
      cursor: move;
    `;

    const controls = document.createElement("div");
    controls.style.marginBottom = "8px";
    controls.innerHTML = `
      <button id="ext-select-all">Select All</button>
      <button id="ext-reset-cols" style="margin-left:6px;">Reset</button>
    `;
    controls.querySelectorAll("button").forEach(btn => {
      btn.style.cssText = `
        font-size: 12px;
        padding: 4px 6px;
        margin: 2px 0;
        cursor: pointer;
        background: ${dark ? "#333" : "#eee"};
        color: ${dark ? "#fff" : "#000"};
        border: 1px solid ${dark ? "#555" : "#ccc"};
        border-radius: 4px;
      `;
    });

    controls.querySelector("#ext-select-all").onclick = () => {
      const newPrefs = {};
      COLUMNS.forEach(k => newPrefs[k] = true);
      savePrefs(newPrefs);
      applyPrefs();
      togglePanel();
    };

    controls.querySelector("#ext-reset-cols").onclick = () => {
      localStorage.removeItem(STORAGE_KEY);
      applyPrefs();
      togglePanel();
    };

    panel.appendChild(controls);

    COLUMNS.forEach(label => {
      const row = document.createElement("label");
      row.style.display = "block";
      row.style.margin = "2px 0";
      row.style.cursor = "pointer";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = prefs[label] !== false;
      cb.style.marginRight = "6px";
      cb.onchange = () => {
        prefs[label] = cb.checked;
        savePrefs(prefs);
        applyPrefs();
      };

      row.appendChild(cb);
      row.append(" " + label);
      panel.appendChild(row);
    });

    document.body.appendChild(panel);
    makeDraggable(panel);
  };

  const injectButton = () => {
    if (document.querySelector(".ext-column-toggle")) return;

    const nav = document.querySelector(".app-nav");
    const anchor = nav?.querySelector("a[href='/dashboard']");
    if (!nav || !anchor) return;

    const btn = document.createElement("a");
    btn.href = "#";
    btn.className = "ext-column-toggle";
    btn.innerText = "🧹 Columns";
    btn.style.marginRight = "10px";
    btn.onclick = (e) => {
      e.preventDefault();
      togglePanel();
    };

    anchor.parentElement.insertBefore(btn, anchor);
  };

  VK.waitUntilExists(".holdings table", () => {
    injectButton();
    applyPrefs();
  });
})();


console.log("🧪 Running VK sanity check from main.js");

if (!window.VK) {
  console.error("❌ VK object not found — utils.js may not be loaded.");
}
if (!window.themeManager) {
  console.warn("⚠️ Theme Manager not detected (yet)");
}
if (typeof convertToUSD !== "function") {
  console.warn("⚠️ USD converter not defined");
}
if (document.querySelector(".ext-52w-bar")) {
  console.log("📊 Found 52W High bar in DOM.");
}

// =============================================================
// 🧠 Tooltip USD Conversion 
// =============================================================
document.addEventListener("mouseover", function (e) {
  const el = e.target.closest("span[data-tooltip-content]");
  if (!el) return;

  const enable = window.usd_conversion_enabled;
  const rate = parseFloat(window.INR_TO_USD) || 85;
  const original = el.dataset.originalTooltip || el.getAttribute("data-tooltip-content");

  // Already converted?
  if (enable && el.dataset.usdTooltip === "1") return;

  // Revert on toggle OFF
  if (!enable) {
    if (el.dataset.originalTooltip) {
      el.setAttribute("data-tooltip-content", el.dataset.originalTooltip);
      delete el.dataset.usdTooltip;
      delete el.dataset.originalTooltip;
    }
    return;
  }

  // Extract INR value and convert
  const match = original.match(/(-?[\d,]+\.\d{2})/); // capture only the number
  if (!match) return;

  const inr = parseFloat(match[1].replace(/,/g, ""));
  if (isNaN(inr)) return;

  const usd = (inr / rate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const updated = original.replace(match[1], `$${usd}`) + ` — from ₹${inr.toLocaleString()} @ ₹${rate}/USD`;

  el.dataset.originalTooltip = original;
  el.dataset.usdTooltip = "1";
  el.setAttribute("data-tooltip-content", updated);
});

// =============================================================
// 💬 Motivational Quote Banner (below recovery tip)
// =============================================================
(function setupQuoteAfterRecoveryTip() {
  fetch(chrome.runtime.getURL("quotes.json"))
    .then(res => res.json())
    .then(quotes => {
      if (!quotes || quotes.length === 0) return;

      let index = Math.floor(Math.random() * quotes.length);

      function getNextQuote() {
        index = (index + 1) % quotes.length;
        return quotes[index];
      }

      function applyRandomGradient(el) {
        // Apply a text gradient class randomly (1–5)
        for (let i = 1; i <= 5; i++) {
          el.classList.remove(`text-gradient-${i}`);
        }
        const rand = Math.floor(Math.random() * 5) + 1;
        el.classList.add(`text-gradient-${rand}`);
      }

      function renderQuote(quoteObj) {
        const statsRow = document.querySelector(".stats.row");
        if (!statsRow) return;

        let banner = document.querySelector(".stats.row .ext-quote-banner");
        if (!banner) {
          banner = document.createElement("div");
          banner.className = "ext-quote-banner";
          banner.style.cssText = `
            width: 100%;
            text-align: center;
            padding: 6px 0;
            margin-top: 6px;
            display: flex;
            justify-content: center;
            align-items: center;
          `;

          const quoteEl = document.createElement("span");
          quoteEl.className = "ext-random-quote";
          quoteEl.style.cssText = `
            font-size: 15px;
            font-weight: 500;
            white-space: nowrap;
          `;
          banner.appendChild(quoteEl);

          // Append below recovery tip if present, else at end of stats.row
          const recoveryEl = statsRow.querySelector(".ext-recovery-tip");
          if (recoveryEl) {
            recoveryEl.insertAdjacentElement("afterend", banner);
          } else {
            statsRow.appendChild(banner);
          }
        }

        const quoteEl = banner.querySelector(".ext-random-quote");
        quoteEl.textContent = `💬 ${quoteObj.text}`;
        applyRandomGradient(quoteEl);
      }


      // Show the first quote only after recovery tip is available
      const statsBar = document.querySelector(".stats.row");
      if (statsBar) {
        renderQuote(quotes[index]);

        setInterval(() => {
          renderQuote(getNextQuote());
        }, 30000);
      }


    })
    .catch(err => {
      console.error("❌ Failed to load quotes.json", err);

      // Alert developer if running in dev mode
      if (isDevMode()) {
        alert("Quote file missing or corrupted: quotes.json");
      }
    });

})();

// =============================================================
// ✅ Final Sanity Checks
// =============================================================
console.log("🧪 Running VK sanity check from main.js");

if (!window.VK) {
  console.error("❌ VK object not found — utils.js may not be loaded.");
}
if (!window.themeManager) {
  console.warn("⚠️ Theme Manager not detected (yet)");
}

// 🧪 Fallback check if themeManager isn’t registered, but styles are present
if (!document.getElementById("theme-font-style") && !document.querySelector("[id^='style-']")) {
  console.warn("⚠️ Theme styles not injected yet");
} else {
  console.log("🎨 Theme styles detected in DOM");
}

if (typeof convertToUSD !== "function") {
  console.warn("⚠️ USD converter not defined");
}
if (document.querySelector(".ext-52w-bar")) {
  console.log("📊 Found 52W High bar in DOM.");
}