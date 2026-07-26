// Renders the scrolling "Breaking" bar under the nav using BREAKING_NEWS
// from articles.js. Shared by index.html, category.html and article.html.
(function () {
  const bar = document.getElementById("breaking-bar");
  const track = document.getElementById("breaking-track");
  if (!bar || !track) return;

  const source = (typeof BREAKING_NEWS !== "undefined" && Array.isArray(BREAKING_NEWS))
    ? BREAKING_NEWS
    : [];

  const items = source
    .filter(function (b) { return b && String(b.text || "").trim(); })
    .slice(0, 5);

  if (items.length === 0) return;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function itemHtml(b) {
    const text = escapeHtml(b.text);
    const link = (b.link || "").trim();
    if (!link) return `<span class="breaking-item">${text}</span>`;
    const href = /^https?:\/\//i.test(link)
      ? link
      : `article.html?slug=${encodeURIComponent(link)}`;
    return `<a class="breaking-item" href="${href}">${text}</a>`;
  }

  const sep = '<span class="breaking-sep">&bull;</span>';
  const row = items.map(itemHtml).join(sep);

  // Content is duplicated back-to-back so the CSS animation (which slides
  // exactly 50% of the track's width) loops with no visible seam.
  track.innerHTML = row + sep + row + sep;

  bar.style.display = "flex";
})();
