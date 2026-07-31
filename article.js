// Turns a normal YouTube/YouTube Music watch link into just the video ID.
function youtubeIdFromUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "").split("/")[0] || "";
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch (e) {
    return "";
  }
}

// Audiomack/Spotify embeds mirror the normal page URL with "/embed"
// inserted right after the domain.
function audiomackEmbedUrl(url) {
  try {
    const u = new URL(url);
    return `https://audiomack.com/embed${u.pathname}`;
  } catch (e) {
    return "";
  }
}
function spotifyEmbedUrl(url) {
  try {
    const u = new URL(url);
    return `https://open.spotify.com/embed${u.pathname}`;
  } catch (e) {
    return "";
  }
}
// Apple Music embeds live on a separate "embed." subdomain.
function appleMusicEmbedUrl(url) {
  try {
    const u = new URL(url);
    return `https://embed.music.apple.com${u.pathname}${u.search}`;
  } catch (e) {
    return "";
  }
}

// Renders only the platforms that actually have a link set on this
// article. If none are set, returns "" (nothing shows at all).
function mediaEmbedsHtml(article) {
  const blocks = [];

  if (article.audiomack) {
    const src = audiomackEmbedUrl(article.audiomack);
    if (src) blocks.push(`
      <div class="media-embed">
        <p class="media-embed-label">Listen on Audiomack</p>
        <iframe src="${src}" height="252" allow="autoplay; clipboard-write" loading="lazy"></iframe>
      </div>
    `);
  }

  if (article.spotify) {
    const src = spotifyEmbedUrl(article.spotify);
    if (src) blocks.push(`
      <div class="media-embed">
        <p class="media-embed-label">Listen on Spotify</p>
        <iframe src="${src}" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
      </div>
    `);
  }

  if (article.appleMusic) {
    const src = appleMusicEmbedUrl(article.appleMusic);
    if (src) blocks.push(`
      <div class="media-embed">
        <p class="media-embed-label">Listen on Apple Music</p>
        <iframe src="${src}" height="175" allow="autoplay *; encrypted-media *;" loading="lazy"></iframe>
      </div>
    `);
  }

  if (article.youtubeMusic) {
    const id = youtubeIdFromUrl(article.youtubeMusic);
    if (id) blocks.push(`
      <div class="media-embed">
        <p class="media-embed-label">Listen on YouTube Music</p>
        <iframe src="https://www.youtube.com/embed/${id}" height="152" allow="autoplay; encrypted-media" loading="lazy"></iframe>
      </div>
    `);
  }

  if (article.youtubeVideo) {
    const id = youtubeIdFromUrl(article.youtubeVideo);
    if (id) blocks.push(`
      <div class="media-embed">
        <p class="media-embed-label">Watch on YouTube</p>
        <iframe src="https://www.youtube.com/embed/${id}" height="315" allow="autoplay; encrypted-media; fullscreen" loading="lazy"></iframe>
      </div>
    `);
  }

  if (blocks.length === 0) return "";
  return `<div class="media-embeds">${blocks.join("")}</div>`;
}

// Renders the Artist/Featuring/Producer/etc bullet list — only for Music
// category articles, and only the individual fields that are actually
// filled in show up.
function musicMetaHtml(article) {
  if (article.category !== "Music") return "";
  const fields = [
    ["Artist", article.artist],
    ["Featuring", article.featuring],
    ["Producer", article.producer],
    ["Category", article.musicCategory],
    ["Genre", article.genre],
    ["Released", article.released],
    ["Duration", article.duration]
  ].filter(([, value]) => value);

  if (fields.length === 0) return "";

  return `<ul class="music-meta">${fields.map(([label, value]) =>
    `<li><span class="music-meta-label">${label}</span><span class="music-meta-value">${value}</span></li>`
  ).join("")}</ul>`;
}

// Renders the selectable tag pills at the bottom of the article — only
// if the article has one or more tags set.
function tagsHtml(article) {
  if (!Array.isArray(article.tags) || article.tags.length === 0) return "";
  return `<div class="article-tags">${article.tags.map(t =>
    `<a class="article-tag" href="category.html?cat=${encodeURIComponent(t)}">${t}</a>`
  ).join("")}</div>`;
}

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
    const adCardHtml = (ad) => (!ad || (!ad.title && !ad.image)) ? "" : `
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
    const ads = typeof ADS !== "undefined" ? ADS : {};

    const bodyHtml = article.body.map((p, i) => {
      let ad = "";
      if (i === 2) {
        ad = adCardHtml(ads.articleAd1);
      } else if (i === 4) {
        ad = adCardHtml(ads.articleAd2);
      }
      return `${ad}<p>${p}</p>`;
    }).join("");

    root.innerHTML = `
      <a class="back-link" href="category.html?cat=${encodeURIComponent(article.category)}">&larr; Back to ${article.category}</a>
      <div class="eyebrow">${eyebrowHtml(article.category)}</div>
      <h1>${article.headline}</h1>
      ${article.dek ? `<p class="dek">${article.dek}</p>` : ""}
      <div class="byline">${bylineHtml(article.author, article.date, true)}</div>
      ${article.image ? `<div class="article-image-wrap"><img class="article-image" src="${article.image}" alt="${article.headline}"></div>` : ""}
      ${musicMetaHtml(article)}
      ${bodyHtml}
      ${mediaEmbedsHtml(article)}
      ${tagsHtml(article)}
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
