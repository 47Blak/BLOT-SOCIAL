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

// Renders one ad-card from an ADS entry into the given container. If the
// slot has no data (or ADS itself failed to load), the container is just
// left empty rather than showing a broken ad.
function renderAdSlot(containerId, ad) {
  const el = document.getElementById(containerId);
  if (!el || !ad) return;
  el.innerHTML = `
    <div class="ad-card">
      <a href="${ad.link || "#"}" target="_blank" rel="sponsored noopener" class="ad-link">
        <img src="${ad.image || ""}" alt="Advertisement" class="ad-image">
        <div class="ad-content">
          <span class="ad-tag">${ad.tag || "Ad"}</span>
          <h3 class="ad-title">${ad.title || ""}</h3>
          <p class="ad-description">${ad.description || ""}</p>
          <span class="ad-cta">${ad.cta || ""} &rarr;</span>
        </div>
      </a>
    </div>
  `;
}

function cardHtml(a) {
  const media = a.image ? `<div class="card-media"><img src="${a.image}" alt="" loading="lazy"></div>` : "";
  return `
    <div class="card">
      <div class="eyebrow">${eyebrowHtml(a.category)}</div>
      <div class="card-top">
        ${media}
        <h3><a href="${articleHref(a.slug)}">${a.headline}</a></h3>
      </div>
      <p class="dek">${a.dek}</p>
      <div class="byline">${bylineHtml(a.author, a.date, false)}</div>
    </div>
  `;
}

function renderHero() {
  const el = document.getElementById("hero-article");
  if (!el) return;
  const article = ARTICLES.find(a => a.hero);
  if (!article) return;

  el.textContent = "";

  const media = article.image ? `<div class="hero-media"><img src="${article.image}" alt=""></div>` : "";
  const html = `
    <div class="eyebrow">${eyebrowHtml(article.category)}</div>
    <div class="hero-top">
      ${media}
      <h2><a href="${articleHref(article.slug)}">${article.headline}</a></h2>
    </div>
    <p class="dek">${article.dek}</p>
    <div class="byline">${bylineHtml(article.author, article.date, true)}</div>
  `;
  el.insertAdjacentHTML("beforeend", html);
}

// "Latest Post" and "Across the Desk" are fully independent sections now —
// each article is explicitly tagged (via the "desk" flag in articles.js)
// as belonging to one or the other, so there's no shared cutoff/count for
// them to compete over. Both are unlimited: each pages through however
// many articles carry its own flag, and the two pools can never overlap
// because an article can't be both "desk" and "not desk" at once.
function getLatestPostPool() {
  return ARTICLES.filter(a => !a.hero && !a.brief && !a.desk);
}

function getAcrossDeskPool() {
  return ARTICLES.filter(a => !a.hero && !a.brief && a.desk);
}

// "Latest Post" pages through its own pool, unlimited, four at a time
// (two-up, two-down on desktop), with its own Read More / Newer Posts
// controls.
const LATEST_POST_PAGE_SIZE = 4;
let latestPostPage = 0;

function getLatestPostItems() {
  return getLatestPostPool();
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

// "Across the Desk" pages through its own pool, unlimited, 12 at a time.
// "Read More" moves to the next page (older posts) and the previous 12
// disappear; "Newer Posts" moves back. Nothing is ever appended/accumulated.
const ACROSS_DESK_PAGE_SIZE = 12;
let acrossDeskPage = 0;

function getAcrossDeskItems() {
  return getAcrossDeskPool();
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

if (typeof ADS !== "undefined") {
  renderAdSlot("ad-latest-post", ADS.latestPost);
  renderAdSlot("ad-across-desk", ADS.acrossDesk);
  renderAdSlot("ad-in-brief", ADS.inBrief);
}

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
