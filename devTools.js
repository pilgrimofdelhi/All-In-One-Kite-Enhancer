"use strict";

if (!isDevMode()) {
  // Prevent accidental loading
  console.warn("Dev tools blocked in production");
  return;
}

console.log("🛠️ Developer Tools Loaded");

// ====================================================================================== Wider watchlist
// if (isDevMode()) {
//     VK.addStyle(`
//         .marketwatch-sidebar .marketwatch-selector {
//            width: 533px;
//         }
//         .marketwatch-sidebar .marketwatch-selector li.item {
//            padding: 10px 27px;
//         }
//         .marketwatch-sidebar .marketwatch-selector .settings {
//            padding: 10px 20px;
//         }
//     `);
//
//     setTimeout(function () {
//         let width1 = isDevMode() ? 550 : 383;
//         let width2 = width1 + 1;
//         VK.addStyle(`.container-left {min-width: ${width1}px;}`);
//         VK.addStyle(`.marketwatch-sidebar {width: ${width1}px !important;}`);
//         VK.addStyle(`.header-left {min-width: ${width2}px;}`);
//     }, 1);
// }

// ====================================================================================== Market Depth
// if (isDevMode()) {
//     window.depth_enabled = true;
//     $(document).on("click", ".ext-depth-button", function (e) {
//         e.preventDefault();
//         window.depth_enabled = !window.depth_enabled;
//         if (window.depth_enabled) {
//             $(this).find("span.ext-depth-status").text("✔");
//         } else {
//             $(this).find("span.ext-depth-status").text("✘");
//         }
//     });
//     setInterval(function () {
//         if ($(".app-nav .ext-depth-button").length == 0) {
//             $("<a href='#' class='ext-depth-button'><span class='ext-title-large'>Depth</span><span class='ext-title-small'>DPT</span> &nbsp;<span class='ext-depth-status'>✔</span></a>").insertBefore($(".app-nav a[href='/dashboard']"));
//         }
//     }, 500);
//
//     (async function () {
//         while (true) {
//             try {
//                 await VK.asyncDelay(500);
//                 if (!window.depth_enabled || document.hidden) {
//                     $(".ext-depth").css("display", "none");
//                     continue;
//                 } else {
//                     $(".ext-depth").css("display", "initial");
//                 }
//                 let instruments = [];
//                 $(".vddl-list .instrument").each(function () {
//                     let instrument =
//                         ($(this).find(".symbol .exchange").text() === "" ? "NSE" : $(this).find(".symbol .exchange").text())
//                         + ":" + $(this).find(".symbol .nice-name").text();
//
//                     instruments.push(instrument);
//                 });
//                 if (instruments.length === 0) {
//                     continue;
//                 }
//
//                 //let quotes = {"BSE:RELIANCE": 1};
//                 let quotes = await $.ajax({
//                     url: "https://trading.test/kite/quotesApi.php",
//                     method: "POST",
//                     data: {instruments: instruments},
//                 });
//                 $(".vddl-list .instrument").each(function (index) {
//                     let instrument =
//                         ($(this).find(".symbol .exchange").text() === "" ? "NSE" : $(this).find(".symbol .exchange").text())
//                         + ":" + $(this).find(".symbol .nice-name").text();
//
//                     let spread = "-";
//                     let colorSpread = "#A4A4A4"; // grey
//                     let depth1 = "-";
//                     let depthAmount1 = "";
//                     let color1 = "#4caf50"; // green
//                     let depth2 = "-";
//                     let depthAmount2 = "";
//                     let color2 = "#4caf50"; // green
//
//                     if (quotes[index] != null && quotes[index].original_instrument == instrument) {
//                         let quote = quotes[index];
//                         spread = (quote.spread === "-") ? "--" : Math.round(quote.spread * 100) / 100 + "%";
//                         colorSpread = (quote.spread > 0.1 || quote.spread === "-") ? "#df514c" : "#A4A4A4";
//
//                         if (quote.segment != "dOPT") {
//                             depth1 = quote.depth_ratio
//                             depthAmount1 = quote.depth_amount_display;
//                             if (depth1 < 1) {
//                                 color1 = "#df514c";
//                             }
//                             depth1 += "x";
//                             depth2 = quote.depth_ratio2;
//                             depthAmount2 = quote.depth_amount_display2;
//                             if (depth2 < 1) {
//                                 color2 = "#df514c";
//                             }
//                             depth2 += "x";
//                         }
//                     }
//
//                     if ($(this).find(".ext-depth").length === 0) {
//                         $(this).find(".price").children().first().css({"min-width": "52px"});
//                         $(this).find(".price").prepend(`
//                             <span class="ext-depth" style="min-width: 30px; padding-right: 4px;">
//                             <span class="dim ext-spread-ratio" style="min-widZth: 30px;"></span>
//                             <span style="min-width: 55px; displayZ: none;"><span class="dim ext-depth-ratio1"></span><span class="ext-depth-amount1 text-xxsmall"></span></span>
//                             <span style="min-width: 55px;"><span class="dim ext-depth-ratio2"></span><span class="ext-depth-amount2 text-xxsmall"></span></span>
//                             </span>
//                         `);
//                     }
//
//                     $(this).find(".ext-spread-ratio").css("color", colorSpread);
//                     $(this).find(".ext-spread-ratio").html2(spread);
//                     $(this).find(".ext-depth-ratio1").css("color", color2);
//                     $(this).find(".ext-depth-ratio1").html2(depth2);
//                     $(this).find(".ext-depth-amount1").html2("&nbsp;" + depthAmount2);
//                     $(this).find(".ext-depth-ratio2").css("color", color1);
//                     $(this).find(".ext-depth-ratio2").html2(depth1);
//                     $(this).find(".ext-depth-amount2").html2("&nbsp;" + depthAmount1);
//                 });
//
//                 //console.log(instruments);
//             } catch (e) {
//             }
//         }
//     })();
// }
// ====================================================================================== Auto Login
// if (isDevMode()) {
//    if ((VK.URL.href.startsWith("https://kite.zerodha.com/") && VK.URL.pathnow === "") || VK.URL.href.startsWith("https://kite.zerodha.com/connect/login?")) {
//        (async () => {
//            let creds = await $.get("https://trading.test/kite/loginCred.php");
//
//            await VK.waitUntilExists("input[type=password]");
//            $("input[type=text]").val2(creds.user);
//            $("input[type=password]").val2(creds.password);
//            $("button[type=submit]").click();
//
//            await VK.waitUntilExists(".twofa-value input");
//            $(".twofa-value input").val2(creds.topt);
//        })();
//    }
//}

// TODO
// ====================================================================================== Copy Symbol / Quick Square Off
// if (isDevMode()) {
//     $(document).on("click", ".ext-copy-link", async function (e) {
//         e.preventDefault();
//         let exchange = $(this).data("exchange");
//         let symbol = $(this).data("symbol");
//         let result = await $.get(`https://trading.test/kite/symbolInfo.php?fullSymbol=${exchange}:${symbol}`);
//         VK.copyToClipboard(result.matchingSymbol);
//     });
//     $(document).on("click", ".ext-copy-text-link", function (e) {
//         e.preventDefault();
//         let exchange = $(this).data("exchange");
//         let symbol = $(this).data("symbol");
//         VK.copyToClipboard(symbol);
//     });
// 
//     setInterval(function () {
//         if (location.href == "https://kite.zerodha.com/orders/gtt") {
//             $("table tbody tr").each(function () {
//                 let exchange = $(this).closest("tr").find("td.instrument .exchange").text().trim();
//                 let symbol = $(this).closest("tr").find("td.instrument .tradingsymbol").text().trim();
// 
//                 let link = exchange + ":" + symbol
//                     + ":" + (-1 * parseFloat($(this).find("td.quantity").text().trim()));
//                 link = "https://trading.test/kite/order.php?submit=1&orders[]=" + encodeURIComponent(link);
// 
//                 if (isDevMode()) {
//                     const exchange = $(this).find("td.instrument .exchange").text().trim();
//                     const symbol = $(this).find("td.instrument .tradingsymbol").text().trim();
//                     const quantity = parseFloat($(this).find("td.quantity").text().trim());
// 
//                     if (exchange && symbol && !isNaN(quantity)) {
//                         if ($(this).find("a.ext-exit-link").length == 0) {
//                             const link = `https://trading.test/kite/order.php?submit=1&orders[]=${encodeURIComponent(exchange + ':' + symbol + ':' + (-1 * quantity))}`;
// 
//                             $(this).find("td.instrument").prepend(
//                                 $("<a class='ext-exit-link' target='_blank'>x </a>").attr("href", link)
//                             );
//                             $(this).find("td.instrument").prepend(
//                                 $("<a class='ext-copy-text-link' target='_blank' href='#full-text'>⎘ </a>")
//                                     .data("exchange", exchange)
//                                     .data("symbol", symbol)
//                             );
//                             $(this).find("td.instrument").prepend(
//                                 $("<a class='ext-copy-link' target='_blank' href='#text'>⎘ </a>")
//                                     .data("exchange", exchange)
//                                     .data("symbol", symbol)
//                             );
//                         }
//                     }
//                 }
// 
//             });
//         }
// 
//         $("table tbody tr").each(function () {
//             let exchange = $(this).closest("tr").find("td.instrument .exchange").text().trim();
//             let symbol = $(this).closest("tr").find("td.instrument .tradingsymbol").text().trim();
// 
//             let link = $(this).find("td.product").text().trim() + ":" + exchange + ":" + symbol
//                 + ":" + (-1 * parseFloat($(this).find("td.quantity").text().trim()));
//             link = "https://trading.test/kite/order.php?submit=1&orders[]=" + encodeURIComponent(link);
// 
//             if (isDevMode()) {
//                 const exchange = $(this).find("td.instrument .exchange").text().trim();
//                 const symbol = $(this).find("td.instrument .tradingsymbol").text().trim();
//                 const quantity = parseFloat($(this).find("td.quantity").text().trim());
// 
//                 if (exchange && symbol && !isNaN(quantity)) {
//                     if ($(this).find("a.ext-exit-link").length == 0) {
//                         const link = `https://trading.test/kite/order.php?submit=1&orders[]=${encodeURIComponent(exchange + ':' + symbol + ':' + (-1 * quantity))}`;
// 
//                         $(this).find("td.instrument").prepend(
//                             $("<a class='ext-exit-link' target='_blank'>x </a>").attr("href", link)
//                         );
//                         $(this).find("td.instrument").prepend(
//                             $("<a class='ext-copy-text-link' target='_blank' href='#full-text'>⎘ </a>")
//                                 .data("exchange", exchange)
//                                 .data("symbol", symbol)
//                         );
//                         $(this).find("td.instrument").prepend(
//                             $("<a class='ext-copy-link' target='_blank' href='#text'>⎘ </a>")
//                                 .data("exchange", exchange)
//                                 .data("symbol", symbol)
//                         );
//                     }
//                 }
//             }
// 
//         });
//     }, 500);
// }

// setInterval(function () {
//     let width = 90;
//     if ($(".container-right>.tvchart").length > 0) {
//         width = 100;
//     }
//     width = width + "%";
//     if ($(".container").css("max-width") != width) {
//         $(".app .wrapper, .container").css("max-width", width);
//         window.dispatchEvent(new Event('resize'));
//     }
//
// }, 100);
