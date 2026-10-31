/* RO'Lyfe Shared Property Research Dock
 * Common research entry point for RO'Lyfe static GitHub Pages projects.
 * No scraping, API credentials, or background lookup is performed.
 */
(function () {
  "use strict";
  if (document.getElementById("rolyfeResearchDock")) return;

  var PROPERTY_URL = "https://rolrichman.github.io/rolyfe-property-research-intelligence/";
  var PROPERTY_MAP_URL = PROPERTY_URL + "#map";
  var AUCTION_URL = "https://rolrichman.github.io/ro-lyfe-auction-capital-machine/";
  var FUNDING_URL = "https://rolrichman.github.io/rolyfe-funding/";
  var DOCS_URL = "https://rolrichman.github.io/rolyfe-contract-documents-hub/";
  var COMMAND_URL = "https://rolrichman.github.io/rolyfe-command-center/";
  var STORAGE_KEY = "rolyfe_property_research_records_v1";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function readSavedRecords() {
    try {
      var value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value.filter(function (r) { return r && typeof r === "object" && r.address; }) : [];
    } catch (_) { return []; }
  }
  function displayAddress(record) {
    var address = String(record.address || "").trim();
    var state = String(record.state || "").trim();
    if (!address || !state || address.toLowerCase().indexOf(state.toLowerCase()) !== -1) return address;
    return address + ", " + state;
  }
  function makeQueryUrl(query) {
    return "https://www.google.com/search?q=" + encodeURIComponent(query);
  }

  var sources = [
    { id: "maps", label: "Google Maps", group: "Location & parcel", domain: null, direct: "https://maps.google.com/" },
    { id: "zillow", label: "Zillow", group: "Listings & comps", domain: "zillow.com", direct: "https://www.zillow.com/" },
    { id: "redfin", label: "Redfin", group: "Listings & comps", domain: "redfin.com", direct: "https://www.redfin.com/" },
    { id: "realtor", label: "Realtor.com", group: "Listings & comps", domain: "realtor.com", direct: "https://www.realtor.com/" },
    { id: "homes", label: "Homes.com", group: "Listings & comps", domain: "homes.com", direct: "https://www.homes.com/" },
    { id: "auction", label: "Auction.com", group: "Auctions & tax sales", domain: "auction.com", direct: "https://www.auction.com/" },
    { id: "bid4assets", label: "Bid4Assets", group: "Auctions & tax sales", domain: "bid4assets.com", direct: "https://www.bid4assets.com/" },
    { id: "phila-sheriff", label: "Philadelphia Sheriff Sales", group: "Auctions & tax sales", domain: "phillysheriff.com", direct: "https://phillysheriff.com/property-listing/" },
    { id: "govease", label: "GovEase tax sales", group: "Auctions & tax sales", domain: "govease.com", direct: "https://www.govease.com/tax-sale-property-auctions" },
    { id: "realauction", label: "RealAuction", group: "Auctions & tax sales", domain: "realauction.com", direct: "https://www.realauction.com/" },
    { id: "lienhub", label: "LienHub", group: "Auctions & tax sales", domain: "lienhub.com", direct: "https://www.google.com/search?q=LienHub+official+tax+sale+portal" },
    { id: "govdeals", label: "GovDeals real estate", group: "Auctions & tax sales", domain: "govdeals.com", direct: "https://www.govdeals.com/" },
    { id: "propwire", label: "PropWire investor leads", group: "Investor leads", domain: "propwire.com", direct: "https://propwire.com/investors" },
    { id: "regrid", label: "Regrid parcels", group: "Location & parcel", domain: "regrid.com", direct: "https://app.regrid.com/reports/parcels" },
    { id: "official", label: "Official county / tax records", group: "Location & parcel", domain: null, direct: null },
    { id: "phila", label: "Philadelphia Property App", group: "Location & parcel", domain: null, direct: "https://property.phila.gov/" },
    { id: "fema", label: "FEMA flood maps", group: "Location & parcel", domain: "msc.fema.gov", direct: "https://msc.fema.gov/portal/search" },
    { id: "icontainers", label: "iContainers freight quotes", group: "Freight & logistics", domain: "icontainers.com", direct: "https://www.icontainers.com/" }
  ];

  var style = document.createElement("style");
  style.textContent =
    ".rolpr-dock{margin:14px 0 18px;padding:0;border:1px solid #315268;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#0b1b28,#102b3b);color:#f0f7fc;font-family:Arial,Helvetica,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.12)}" +
    ".rolpr-dock *{box-sizing:border-box}.rolpr-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 16px;border-bottom:1px solid #29495c}" +
    ".rolpr-kicker{font-size:10px;letter-spacing:.15em;font-weight:800;color:#77e8f1;text-transform:uppercase}.rolpr-title{font-size:17px;font-weight:900;margin:4px 0;color:#f4fbff}.rolpr-subtitle{font-size:12px;line-height:1.5;color:#afc4d3}" +
    ".rolpr-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.rolpr-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:38px;border:1px solid #46677b;border-radius:10px;padding:9px 12px;background:#122c3e;color:#f5fbff!important;text-decoration:none!important;font-size:12px;font-weight:800;cursor:pointer}" +
    ".rolpr-btn.primary{background:#75e8f0;color:#05202a!important;border-color:#75e8f0}.rolpr-btn:hover{filter:brightness(1.12)}.rolpr-summary{cursor:pointer;list-style:none;padding:12px 16px;font-size:12px;font-weight:800;color:#d9f8fc}.rolpr-summary::-webkit-details-marker{display:none}.rolpr-summary:after{content:'＋';float:right;font-size:16px}.rolpr-content[open]>.rolpr-summary:after{content:'−'}" +
    ".rolpr-tools{padding:0 16px 16px}.rolpr-searchrow{display:grid;grid-template-columns:minmax(0,1fr) minmax(170px,.55fr) auto;gap:9px;margin-bottom:12px}.rolpr-searchrow input,.rolpr-searchrow select{width:100%;min-width:0;min-height:42px;border:1px solid #36586c;border-radius:10px;padding:10px 12px;background:#061521;color:#eff8ff;font-size:13px}" +
    ".rolpr-group{margin-top:12px}.rolpr-group h4{margin:0 0 7px;color:#b5e9ee;font-size:11px;letter-spacing:.08em;text-transform:uppercase}.rolpr-sourcegrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.rolpr-source{display:flex;align-items:center;justify-content:flex-start;min-height:38px;padding:9px 10px;border:1px solid #29495c;border-radius:10px;background:#0c2231;color:#f3f9fe;text-decoration:none!important;font-size:12px;font-weight:750;line-height:1.25}.rolpr-source:hover{border-color:#75e8f0;color:#bffbff}" +
    ".rolpr-foot{border-top:1px solid #29495c;padding:11px 16px;color:#9eb6c7;font-size:11px;line-height:1.55}.rolpr-foot a{color:#92eff5}.rolpr-journey{display:flex;gap:7px;flex-wrap:wrap;padding:0 16px 12px}" +
    "@media(max-width:780px){.rolpr-sourcegrid{grid-template-columns:repeat(2,minmax(0,1fr))}.rolpr-searchrow{grid-template-columns:1fr 1fr}.rolpr-searchrow input{grid-column:1/-1}.rolpr-searchrow .rolpr-btn{width:100%}.rolpr-head{align-items:flex-start}}" +
    "@media(max-width:420px){.rolpr-sourcegrid{grid-template-columns:1fr 1fr}.rolpr-title{font-size:15px}.rolpr-actions{width:100%}.rolpr-actions .rolpr-btn{flex:1}.rolpr-searchrow{grid-template-columns:1fr}.rolpr-searchrow input{grid-column:auto}}";
  document.head.appendChild(style);

  var isPrimary = location.pathname.indexOf("rolyfe-property-research-intelligence") !== -1;
  var saved = readSavedRecords();
  var firstAddress = saved.length ? displayAddress(saved[0]) : "";
  var groups = ["Listings & comps", "Auctions & tax sales", "Investor leads", "Location & parcel", "Freight & logistics"];
  var options = '<option value="">Select a saved property…</option>';
  saved.forEach(function (r, i) {
    options += '<option value="' + i + '">' + escapeHtml(displayAddress(r) || "Saved property " + (i + 1)) + '</option>';
  });

  var dock = document.createElement("section");
  dock.id = "rolyfeResearchDock";
  dock.className = "rolpr-dock";
  dock.setAttribute("aria-label", "Shared RO'Lyfe property research tools");
  var sourceGroups = "";
  groups.forEach(function (group) {
    var items = sources.filter(function (source) { return source.group === group; });
    sourceGroups += '<div class="rolpr-group"><h4>' + escapeHtml(group) + '</h4><div class="rolpr-sourcegrid">';
    items.forEach(function (source) {
      sourceGroups += '<a class="rolpr-source" href="' + escapeHtml(source.direct || "#") + '" data-source="' + escapeHtml(source.id) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(source.label) + ' ↗</a>';
    });
    if (group === "Auctions & tax sales") {
      sourceGroups += '<a class="rolpr-source" href="https://www.google.com/search?q=AssetHound+property+auction+official" data-source="assethound" target="_blank" rel="noopener noreferrer">AssetHound ↗</a>';
    }
    sourceGroups += '</div></div>';
  });

  dock.innerHTML =
    '<div class="rolpr-head"><div><div class="rolpr-kicker">Shared research workspace · Find → Verify → Underwrite → Fund</div>' +
    '<div class="rolpr-title">RO’Lyfe Property Research Dock</div>' +
    '<div class="rolpr-subtitle">One launchpad for listings, comps, auctions, tax liens, parcel records, flood risk, capital handoff, and freight.</div></div>' +
    '<div class="rolpr-actions"><a class="rolpr-btn primary" href="' + PROPERTY_MAP_URL + '" data-action="map">Open Property Map ↗</a>' +
    '<a class="rolpr-btn" href="' + PROPERTY_URL + '#intake">Property Intake ↗</a></div></div>' +
    '<details class="rolpr-content"' + (isPrimary ? " open" : "") + '><summary class="rolpr-summary">Open research tools · saved leads from this browser profile</summary>' +
    '<div class="rolpr-tools"><div class="rolpr-searchrow">' +
    '<input id="rolpr-address" type="search" autocomplete="off" spellcheck="false" aria-label="Property address, parcel ID, city, or ZIP" placeholder="Address, parcel/APN, city, or ZIP" value="' + escapeHtml(firstAddress) + '">' +
    '<select id="rolpr-saved" aria-label="Choose a saved property">' + options + '</select>' +
    '<button class="rolpr-btn primary" type="button" id="rolpr-search-all">Search all sources ↗</button></div>' +
    '<div class="rolpr-sourcegroups">' + sourceGroups + '</div></div>' +
    '<div class="rolpr-journey"><a class="rolpr-btn" href="' + AUCTION_URL + '">Auction Capital Machine ↗</a>' +
    '<a class="rolpr-btn" href="' + FUNDING_URL + '">Funding & capital ↗</a><a class="rolpr-btn" href="' + DOCS_URL + '">Contracts & documents ↗</a>' +
    '<a class="rolpr-btn" href="' + COMMAND_URL + '">Command Hub ↗</a></div>' +
    '<div class="rolpr-foot">Source buttons open a provider or an address-targeted web search; they do not scrape or import listing, ownership, tax-lien, or comparable-sale data. Verify material facts against primary records. Records use browser local storage on the rolrichman.github.io origin, so they do not sync to another browser/device and should not contain sensitive personal or financial information. For Philadelphia, start with the <a href="https://property.phila.gov/" target="_blank" rel="noopener noreferrer">official Property App</a>. For tax sales, verify the official county sale notice and terms before bidding. The iContainers shortcut opens your provider site; automated quotes require separate authorized API access.</div></details>';

  var header = document.querySelector("header");
  if (header && header.parentNode) header.insertAdjacentElement("afterend", dock);
  else document.body.insertAdjacentElement("afterbegin", dock);

  function addressValue() {
    return String(dock.querySelector("#rolpr-address").value || "").trim();
  }
  function getUrl(sourceId, query) {
    var source = sources.find(function (s) { return s.id === sourceId; });
    if (!source) {
      return sourceId === "assethound"
        ? makeQueryUrl(query ? 'AssetHound real estate auction "' + query + '"' : "AssetHound property auction official")
        : makeQueryUrl(query);
    }
    if (sourceId === "maps") {
      return query ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query) : source.direct;
    }
    if (sourceId === "official") {
      return query
        ? makeQueryUrl('"' + query + '" property parcel assessment tax sale lien county official records')
        : makeQueryUrl("official county property assessor tax sale parcel search");
    }
    if (sourceId === "phila") {
      return query ? makeQueryUrl('site:property.phila.gov "' + query + '"') : source.direct;
    }
    if (sourceId === "fema" && query) return makeQueryUrl('site:msc.fema.gov "' + query + '" flood map');
    if (source.domain && query) return makeQueryUrl('site:' + source.domain + ' "' + query + '"');
    return source.direct || makeQueryUrl(query);
  }

  dock.querySelectorAll("[data-source]").forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      event.preventDefault();
      window.open(getUrl(anchor.dataset.source, addressValue()), "_blank", "noopener,noreferrer");
    });
  });
  dock.querySelector("#rolpr-saved").addEventListener("change", function () {
    if (this.value === "") return;
    var record = saved[Number(this.value)];
    if (record) dock.querySelector("#rolpr-address").value = displayAddress(record);
  });
  dock.querySelector("#rolpr-search-all").addEventListener("click", function () {
    var query = addressValue();
    if (!query) {
      dock.querySelector("#rolpr-address").focus();
      dock.querySelector("#rolpr-address").placeholder = "Enter an address or parcel first";
      return;
    }
    window.open(makeQueryUrl('"' + query + '" real estate property parcel listing auction tax sale lien comps'), "_blank", "noopener,noreferrer");
  });
  dock.querySelector('[data-action="map"]').addEventListener("click", function (event) {
    var mapSection = document.getElementById("map");
    if (mapSection) {
      event.preventDefault();
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof window.rolyfeRefreshPropertyMap === "function") window.rolyfeRefreshPropertyMap();
    }
  });
})();