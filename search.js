// Powers the search icon in the nav bar: toggles a small dropdown with a
// live-filtered list of matching articles. Shared by index.html,
// category.html and article.html.
(function () {
  const toggle = document.getElementById("nav-search-toggle");
  const box = document.getElementById("nav-search-box");
  const input = document.getElementById("nav-search-input");
  const results = document.getElementById("nav-search-results");
  if (!toggle || !box || !input || !results) return;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openBox() {
    box.hidden = false;
    input.focus();
  }

  function closeBox() {
    box.hidden = true;
    input.value = "";
    results.innerHTML = "";
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    if (box.hidden) openBox(); else closeBox();
  });

  box.addEventListener("click", function (e) { e.stopPropagation(); });

  document.addEventListener("click", function (e) {
    if (!box.hidden && !box.contains(e.target) && e.target !== toggle) closeBox();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeBox();
  });

  input.addEventListener("input", function () {
    const q = input.value.trim().toLowerCase();

    if (!q || typeof ARTICLES === "undefined") {
      results.innerHTML = "";
      return;
    }

    const matches = ARTICLES.filter(function (a) {
      return (a.headline || "").toLowerCase().includes(q) ||
             (a.dek || "").toLowerCase().includes(q);
    }).slice(0, 6);

    if (matches.length === 0) {
      results.innerHTML = '<p class="nav-search-empty">No matching articles.</p>';
      return;
    }

    results.innerHTML = matches.map(function (a) {
      return `<a class="nav-search-result" href="article.html?slug=${encodeURIComponent(a.slug)}">` +
        `<span class="nav-search-result-cat">${escapeHtml(a.category)}</span>` +
        `<span class="nav-search-result-title">${escapeHtml(a.headline)}</span>` +
        `</a>`;
    }).join("");
  });
})();
