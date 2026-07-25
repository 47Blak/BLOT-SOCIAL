document.getElementById("footer-year").textContent = new Date().getFullYear();

const todayEl = document.getElementById("today-date");
if (todayEl) {
  todayEl.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}

function articleHref(slug) {
  return `article.html?slug=${encodeURIComponent(slug)}`;
}

function cardHtml(a) {
  return `
    <div class="card">
      <div class="eyebrow">${a.category}</div>
      <h3><a href="${articleHref(a.slug)}">${a.headline}</a></h3>
      <p class="dek">${a.dek}</p>
      <div class="byline">${a.author} · ${a.date}</div>
    </div>
  `;
}

function renderHero() {
  const el = document.getElementById("hero-article");
  if (!el) return;
  const article = ARTICLES.find(a => a.hero);
  if (!article) return;

  el.textContent = "";

  const html = `
    <div class="eyebrow">${article.category}</div>
    <h2><a href="${articleHref(article.slug)}">${article.headline}</a></h2>
    <p class="dek">${article.dek}</p>
    <div class="byline">By ${article.author} · ${article.date}</div>
  `;
  el.insertAdjacentHTML("beforeend", html);
}

// Eligible articles (not hero, not brief) are split into two separate,
// non-overlapping pools so "Latest Post" and "Across the Desk" never show
// the same article as each other, no matter how far either is paginated.
// Latest Post gets a small, FIXED-size pool (not a 50/50 split) so that
// Across the Desk always keeps the rest of the articles for its own
// 12-per-page pagination as the site grows.
function getEligibleArticles() {
  return ARTICLES.filter(a => !a.hero && !a.brief);
}

const LATEST_POST_POOL_SIZE = 4;

// "Latest Post" pages through its own pool (the first LATEST_POST_POOL_SIZE
// eligible articles) 2 at a time, with its own Read More / Newer Posts controls.
const LATEST_POST_PAGE_SIZE = 2;
let latestPostPage = 0;

function getLatestPostItems() {
  return getEligibleArticles().slice(0, LATEST_POST_POOL_SIZE);
}

function renderLatestPost() {
  const el = document.getElementById("also-morning");
  const readMoreBtn = document.getElementById("latest-post-more");
  const newerBtn = document.getElementById("latest-post-newer");
  if (!el) return;

  const all = getLatestPostItems();
  const start = latestPostPage * LATEST_POST_PAGE_SIZE;
  const items = all.slice(start, start + LATEST_POST_PAGE_SIZE);

  el.textContent = "";
  items.forEach(a => el.insertAdjacentHTML("beforeend", cardHtml(a)));

  const hasMore = start + LATEST_POST_PAGE_SIZE < all.length;
  const hasNewer = latestPostPage > 0;

  if (readMoreBtn) readMoreBtn.style.display = hasMore ? "" : "none";
  if (newerBtn) newerBtn.style.display = hasNewer ? "" : "none";
}

// "Across the Desk" pages through its own pool (everything NOT in the
// Latest Post pool) 12 at a time. "Read More" moves to the next page
// (older posts) and the previous 12 disappear; "Newer Posts" moves back.
// Nothing is ever appended/accumulated.
const ACROSS_DESK_PAGE_SIZE = 12;
let acrossDeskPage = 0;

function getAcrossDeskItems() {
  return getEligibleArticles().slice(LATEST_POST_POOL_SIZE);
}

function renderAcrossTheDesk() {
  const el = document.getElementById("across-desk");
  const readMoreBtn = document.getElementById("across-desk-more");
  const newerBtn = document.getElementById("across-desk-newer");
  if (!el) return;

  const all = getAcrossDeskItems();
  const start = acrossDeskPage * ACROSS_DESK_PAGE_SIZE;
  const items = all.slice(start, start + ACROSS_DESK_PAGE_SIZE);

  el.textContent = "";
  items.forEach(a => el.insertAdjacentHTML("beforeend", cardHtml(a)));

  const hasMore = start + ACROSS_DESK_PAGE_SIZE < all.length;
  const hasNewer = acrossDeskPage > 0;

  if (readMoreBtn) readMoreBtn.style.display = hasMore ? "" : "none";
  if (newerBtn) newerBtn.style.display = hasNewer ? "" : "none";
}

function renderInBrief() {
  const el = document.getElementById("in-brief");
  if (!el) return;
  const items = ARTICLES.filter(a => a.brief);

  el.textContent = "";

  items.forEach(a => {
    const html = `
      <li>
        <a href="${articleHref(a.slug)}">${a.headline}</a>
        <span class="byline">${a.date}</span>
      </li>
    `;
    el.insertAdjacentHTML("beforeend", html);
  });
}

renderHero();
renderLatestPost();
renderAcrossTheDesk();
renderInBrief();

const acrossDeskMoreBtn = document.getElementById("across-desk-more");
if (acrossDeskMoreBtn) {
  acrossDeskMoreBtn.addEventListener("click", () => {
    acrossDeskPage += 1;
    renderAcrossTheDesk();
    document.getElementById("across-desk").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const acrossDeskNewerBtn = document.getElementById("across-desk-newer");
if (acrossDeskNewerBtn) {
  acrossDeskNewerBtn.addEventListener("click", () => {
    acrossDeskPage = Math.max(0, acrossDeskPage - 1);
    renderAcrossTheDesk();
    document.getElementById("across-desk").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const latestPostMoreBtn = document.getElementById("latest-post-more");
if (latestPostMoreBtn) {
  latestPostMoreBtn.addEventListener("click", () => {
    latestPostPage += 1;
    renderLatestPost();
    document.getElementById("also-morning").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const latestPostNewerBtn = document.getElementById("latest-post-newer");
if (latestPostNewerBtn) {
  latestPostNewerBtn.addEventListener("click", () => {
    latestPostPage = Math.max(0, latestPostPage - 1);
    renderLatestPost();
    document.getElementById("also-morning").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
