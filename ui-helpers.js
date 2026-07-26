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
