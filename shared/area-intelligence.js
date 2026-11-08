/* RO'Lyfe County, ZIP and Target-Area Explorer
 * Shared across Property Research, Acquisition, Auction, Funding,
 * Relocation, Deal Terminal and Contract Hub through the central dock.
 * County geometry: U.S. Census Bureau TIGERweb 2026 county layer.
 * ZIP searches: user-triggered OpenStreetMap Nominatim geocoding.
 * Saved target areas are browser-local watchlist entries, not market rankings.
 */
(function () {
  "use strict";
  var dock = document.getElementById("rolyfeResearchDock");
  if (!dock || document.getElementById("rolpr-area-explorer")) return;

  var COUNTY_SERVICE = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/19/query";
  var NOMINATIM = "https://nominatim.openstreetmap.org/search";
  var WATCH_KEY = "rolyfe_target_areas_v1";
  var PROPERTY_URL = "https://rolrichman.github.io/rolyfe-property-research-intelligence/";
  var states = [
    ["01","AL","Alabama"],["02","AK","Alaska"],["04","AZ","Arizona"],["05","AR","Arkansas"],
    ["06","CA","California"],["08","CO","Colorado"],["09","CT","Connecticut"],["10","DE","Delaware"],
    ["11","DC","District of Columbia"],["12","FL","Florida"],["13","GA","Georgia"],["15","HI","Hawaii"],
    ["16","ID","Idaho"],["17","IL","Illinois"],["18","IN","Indiana"],["19","IA","Iowa"],
    ["20","KS","Kansas"],["21","KY","Kentucky"],["22","LA","Louisiana"],["23","ME","Maine"],
    ["24","MD","Maryland"],["25","MA","Massachusetts"],["26","MI","Michigan"],["27","MN","Minnesota"],
    ["28","MS","Mississippi"],["29","MO","Missouri"],["30","MT","Montana"],["31","NE","Nebraska"],
    ["32","NV","Nevada"],["33","NH","New Hampshire"],["34","NJ","New Jersey"],["35","NM","New Mexico"],
    ["36","NY","New York"],["37","NC","North Carolina"],["38","ND","North Dakota"],["39","OH","Ohio"],
    ["40","OK","Oklahoma"],["41","OR","Oregon"],["42","PA","Pennsylvania"],["44","RI","Rhode Island"],
    ["45","SC","South Carolina"],["46","SD","South Dakota"],["47","TN","Tennessee"],["48","TX","Texas"],
    ["49","UT","Utah"],["50","VT","Vermont"],["51","VA","Virginia"],["53","WA","Washington"],
    ["54","WV","West Virginia"],["55","WI","Wisconsin"],["56","WY","Wyoming"],["72","PR","Puerto Rico"]
  ];
  var stateByCode = {};
  var stateByAbbr = {};
  states.forEach(function (s) { stateByCode[s[0]] = s; stateByAbbr[s[1]] = s; });
  var countyCache = {};
  var countyRows = [];
  var watchAreas = readWatchAreas();
  var activeAreaLayer = null;
  var activeMap = null;
  var lastGeocodeAt = 0;
  var geocodeBusy = false;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c];
    });
  }
  function readWatchAreas() {
    try {
      var value = JSON.parse(localStorage.getItem(WATCH_KEY) || "[]");
      return Array.isArray(value) ? value.filter(function (x) { return x && typeof x === "object"; }).slice(0,100) : [];
    } catch (_) { return []; }
  }
  function writeWatchAreas() {
    try { localStorage.setItem(WATCH_KEY, JSON.stringify(watchAreas)); return true; }
    catch (_) { return false; }
  }
  function stateName(code) {
    var row = stateByCode[String(code || "")];
    return row ? row[2] : "";
  }
  function stateCodeFromAbbr(abbr) {
    var row = stateByAbbr[String(abbr || "").toUpperCase()];
    return row ? row[0] : "";
  }
  function stateAbbr(code) {
    var row = stateByCode[String(code || "")];
    return row ? row[1] : "";
  }
  function status(message, isError) {
    var el = area.querySelector("#rolpr-area-status");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("is-error", !!isError);
  }
  function selectedStateCode() { return area.querySelector("#rolpr-area-state").value; }
  function selectedCounty() {
    var geoid = area.querySelector("#rolpr-area-county").value;
    return countyRows.find(function (x) { return x.geoid === geoid; }) || null;
  }
  function selectedZip() { return area.querySelector("#rolpr-area-zip").value.trim(); }
  function selectedAreaCode() { return area.querySelector("#rolpr-area-code").value.replace(/\D/g, "").slice(0,3); }
  function selectedPlace() { return area.querySelector("#rolpr-area-place").value.trim(); }
  function areaQuery() {
    var parts = [];
    var place = selectedPlace(), zip = selectedZip(), county = selectedCounty(), code = selectedStateCode();
    if (place) parts.push(place);
    if (zip && parts.indexOf(zip) === -1) parts.push(zip);
    if (county) parts.push(county.name);
    if (code && !parts.join(" ").toUpperCase().includes(stateAbbr(code))) parts.push(stateName(code));
    if (parts.length) parts.push("USA");
    return parts.join(", ");
  }
  function mapUrl() {
    var county = selectedCounty(), code = selectedStateCode(), zip = selectedZip(), place = selectedPlace(), areaCode = selectedAreaCode();
    var params = new URLSearchParams();
    params.set("area", "1");
    if (code) params.set("state", stateAbbr(code));
    if (county) {
      params.set("county", county.name);
      params.set("geoid", county.geoid);
    }
    if (zip) params.set("zip", zip);
    if (place) params.set("place", place);
    if (areaCode) params.set("npa", areaCode);
    return PROPERTY_URL + "?" + params.toString() + "#map";
  }
  function setField(id, value) {
    var el = document.getElementById(id);
    if (!el || value == null || value === "") return false;
    if (el.tagName === "SELECT") {
      var wanted = String(value).trim();
      var option = Array.prototype.find.call(el.options, function (o) {
        return o.value.toLowerCase() === wanted.toLowerCase() || o.textContent.trim().toLowerCase() === wanted.toLowerCase();
      });
      if (!option && id === "state") {
        option = document.createElement("option");
        option.value = wanted;
        option.textContent = wanted;
        el.appendChild(option);
      }
      if (option) el.value = option.value;
      else return false;
    } else {
      el.value = String(value);
    }
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  function applyAreaToCurrentPage() {
    var code = selectedStateCode(), abbr = stateAbbr(code), county = selectedCounty(), zip = selectedZip(), place = selectedPlace();
    var label = [place, county && county.name, stateName(code), zip].filter(Boolean).join(", ");
    var countyName = county ? county.name.replace(/\s+County$/i, "") : "";
    if (document.getElementById("propertyForm")) {
      setField("county", countyName);
      setField("state", abbr);
      setField("zipCode", zip);
      if (place) setField("address", place);
      else if (zip && !place) setField("address", zip + (countyName ? ", " + countyName : "") + (abbr ? ", " + abbr : ""));
      document.getElementById("intake") && document.getElementById("intake").scrollIntoView({ behavior: "smooth", block: "start" });
      status("Area details copied into Property Intake. Add the exact street address and verify the parcel before saving.", false);
      return;
    }
    if (document.getElementById("propertyState")) {
      setField("county", countyName);
      setField("propertyZip", zip);
      setField("propertyState", abbr);
      setField("address", place || zip || label);
      status("Area details copied into the Auction property fields. Confirm the exact property address and parcel before bidding.", false);
      return;
    }
    if (document.getElementById("locationSearch")) {
      setField("locationSearch", place || (zip ? zip : countyName ? countyName + ", " + stateName(code) : label));
      if (stateName(code)) setField("stateSelect", stateName(code));
      status("Location details copied to Relocation Intelligence. Use Locate this place to center its live map.", false);
      var locationSection = document.getElementById("location");
      if (locationSection) locationSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    var url = new URL(mapUrl());
    if (!url.searchParams.get("state") && abbr) url.searchParams.set("state", abbr);
    window.location.href = url.toString().replace("#map", "#intake");
  }
  function getMap() {
    try {
      if (window.propertyMap && typeof window.propertyMap.fitBounds === "function") return window.propertyMap;
      if (window.rolyfeRelocationMap && typeof window.rolyfeRelocationMap.fitBounds === "function") return window.rolyfeRelocationMap;
      if (window.ROLyfeAuctionMap && typeof window.ROLyfeAuctionMap.getMap === "function") {
        var auctionMap = window.ROLyfeAuctionMap.getMap();
        if (auctionMap && typeof auctionMap.fitBounds === "function") return auctionMap;
      }
    } catch (_) {}
    return null;
  }
  function openMapFallback(showWatchlist) {
    if (showWatchlist) {
      window.location.href = PROPERTY_URL + "?watchlist=1#map";
      return;
    }
    window.location.href = mapUrl();
  }
  function clearAreaLayer(map) {
    if (activeAreaLayer && map && map.hasLayer && map.hasLayer(activeAreaLayer)) map.removeLayer(activeAreaLayer);
    activeAreaLayer = null;
  }
  function countyQueryUrl(where, geometry) {
    var p = new URLSearchParams();
    p.set("where", where);
    p.set("outFields", "NAME,GEOID,STATE,COUNTY,INTPTLAT,INTPTLON,CENTLAT,CENTLON");
    p.set("returnGeometry", geometry ? "true" : "false");
    p.set("outSR", "4326");
    p.set("f", geometry ? "geojson" : "json");
    if (!geometry) p.set("orderByFields", "NAME");
    return COUNTY_SERVICE + "?" + p.toString();
  }
  async function fetchCounties(code) {
    if (!code) return [];
    if (countyCache[code]) return countyCache[code];
    var response = await fetch(countyQueryUrl("STATE='" + code + "'", false), { headers: { "Accept": "application/json" } });
    if (!response.ok) throw new Error("Census county directory returned HTTP " + response.status);
    var data = await response.json();
    if (data.error) throw new Error(data.error.message || "Census county query failed");
    var rows = (data.features || []).map(function (feature) {
      var a = feature.attributes || {};
      return { name: a.NAME || a.BASENAME || "County", geoid: String(a.GEOID || ""), state: String(a.STATE || code), county: String(a.COUNTY || "") };
    }).filter(function (x) { return x.geoid && x.name; }).sort(function (a,b) { return a.name.localeCompare(b.name); });
    countyCache[code] = rows;
    return rows;
  }
  async function loadCounties(code, preferredGeoid, preferredName) {
    var select = area.querySelector("#rolpr-area-county");
    select.disabled = true;
    select.innerHTML = '<option value="">Loading counties…</option>';
    countyRows = [];
    if (!code) {
      select.innerHTML = '<option value="">Select a state first</option>';
      return;
    }
    try {
      countyRows = await fetchCounties(code);
      select.innerHTML = '<option value="">Choose a county…</option>' + countyRows.map(function (x) {
        return '<option value="' + escapeHtml(x.geoid) + '">' + escapeHtml(x.name) + '</option>';
      }).join("");
      select.disabled = false;
      var match = countyRows.find(function (x) {
        return (preferredGeoid && x.geoid === String(preferredGeoid)) ||
          (preferredName && x.name.toLowerCase() === String(preferredName).toLowerCase()) ||
          (preferredName && x.name.toLowerCase() === (String(preferredName) + " County").toLowerCase());
      });
      if (match) select.value = match.geoid;
      status(countyRows.length + " county / county-equivalent areas loaded for " + stateName(code) + " from 2026 Census boundaries.", false);
    } catch (error) {
      select.innerHTML = '<option value="">County list unavailable — retry state</option>';
      select.disabled = true;
      status("County list could not load: " + (error.message || "network error") + ". You can still search by ZIP or city.", true);
    }
  }
  async function geocodeZip(zip) {
    var now = Date.now(), wait = Math.max(0, 1100 - (now - lastGeocodeAt));
    if (geocodeBusy) throw new Error("A ZIP lookup is already running. Please wait.");
    if (wait) await new Promise(function (resolve) { window.setTimeout(resolve, wait); });
    geocodeBusy = true;
    lastGeocodeAt = Date.now();
    try {
      var url = NOMINATIM + "?format=jsonv2&addressdetails=1&limit=1&postalcode=" + encodeURIComponent(zip) + "&country=United%20States";
      var response = await fetch(url, { headers: { "Accept": "application/json" }, referrerPolicy: "strict-origin-when-cross-origin" });
      if (!response.ok) throw new Error("ZIP geocoder returned HTTP " + response.status);
      var list = await response.json();
      if (!Array.isArray(list) || !list.length) throw new Error("No ZIP-code match found. Check the ZIP or try its city and state.");
      var hit = list[0], a = hit.address || {};
      return {
        lat: Number(hit.lat), lon: Number(hit.lon), display: hit.display_name || zip,
        city: a.city || a.town || a.village || a.hamlet || a.suburb || "",
        county: a.county || "",
        state: a.state || "",
        postcode: a.postcode || zip
      };
    } finally { geocodeBusy = false; }
  }
  async function geocodePlace(query) {
    var now = Date.now(), wait = Math.max(0, 1100 - (now - lastGeocodeAt));
    if (geocodeBusy) throw new Error("A location lookup is already running. Please wait.");
    if (wait) await new Promise(function (resolve) { window.setTimeout(resolve, wait); });
    geocodeBusy = true;
    lastGeocodeAt = Date.now();
    try {
      var url = NOMINATIM + "?format=jsonv2&addressdetails=1&limit=1&q=" + encodeURIComponent(query);
      var response = await fetch(url, { headers: { "Accept": "application/json" }, referrerPolicy: "strict-origin-when-cross-origin" });
      if (!response.ok) throw new Error("Location geocoder returned HTTP " + response.status);
      var list = await response.json();
      if (!Array.isArray(list) || !list.length) throw new Error("No location match found. Try a city, county and state, or a five-digit ZIP.");
      var hit = list[0], a = hit.address || {};
      return {
        lat: Number(hit.lat), lon: Number(hit.lon), display: hit.display_name || query,
        city: a.city || a.town || a.village || a.hamlet || a.suburb || "",
        county: a.county || "", state: a.state || "", postcode: a.postcode || ""
      };
    } finally { geocodeBusy = false; }
  }
  async function fetchCountyGeometry(geoid) {
    var response = await fetch(countyQueryUrl("GEOID='" + String(geoid).replace(/'/g, "") + "'", true), { headers: { "Accept": "application/geo+json,application/json" } });
    if (!response.ok) throw new Error("County boundary service returned HTTP " + response.status);
    var data = await response.json();
    if (data.error) throw new Error(data.error.message || "County boundary query failed");
    if (!data.features || !data.features.length) throw new Error("No Census boundary geometry was returned for this county.");
    return data;
  }
  function addCountyFeature(layer, feature, label) {
    return window.L.geoJSON(feature, {
      style: function () { return { color: "#f59e0b", weight: 3, opacity: 0.95, fillColor: "#f59e0b", fillOpacity: 0.14 }; },
      onEachFeature: function (f, item) {
        item.bindPopup("<strong>" + escapeHtml(label || (f.properties && f.properties.NAME) || "Target county") + "</strong><br>2026 U.S. Census TIGERweb county boundary<br>Search focus area — not an investment ranking.");
      }
    }).addTo(layer);
  }
  async function mapArea(options) {
    var map = getMap();
    if (!map || !window.L) { openMapFallback(); return false; }
    activeMap = map;
    status("Preparing map area…", false);
    clearAreaLayer(map);
    var group = window.L.featureGroup().addTo(map);
    activeAreaLayer = group;
    var bounds = null, county = selectedCounty(), code = selectedStateCode(), zip = selectedZip(), place = selectedPlace();
    if (!(options && options.geoid) && !zip && !(options && options.zip) && !place && !(options && options.place)) {
      status("An area code is not a mapped boundary. Choose a city, county or ZIP first, then map that precise search area.", true);
      return false;
    }
    var geoid = options && options.geoid || (county && county.geoid) || "";
    var label = options && options.label || (county ? county.name + ", " + stateName(code) : "");
    var geojson = null;
    try {
      if (geoid) {
        geojson = await fetchCountyGeometry(geoid);
        addCountyFeature(group, geojson, label);
        var geoLayer = window.L.geoJSON(geojson);
        bounds = geoLayer.getBounds();
      }
      if (zip || (options && options.zip)) {
        var z = zip || options.zip;
        var location = options && Number.isFinite(options.lat) ? { lat: options.lat, lon: options.lon, display: options.label || z } : await geocodeZip(z);
        if (Number.isFinite(location.lat) && Number.isFinite(location.lon)) {
          var marker = window.L.circleMarker([location.lat, location.lon], { radius: 9, color: "#08202a", weight: 2, fillColor: "#22d3ee", fillOpacity: 0.95 }).bindPopup("<strong>ZIP " + escapeHtml(z) + "</strong><br>" + escapeHtml(location.display) + "<br>Approximate geocoded search point; not a USPS delivery boundary.");
          marker.addTo(group);
          if (bounds) bounds.extend([location.lat, location.lon]);
          else bounds = window.L.latLngBounds([[location.lat, location.lon]]);
        }
      } else if (place && !geoid) {
        var point = await geocodePlace(place);
        if (Number.isFinite(point.lat) && Number.isFinite(point.lon)) {
          window.L.marker([point.lat, point.lon]).bindPopup("<strong>" + escapeHtml(place) + "</strong><br>Approximate search location.").addTo(group);
          bounds = window.L.latLngBounds([[point.lat, point.lon]]);
        }
      }
      if (bounds && bounds.isValid()) {
        map.invalidateSize({ pan: false });
        map.fitBounds(bounds, { padding: [24,24], maxZoom: 12 });
      }
      var note = geoid ? "County outline loaded from the 2026 Census TIGERweb boundary service." : "Search location mapped.";
      if (zip) note += " ZIP is shown as a geocoded point, not an official USPS delivery boundary.";
      status(note + " Saved property pins and existing map controls remain available.", false);
      return true;
    } catch (error) {
      if (group && map.hasLayer(group)) map.removeLayer(group);
      activeAreaLayer = null;
      status("Map area could not load: " + (error.message || "network error") + ". Try again or use the Property Map link.", true);
      return false;
    }
  }
  function getRecordForCurrentArea() {
    var code = selectedStateCode(), county = selectedCounty(), zip = selectedZip(), place = selectedPlace(), areaCode = selectedAreaCode();
    if (!county && !zip && !place) return null;
    var type = zip ? "zip" : (county ? "county" : "place");
    var geoid = county ? county.geoid : "";
    var label = zip ? ("ZIP " + zip + (county ? " · " + county.name : "") + (code ? ", " + stateAbbr(code) : "")) :
      (county ? county.name + ", " + stateAbbr(code) : place);
    return {
      id: type + "|" + (zip || geoid || place).toLowerCase() + "|" + (code || ""),
      type: type, geoid: geoid, zip: zip, place: place, state: code,
      stateAbbr: stateAbbr(code), stateName: stateName(code), areaCode: areaCode,
      county: county ? county.name : "", label: label + (areaCode ? " · Area code " + areaCode : ""),
      createdAt: new Date().toISOString()
    };
  }
  function saveCurrentArea() {
    var item = getRecordForCurrentArea();
    if (!item) {
      status("Choose a state and county, enter a ZIP, or type a city/address before saving a target area.", true);
      return;
    }
    var existing = watchAreas.findIndex(function (x) { return x.id === item.id; });
    if (existing >= 0) {
      watchAreas[existing] = Object.assign({}, watchAreas[existing], item);
    } else {
      watchAreas.unshift(item);
      watchAreas = watchAreas.slice(0,100);
    }
    if (!writeWatchAreas()) {
      status("The browser could not save your target-area watchlist. Check local storage availability.", true);
      return;
    }
    renderWatchlist();
    area.querySelector("#rolpr-watchlist").value = item.id;
    status("Saved " + item.label + " to My Target Areas on this browser profile.", false);
  }
  function renderWatchlist() {
    var select = area.querySelector("#rolpr-watchlist");
    if (!watchAreas.length) {
      select.innerHTML = '<option value="">No target areas saved yet</option>';
      select.disabled = true;
      area.querySelector("#rolpr-watch-map").disabled = true;
      area.querySelector("#rolpr-watch-remove").disabled = true;
      return;
    }
    select.disabled = false;
    select.innerHTML = '<option value="">Choose a saved target area…</option>' + watchAreas.map(function (x) {
      return '<option value="' + escapeHtml(x.id) + '">' + escapeHtml(x.label || x.county || x.zip || x.place || "Saved area") + '</option>';
    }).join("");
    area.querySelector("#rolpr-watch-map").disabled = false;
    area.querySelector("#rolpr-watch-remove").disabled = false;
  }
  async function mapWatchlist() {
    if (!watchAreas.length) { status("Save a county or ZIP to My Target Areas first.", true); return; }
    var map = getMap();
    if (!map || !window.L) { openMapFallback(true); return; }
    activeMap = map;
    clearAreaLayer(map);
    var group = window.L.featureGroup().addTo(map);
    activeAreaLayer = group;
    var bounds = null, successes = 0;
    status("Loading saved target areas onto the map…", false);
    for (var i=0;i<watchAreas.length;i++) {
      var item = watchAreas[i];
      try {
        if (item.geoid) {
          var gj = await fetchCountyGeometry(item.geoid);
          addCountyFeature(group, gj, item.label);
          var layer = window.L.geoJSON(gj);
          var b = layer.getBounds();
          if (b.isValid()) { if (bounds) bounds.extend(b); else bounds = b; }
          successes++;
        }
        if (item.zip) {
          var loc = Number.isFinite(item.lat) && Number.isFinite(item.lon) ? item : await geocodeZip(item.zip);
          if (Number.isFinite(loc.lat) && Number.isFinite(loc.lon)) {
            window.L.circleMarker([loc.lat,loc.lon],{radius:8,color:"#08202a",weight:2,fillColor:"#22d3ee",fillOpacity:.95})
              .bindPopup("<strong>" + escapeHtml(item.label) + "</strong><br>ZIP search point, not an official USPS boundary.")
              .addTo(group);
            if (bounds) bounds.extend([loc.lat,loc.lon]); else bounds = window.L.latLngBounds([[loc.lat,loc.lon]]);
            successes++;
          }
        } else if (!item.geoid && item.place) {
          var p = await geocodePlace(item.place);
          window.L.marker([p.lat,p.lon]).bindPopup(escapeHtml(item.label)).addTo(group);
          if (bounds) bounds.extend([p.lat,p.lon]); else bounds = window.L.latLngBounds([[p.lat,p.lon]]);
          successes++;
        }
      } catch (error) { console.warn("[RO’Lyfe area watchlist]", item.label, error); }
    }
    if (bounds && bounds.isValid()) map.fitBounds(bounds,{padding:[26,26],maxZoom:10});
    status(successes + " saved target area item(s) mapped. These are your chosen search zones, not externally ranked hot markets.", successes===0);
  }
  function removeWatchArea() {
    var id = area.querySelector("#rolpr-watchlist").value;
    if (!id) { status("Choose a saved target area to remove.", true); return; }
    watchAreas = watchAreas.filter(function (x) { return x.id !== id; });
    writeWatchAreas();
    renderWatchlist();
    status("Target area removed from this browser's watchlist.", false);
  }
  async function addPhillyRing() {
    var code = "42";
    area.querySelector("#rolpr-area-state").value = code;
    await loadCounties(code);
    var ring = [
      ["42017","Bucks County"],["42029","Chester County"],["42045","Delaware County"],
      ["42091","Montgomery County"],["42101","Philadelphia County"]
    ];
    ring.forEach(function (r) {
      var match = countyRows.find(function (x) { return x.geoid === r[0]; });
      var item = {
        id: "county|" + r[0] + "|42", type: "county", geoid: r[0], zip: "", place: "",
        state: "42", stateAbbr: "PA", stateName: "Pennsylvania",
        county: match ? match.name : r[1], label: (match ? match.name : r[1]) + ", PA",
        createdAt: new Date().toISOString()
      };
      if (!watchAreas.some(function (x) { return x.id === item.id; })) watchAreas.push(item);
    });
    watchAreas = watchAreas.slice(0,100);
    writeWatchAreas();
    renderWatchlist();
    status("Added the five-county Greater Philadelphia starter search ring: Bucks, Chester, Delaware, Montgomery and Philadelphia. This is a regional search preset, not a claim that these are the hottest investment markets.", false);
  }
  async function researchAreaCode() {
    var areaCode = selectedAreaCode();
    if (!/^[2-9]\d{2}$/.test(areaCode)) {
      status("Enter a valid three-digit North American area code, such as 215 or 267.", true);
      return;
    }
    var context = [selectedPlace(), selectedCounty() && selectedCounty().name, stateName(selectedStateCode())].filter(Boolean).join(" ");
    var q = "NANPA area code " + areaCode + " geographic area cities counties" + (context ? " " + context : "") + " official";
    window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank", "noopener,noreferrer");
    status("Opened an area-code research query for " + areaCode + ". Area codes may overlap and are not exact postal or county boundaries; confirm the specific city or ZIP before mapping homes.", false);
  }
  function searchProviders() {
    var query = areaQuery(), areaCode = selectedAreaCode();
    if (!query) { status("Enter a city/address or choose a state, county or ZIP first. An area code alone is too broad to locate homes.", true); return; }
    if (areaCode) query += ", geographic telephone area code " + areaCode + " region (verify exact cities before treating as a property boundary)";
    var old = dock.querySelector("#rolpr-address");
    if (old) old.value = query;
    var url = "https://www.google.com/search?q=" + encodeURIComponent('"' + query + '" homes for sale listings properties Zillow Redfin Realtor Homes.com auction');
    window.open(url, "_blank", "noopener,noreferrer");
    status("Opened a home-search query for " + query + ". Provider listing data stays on the provider site.", false);
  }
  function openProviderDirectory() {
    var directory = dock.querySelector(".rolpr-content");
    if (directory) { directory.open = true; directory.scrollIntoView({ behavior:"smooth", block:"nearest" }); }
  }
  function buildStateOptions() {
    return '<option value="">Select a state…</option>' + states.map(function (s) {
      return '<option value="' + s[0] + '">' + s[2] + ' (' + s[1] + ')</option>';
    }).join("");
  }

  var style = document.createElement("style");
  style.id = "rolpr-area-explorer-style";
  style.textContent =
    ".rolpr-area-explorer{margin:0 16px 14px;padding:14px;border:1px solid #315268;border-radius:14px;background:linear-gradient(145deg,#0a1a26,#10293a);color:#f2f8fc;box-shadow:0 8px 20px rgba(0,0,0,.14)}" +
    ".rolpr-area-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px}.rolpr-area-title strong{display:block;font-size:14px;color:#f4fbff}.rolpr-area-title small{display:block;margin-top:4px;color:#b0c8d6;font-size:11px;line-height:1.45}" +
    ".rolpr-area-grid{display:grid;grid-template-columns:1.15fr .8fr 1fr .7fr .65fr;gap:9px}.rolpr-area-grid label{display:grid;gap:5px;color:#bfe8ee;font-weight:800;font-size:11px}.rolpr-area-grid input,.rolpr-area-grid select,.rolpr-watch-row select{width:100%;min-width:0;min-height:41px;padding:9px 10px;border:1px solid #36586c;border-radius:9px;background:#061521;color:#eff8ff;font-size:13px}.rolpr-area-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.rolpr-area-actions .rolpr-btn{flex:1 1 140px}.rolpr-area-note{margin:9px 0 0;color:#9eb6c7;font-size:10px;line-height:1.5}.rolpr-area-status{margin-top:9px;padding:8px 10px;border-radius:8px;background:#0b2231;color:#c8edf0;font-size:11px;line-height:1.5}.rolpr-area-status.is-error{background:#321b1b;color:#ffd0c7}" +
    ".rolpr-watch-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid #29495c}.rolpr-watch-label{grid-column:1/-1;color:#b5e9ee;font-size:11px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}" +
    "@media(max-width:760px){.rolpr-area-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.rolpr-area-grid label:first-child{grid-column:1/-1}.rolpr-watch-row{grid-template-columns:minmax(0,1fr) auto}.rolpr-watch-row select{grid-column:1/-1}}" +
    "@media(max-width:430px){.rolpr-area-explorer{margin:0 10px 12px;padding:11px}.rolpr-area-grid{grid-template-columns:1fr}.rolpr-area-grid label:first-child{grid-column:auto}.rolpr-area-actions{display:grid;grid-template-columns:1fr 1fr}.rolpr-area-actions .rolpr-btn{width:100%;min-width:0;padding:9px 6px}.rolpr-watch-row{grid-template-columns:1fr}.rolpr-watch-row select{grid-column:auto}.rolpr-watch-row button{width:100%}}";
  document.head.appendChild(style);

  var area = document.createElement("section");
  area.id = "rolpr-area-explorer";
  area.className = "rolpr-area-explorer";
  area.innerHTML =
    '<div class="rolpr-area-title"><div><strong>🗺 County & ZIP Area Finder</strong><small>Search homes by state, county, city or ZIP. Map county boundaries and save your target areas across RO’Lyfe sites.</small></div><button type="button" class="rolpr-btn" id="rolpr-philly-ring">＋ Philly Metro Starter Ring</button></div>' +
    '<div class="rolpr-area-grid">' +
      '<label>City / address / market<input id="rolpr-area-place" type="search" placeholder="City, street address or market"></label>' +
      '<label>State<select id="rolpr-area-state">' + buildStateOptions() + '</select></label>' +
      '<label>County / equivalent<select id="rolpr-area-county" disabled><option value="">Choose a state first</option></select></label>' +
      '<label>ZIP code<input id="rolpr-area-zip" inputmode="numeric" autocomplete="postal-code" maxlength="10" placeholder="19104"></label>' +
      '<label>Area code<input id="rolpr-area-code" type="text" inputmode="numeric" autocomplete="off" maxlength="3" placeholder="215"></label>' +
    '</div>' +
    '<div class="rolpr-area-actions">' +
      '<button type="button" class="rolpr-btn primary" id="rolpr-area-search">Search homes</button>' +
      '<button type="button" class="rolpr-btn" id="rolpr-area-code-research">Research area code</button>' +
      '<button type="button" class="rolpr-btn" id="rolpr-area-map">Map selected area</button>' +
      '<button type="button" class="rolpr-btn" id="rolpr-area-use">Use in this workspace</button>' +
      '<button type="button" class="rolpr-btn" id="rolpr-area-save">＋ Save target area</button>' +
    '</div>' +
    '<div class="rolpr-watch-row"><div class="rolpr-watch-label">My Target Areas · your search hot spots</div><select id="rolpr-watchlist" disabled><option value="">No target areas saved yet</option></select><button type="button" class="rolpr-btn primary" id="rolpr-watch-map" disabled>Map watchlist</button><button type="button" class="rolpr-btn" id="rolpr-watch-remove" disabled>Remove</button></div>' +
    '<div id="rolpr-area-status" class="rolpr-area-status" role="status" aria-live="polite">Loading the 2026 U.S. Census county directory for Pennsylvania… ZIP search uses approximate geocoding; saved areas stay in this browser profile.</div>' +
    '<p class="rolpr-area-note">Area codes describe broad telephone numbering regions. Overlays can cover the same area; an area code is not an exact home-search, county or ZIP boundary. Research it first, then choose a city, county or ZIP for precise mapping.</p>' +
    '<p class="rolpr-area-note">County outlines: U.S. Census Bureau TIGERweb 2026 legal-boundary layer. ZIP lookup: OpenStreetMap Nominatim approximate search point—not an official USPS delivery boundary. “Hot areas” here means areas you save to your own watchlist; RO’Lyfe does not label markets hot without verified market data.</p>';
  var head = dock.querySelector(".rolpr-head");
  if (head) head.insertAdjacentElement("afterend", area);
  else dock.querySelector(".rolpr-shell-body").insertAdjacentElement("afterbegin", area);

  area.querySelector("#rolpr-area-state").addEventListener("change", function () {
    loadCounties(this.value);
  });
  area.querySelector("#rolpr-area-search").addEventListener("click", searchProviders);
  area.querySelector("#rolpr-area-code-research").addEventListener("click", researchAreaCode);
  area.querySelector("#rolpr-area-code").addEventListener("input", function () { this.value = this.value.replace(/\D/g, "").slice(0,3); });
  area.querySelector("#rolpr-area-map").addEventListener("click", function () {
    var zip = selectedZip();
    if (zip && !/^\d{5}(?:-\d{4})?$/.test(zip)) {
      status("Enter a valid five-digit ZIP code (or ZIP+4).", true); return;
    }
    mapArea();
  });
  area.querySelector("#rolpr-area-use").addEventListener("click", applyAreaToCurrentPage);
  area.querySelector("#rolpr-area-save").addEventListener("click", saveCurrentArea);
  area.querySelector("#rolpr-philly-ring").addEventListener("click", addPhillyRing);
  area.querySelector("#rolpr-watch-map").addEventListener("click", mapWatchlist);
  area.querySelector("#rolpr-watch-remove").addEventListener("click", removeWatchArea);
  area.querySelector("#rolpr-watchlist").addEventListener("change", function () {
    var item = watchAreas.find(function (x) { return x.id === this.value; }, this);
    if (!item) return;
    var stateRow = stateByCode[item.state];
    area.querySelector("#rolpr-area-state").value = item.state || "";
    area.querySelector("#rolpr-area-place").value = item.place || "";
    area.querySelector("#rolpr-area-zip").value = item.zip || "";
    area.querySelector("#rolpr-area-code").value = item.areaCode || "";
    if (item.state) loadCounties(item.state, item.geoid, item.county);
  });

  async function applyUrlArea() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("watchlist") === "1") {
      var watchTries = 0;
      var watchTimer = window.setInterval(function () {
        watchTries++;
        if (getMap()) { window.clearInterval(watchTimer); mapWatchlist(); }
        else if (watchTries >= 20) { window.clearInterval(watchTimer); status("Open My Target Areas and map the watchlist when the map is ready.", false); }
      }, 250);
      return;
    }
    if (params.get("area") !== "1") return;
    var abbr = params.get("state") || "", stateRow = stateByAbbr[abbr.toUpperCase()];
    var code = stateRow ? stateRow[0] : "";
    if (code) {
      area.querySelector("#rolpr-area-state").value = code;
      await loadCounties(code, params.get("geoid"), params.get("county"));
    }
    if (params.get("zip")) area.querySelector("#rolpr-area-zip").value = params.get("zip");
    if (params.get("place")) area.querySelector("#rolpr-area-place").value = params.get("place");
    if (params.get("npa")) area.querySelector("#rolpr-area-code").value = params.get("npa").replace(/\D/g, "").slice(0,3);
    var tries = 0;
    var timer = window.setInterval(function () {
      tries++;
      if (getMap()) {
        window.clearInterval(timer);
        mapArea({ geoid: params.get("geoid") || "", zip: params.get("zip") || "", label: (params.get("county") || params.get("place") || "Selected search area") });
      } else if (tries >= 20) {
        window.clearInterval(timer);
        status("Area details are ready. Open the Property Map to display the selected county or ZIP.", false);
      }
    }, 250);
  }

  renderWatchlist();
  var initialCode = "42";
  area.querySelector("#rolpr-area-state").value = initialCode;
  loadCounties(initialCode);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyUrlArea, { once: true });
  } else {
    applyUrlArea();
  }
  window.rolyfeAreaExplorer = {
    version: "2026.11.08",
    getWatchAreas: function () { return watchAreas.slice(); },
    mapArea: mapArea,
    mapWatchlist: mapWatchlist,
    getCountyDirectory: fetchCounties
  };
})();