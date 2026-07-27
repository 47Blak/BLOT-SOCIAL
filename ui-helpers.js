// Small shared helpers for rendering the "Trending" flame icon on eyebrows
// and the contact icon on bylines. Included on every page, right after
// articles.js, so main.js / category.js / article.js can all call these.

function iconFlame() {
  return '<svg class="icon icon-flame" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12.5 2c.3 1.8-.4 3-1.5 4.2C9.6 7.7 8 9.3 8 12a4 4 0 0 0 8 0c0-.9-.3-1.5-.7-2.1.1.9-.3 1.6-1 1.9.7-1.7-.4-2.9-.7-4.3-.2-1.1 0-2.4-1.1-3.5-1 1.4-1.7 2.6-1.7 3.9 0 .9.4 1.5.9 2-.9-.2-1.6-1-1.6-2.1 0-1.7 1.1-2.8 2.4-4.3z"/>' +
  '</svg>';
}

function iconContact() {
  return '<svg class="icon icon-contact" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.6-5-8-5z"/>' +
  '</svg>';
}

// Renders the small category label above a headline. When the category is
// "Trending" a flame icon is shown in front of it.
function eyebrowHtml(category) {
  const cat = category || "";
  const isTrending = cat.toLowerCase() === "trending";
  return (isTrending ? iconFlame() : "") + cat;
}

// Renders "<icon> [By ]Author · Date" — used for hero/article bylines
// (withBy = true) and grid-card bylines (withBy = false, no "By" prefix).
function bylineHtml(author, date, withBy) {
  const parts = [];
  if (author) {
    parts.push(iconContact() + (withBy ? "By " : "") + author);
  }
  if (author && date) {
    parts.push(" · ");
  }
  if (date) {
    parts.push(date);
  }
  return parts.join("");
}

// The 3D navy/orange corner accent (from the supplied reference markup).
// Sits absolutely positioned in the bottom-right corner of a card or image
// wrapper; the parent's `overflow: hidden` + `border-radius` clips it to
// match that container's rounded corner exactly. Gradient/filter ids are
// namespaced per call so multiple cards on one page don't collide.
let __cornerGraphicUid = 0;
function cornerGraphicSvg() {
  const uid = "cg" + (__cornerGraphicUid++);
  return `<svg class="corner-graphic" viewBox="0 0 230 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="blue3DGrad-${uid}" x1="50" y1="280" x2="230" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0066d6" />
        <stop offset="50%" stop-color="#004397" />
        <stop offset="100%" stop-color="#001d4a" />
      </linearGradient>
      <linearGradient id="orange3DGrad-${uid}" x1="20" y1="280" x2="230" y2="110" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ff9d1c" />
        <stop offset="60%" stop-color="#f77d00" />
        <stop offset="100%" stop-color="#d95b00" />
      </linearGradient>
      <filter id="layerShadow-${uid}" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="-2" dy="-3" stdDeviation="4" flood-color="#000000" flood-opacity="0.35" />
      </filter>
      <filter id="orangeShadow-${uid}" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="-1" dy="-2" stdDeviation="3" flood-color="#f77d00" flood-opacity="0.25" />
      </filter>
    </defs>
    <path d="M 60 280 C 110 270, 195 190, 228 110 L 230 110 L 230 280 Z" fill="url(#orange3DGrad-${uid})" filter="url(#orangeShadow-${uid})" />
    <path d="M 15 280 C 105 270, 180 220, 230 170 L 230 280 Z" fill="url(#blue3DGrad-${uid})" filter="url(#layerShadow-${uid})" />
    <path d="M 15 280 C 105 270, 180 220, 230 170" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" fill="none" />
  </svg>`;
}
