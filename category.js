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

const params = new URLSearchParams(window.location.search);
const cat = params.get("cat") || "World";

document.title = `${cat} on BLOT SOCIAL`;
document.getElementById("category-title").textContent = cat;

// highlight active nav link
document.querySelectorAll("#main-nav a").forEach(a => {
  if (a.href.includes(`cat=${encodeURIComponent(cat)}`)) a.classList.add("active");
});

const allItems = getArticlesByCategory(cat);
const listEl = document.getElementById("category-list");
const moreBtn = document.getElementById("category-more");

const CATEGORY_BATCH = 6;
let visibleCount = CATEGORY_BATCH;

function cardHtml(a) {
  const media = a.image ? `<div class="card-media"><img src="${a.image}" alt="" loading="lazy"></div>` : "";
  return `
    <div class="card">
      <div class="eyebrow">${eyebrowHtml(a.category)}</div>
      <div class="card-top">
        ${media}
        <h3><a href="${articleHref(a.slug)}">${a.headline}</a></h3>
      </div>
      ${a.dek ? `<p class="dek">${a.dek}</p>` : ""}
      <div class="byline">${bylineHtml(a.author, a.date, false)}</div>
    </div>
  `;
}

function renderCategoryList() {
  if (allItems.length === 0) {
    listEl.innerHTML = `<p>No stories in this section yet.</p>`;
    if (moreBtn) moreBtn.style.display = "none";
    return;
  }

  const items = allItems.slice(0, visibleCount);
  listEl.innerHTML = items.map(cardHtml).join("");

  if (moreBtn) {
    moreBtn.style.display = visibleCount >= allItems.length ? "none" : "";
  }
}

renderCategoryList();

if (moreBtn) {
  moreBtn.addEventListener("click", () => {
    visibleCount += CATEGORY_BATCH;
    renderCategoryList();
  });
}
