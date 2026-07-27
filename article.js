try {
  const footerYearEl = document.getElementById("footer-year");
  if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();

  const todayEl = document.getElementById("today-date");
  if (todayEl) {
    todayEl.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }

  const root = document.getElementById("article-root");

  // If articles.js failed to load (network error, wrong path, blocked
  // request, stale cache, etc.) getArticleBySlug won't exist. Fail loudly
  // with a helpful message instead of leaving the page stuck on
  // "Loading article...".
  if (typeof getArticleBySlug !== "function") {
    throw new Error("articles.js did not load — getArticleBySlug is undefined");
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const article = slug ? getArticleBySlug(slug) : null;

  if (!article) {
    root.innerHTML = `
      <a class="back-link" href="index.html">&larr; Back to Home Page</a>
      <h1>Article not found</h1>
      <p>We couldn't find the article you were looking for.</p>
    `;
  } else {
    document.title = `${article.headline} on BLOT SOCIAL`;
    root.innerHTML = `
      <a class="back-link" href="category.html?cat=${encodeURIComponent(article.category)}">&larr; Back to ${article.category}</a>
      <div class="eyebrow">${eyebrowHtml(article.category)}</div>
      <h1>${article.headline}</h1>
      ${article.dek ? `<p class="dek">${article.dek}</p>` : ""}
      <div class="byline">${bylineHtml(article.author, article.date, true)}</div>
      ${article.image ? `<div class="article-image-wrap"><img class="article-image" src="${article.image}" alt="${article.headline}"></div>` : ""}
      ${article.body.map(p => `<p>${p}</p>`).join("")}
    `;
  }
} catch (err) {
  console.error("BLOT SOCIAL article page error:", err);
  const root = document.getElementById("article-root");
  if (root) {
    root.innerHTML = `
      <a class="back-link" href="index.html">&larr; Back to Home Page</a>
      <h1>Something went wrong loading this article</h1>
      <p>Please refresh the page. If this keeps happening, the site's script files may not have loaded correctly.</p>
    `;
  }
}
