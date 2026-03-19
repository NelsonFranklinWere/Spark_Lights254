// Updates product card titles/prices (and WhatsApp order text) using the original
// catalog dataset stored in `collection.html.backup`.
// This keeps KES prices accurate across category pages.
(function () {
  let cachedMap = null;
  let cachedCatalog = null;
  let cachedLoadPromise = null;

  // Only include images that actually exist in this repo.
  // This prevents category pages from rendering <img> tags for missing files.
  const EXISTING_IMAGES = new Set([
    "Screenshot_2025_1008_135228.png",
    "Screenshot_2025_1008_135432.png",
    "Screenshot_2025_1008_135625.png",
    "ceiling2.png",
    "ceiling3.png",
    "ceiling4.png",
    "ceiling5.png",
    "ceiling6.png",
    "ceiling7.png",
    "ceiling8.png",
    "ceilingLightss1.png",
    "ceilingLightss10.png",
    "ceilingLightss11.png",
    "ceilingLightss12.png",
    "ceilingLightss13.png",
    "ceilingLightss14.png",
    "ceilingLightss15.png",
    "ceilingLightss16.png",
    "ceilingLightss17.png",
    "ceilingLightss19.png",
    "ceilingLightss2.png",
    "ceilingLightss20.png",
    "ceilingLightss21.png",
    "ceilingLightss22.png",
    "ceilingLightss23.png",
    "ceilingLightss24.png",
    "ceilingLightss25.png",
    "ceilingLightss27.png",
    "ceilingLightss28.png",
    "ceilingLightss29.png",
    "ceilingLightss30.png",
    "ceilingLightss31.png",
    "ceilingLightss32.png",
    "ceilingLightss33.png",
    "ceilingLightss34.png",
    "ceilingLightss35.png",
    "ceilingLightss3.png",
    "ceilingLightss4.png",
    "ceilingLightss5.png",
    "ceilingLightss6.png",
    "ceilingLightss7.png",
    "ceilingLightss8.png",
    "ceilingLightss9.png",
    "dinning.png",
    "kitchen.png",
    "number1.jpg",
    "number2.png",
    "number3.jpg",
    "out1.jpg",
    "roomm1.png",
    "roomm2.png",
    "roomm3.png",
    "round.jpg",
    "round1.jpg",
    "round2.jpg",
    "round3.jpg",
    "super1.jpg",
    "wallLights10.png",
    "wallLights11.png",
    "wallLights12.png",
    "wallLights13.png",
    "wallLights14.png",
    "wallLights15.png",
    "wallLights16.png",
    "wallLights17.png",
    "wallLights18.png",
    "wallLights19.png",
    "wallLights2.png",
    "wallLights20.png",
    "wallLights21.png",
    "wallLights22.png",
    "wallLights3.png",
    "wallLights4.png",
    "wallLights5.png",
    "wallLights6.png",
    "wallLights7.png",
    "wallLights8.png",
    "wallLights9.png",
    "wow1.jpg",
    "yellow.jpg",
  ]);

  function formatWithCommas(value) {
    const s = String(value);
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Shared helper for consistent KES formatting across pages.
  window.formatKES = function formatKES(value) {
    return "KES " + formatWithCommas(value);
  };

  function parseLightsFromHtml(html) {
    // NOTE: `collection.html.backup` contains a few commented-out objects (`//{id: ... }`).
    // We exclude those by using a negative lookbehind for `//` right before `{id:`.
    // We also avoid requiring `}` immediately after the `image` field since other fields follow it.
    const map = Object.create(null);

    function fillFromRegex(regex) {
      let m;
      while ((m = regex.exec(html)) !== null) {
        const image = m[5];
        if (!map[image]) {
          map[image] = { name: m[2], price: Number(m[4]) };
        }
      }
    }

    // Primary: excludes commented-out objects.
    const reWithLookbehind =
      /(?<!\/\/)\{id:\s*(\d+),\s*name:\s*"([^"]*)"\s*,\s*category:\s*"([^"]*)"\s*,\s*price:\s*([0-9]+)\s*,[\s\S]*?\bimage:\s*"([^"]+)"/g;
    fillFromRegex(reWithLookbehind);

    // Fallback: in case lookbehind isn't supported, try a looser regex.
    if (Object.keys(map).length === 0) {
      const reFallback =
        /\{id:\s*(\d+),\s*name:\s*"([^"]*)"\s*,\s*category:\s*"([^"]*)"\s*,\s*price:\s*([0-9]+)\s*,[\s\S]*?\bimage:\s*"([^"]+)"/g;
      fillFromRegex(reFallback);
    }

    return map;
  }

  function classifyLight(light) {
    const name = String(light.name || "").toLowerCase();
    const img = String(light.image || "").toLowerCase();
    const cat = String(light.category || "").toLowerCase();

    // Prefer the dataset category when it is clear.
    if (cat === "chandelier") return "chandeliers";
    if (cat === "outdoor") return "outdoor";

    if (img.startsWith("roomm2") || img.startsWith("roomm3") || name.includes("bedroom")) {
      return "bedroom";
    }

    if (
      name.includes("dining") ||
      name.includes("dinning") ||
      img === "round2.jpg" ||
      img === "dinning.png"
    ) {
      return "dining";
    }

    if (name.includes("pendant") || img.startsWith("number") || img === "roomm1.png") {
      return "pendant";
    }

    if (img.startsWith("ceilinglightss") || img.startsWith("ceiling") || name.includes("ceiling")) {
      return "ceiling";
    }

    if (img.startsWith("walllights") || img === "super1.jpg" || img === "number2.png" || name.includes("wall")) {
      return "wall";
    }

    return "chandeliers";
  }

  function parseLightsCatalogFromHtml(html) {
    const lights = [];
    // Looser regex + comment-exclusion using match index.
    const re =
      /\{id:\s*(\d+),\s*name:\s*"([^"]*)"\s*,\s*category:\s*"([^"]*)"\s*,\s*price:\s*([0-9]+)\s*,[\s\S]*?\bimage:\s*"([^"]+)"?/g;

    let m;
    while ((m = re.exec(html)) !== null) {
      const start = m.index;
      // Skip commented-out objects.
      if (start >= 2 && html.slice(start - 2, start) === "//") continue;

      // Skip missing images (prevents broken images in the UI).
      if (!EXISTING_IMAGES.has(m[5])) continue;

      lights.push({
        id: Number(m[1]),
        name: m[2],
        category: m[3],
        price: Number(m[4]),
        image: m[5],
      });
    }

    if (!lights.length) return lights;

    return lights.map((l) => ({ ...l, label: classifyLight(l) }));
  }

  async function ensureCatalogLoaded() {
    if (cachedMap && cachedCatalog) return;
    if (cachedLoadPromise) return cachedLoadPromise;

    cachedLoadPromise = (async () => {
      const res = await fetch("/collection.html.backup", { cache: "no-store" });
      const html = await res.text();
      cachedMap = parseLightsFromHtml(html);
      cachedCatalog = parseLightsCatalogFromHtml(html);
    })();

    return cachedLoadPromise;
  }

  async function loadCatalogMap() {
    await ensureCatalogLoaded();
    return cachedMap;
  }

  // New: returns a labeled catalog array used to render many products per category.
  window.loadLightsCatalog = async function loadLightsCatalog() {
    await ensureCatalogLoaded();
    return cachedCatalog || [];
  };

  window.applyCatalogPricesToPage = async function applyCatalogPricesToPage() {
    const cards = Array.from(document.querySelectorAll(".product-card"));
    if (!cards.length) return;

    let map = null;
    try {
      map = await loadCatalogMap();
    } catch (e) {
      // If fetch fails, keep the page as-is.
      return;
    }

    for (const card of cards) {
      const img = card.querySelector("img");
      const h3 = card.querySelector("h3");
      const priceEl = card.querySelector(".product-price");
      const wa = card.querySelector("a.btn-whatsapp");

      const src = img ? img.getAttribute("src") || "" : "";
      const file = src.split("/").pop();
      const data = map[file];

      if (!data) {
        // Hide items that don't exist in the original catalog to prevent wrong prices.
        card.style.display = "none";
        continue;
      }

      if (h3) h3.textContent = data.name;
      const formatWithCommas = (value) => {
        const s = String(value);
        return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };
      const priceText = "KES " + formatWithCommas(data.price);
      if (priceEl) priceEl.textContent = priceText;

      if (img) img.alt = data.name + " — Spark Lights 254 Nairobi";

      if (wa) {
        const message = "Hi Spark Lights 254! I want to order " + data.name + " at " + priceText + ".";
        wa.href =
          "https://wa.me/254712827840?text=" + encodeURIComponent(message);
      }
    }
  };
})();

