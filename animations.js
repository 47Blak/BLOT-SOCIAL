/* BLOT SOCIAL — motion layer
   Standalone, additive script. Does not modify any existing script, data,
   or markup produced by articles.js / main.js / category.js / article.js /
   ui-helpers.js / breaking.js — it only observes/decorates the DOM they
   build, after they've built it. Never touches .masthead-logo or
   .masthead-tagline, and never sets any font-family. */
(function () {
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Scroll progress bar ------------------------------------------------ */
  function initProgressBar() {
    var bar = document.getElementById('bs-scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'bs-scroll-progress';
      document.body.appendChild(bar);
    }
    function update() {
      var doc = document.documentElement;
      var scrollTop = window.pageYOffset || doc.scrollTop;
      var height = doc.scrollHeight - doc.clientHeight;
      var pct = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = pct + '%';
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---- Preloader: hide once this script runs ------------------------------ */
  function hidePreloader() {
    var el = document.getElementById('bs-preloader');
    if (!el) return;
    setTimeout(function () {
      el.classList.add('bs-preloader-hide');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 450);
    }, 150);
  }

  /* ---- Repeating typewriter: dek/subheadings (tail only) + article body
     paragraphs (full). Types in every time the element scrolls into view,
     clears back out every time it scrolls out — in either direction. ----- */
  var twObserver = null;

  function typeIn(el) {
    var full = el.dataset.twOriginal;
    if (!full || !full.trim()) return;
    var token = String(Date.now() + Math.random());
    el.dataset.twToken = token;

    var isDek = el.classList.contains('dek');
    var headText = '';
    var animText = full;
    if (isDek) {
      var tailLen = Math.min(30, Math.max(8, Math.floor(full.length * 0.3)));
      headText = full.slice(0, full.length - tailLen);
      animText = full.slice(full.length - tailLen);
    }

    el.textContent = '';
    if (headText) el.appendChild(document.createTextNode(headText));
    var node = document.createTextNode('');
    var cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.textContent = '\u258C';
    el.appendChild(node);
    el.appendChild(cursor);

    var i = 0;
    var speed = Math.max(4, Math.min(20, 1400 / Math.max(animText.length, 1)));
    (function step() {
      if (el.dataset.twToken !== token) return; // superseded by a scroll-out or re-entry
      if (i <= animText.length) {
        node.nodeValue = animText.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        setTimeout(function () {
          if (el.dataset.twToken === token && cursor.parentNode) {
            cursor.parentNode.removeChild(cursor);
          }
        }, 900);
      }
    })();
  }

  function typeOut(el) {
    el.dataset.twToken = String(Date.now() + Math.random()); // invalidates any running typeIn
    el.textContent = '';
  }

  function ensureTypewriterObserver() {
    if (reduceMotion || !('IntersectionObserver' in window)) return null;
    if (!twObserver) {
      twObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            typeIn(entry.target);
          } else {
            typeOut(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
    }
    return twObserver;
  }

  function scanTypewriterTargets() {
    var targets = document.querySelectorAll('.dek, #article-root p:not([class])');
    var obs = ensureTypewriterObserver();
    targets.forEach(function (el) {
      if (el.dataset.twObserved === '1') return;
      el.dataset.twObserved = '1';
      el.dataset.twOriginal = el.textContent;
      if (obs) {
        obs.observe(el);
      }
      // reduceMotion / no IO support: leave text exactly as rendered
    });
  }

  /* ---- Scroll-reveal fade for card/hero/section containers --------------- */
  var revealObserver = null;

  function ensureRevealObserver() {
    if (reduceMotion || !('IntersectionObserver' in window)) return null;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    }
    return revealObserver;
  }

  function scanRevealTargets() {
    var nodes = document.querySelectorAll('.section-block, .hero, .card, .brief-list li');
    var obs = ensureRevealObserver();
    nodes.forEach(function (el) {
      el.classList.add('reveal-up');
      if (el.dataset.revealObserved === '1') return;
      el.dataset.revealObserved = '1';
      if (obs) {
        obs.observe(el);
      } else {
        el.classList.add('is-visible');
      }
    });
  }

  /* ---- Shine overlay: injects the .shine div into every post, hover plays
     it via CSS; a click also replays it (retriggerable, not one-shot). --- */
  function injectShineOverlays() {
    var targets = document.querySelectorAll('.card, .hero');
    targets.forEach(function (el) {
      if (el.dataset.shineInit === '1') return;
      el.dataset.shineInit = '1';
      el.classList.add('shine-overlay');
      var shine = document.createElement('div');
      shine.className = 'shine';
      el.appendChild(shine);
    });
  }

  function triggerShine(container) {
    if (!container || reduceMotion) return;
    container.classList.remove('shine-active');
    void container.offsetWidth; // force reflow so the animation can restart
    container.classList.add('shine-active');
    setTimeout(function () {
      container.classList.remove('shine-active');
    }, 800);
  }

  /* ---- Share row: injected on the article page, right after the tags
     block that article.js renders (or at the end of the article body if a
     given article has no tags). Never edits article.js/articles.js. ----- */
  function injectShareButtons() {
    var root = document.getElementById('article-root');
    if (!root || root.dataset.shareInit === '1') return;
    var h1 = root.querySelector('h1');
    if (!h1) return; // not-found / error state — nothing to share
    root.dataset.shareInit = '1';

    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);

    var icons = {
      Facebook: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>',
      WhatsApp: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.6.3.7.9 2.2 1 2.4.1.2.2.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.5-.6.6-.2.2-.4.4-.2.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.8 1.8.3.2.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.8.9 2.1 1 .3.2.5.2.6.3.1.2.1.9-.1 1.6z"/></svg>',
      Telegram: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21.9 4.3 18.6 20c-.2 1-.9 1.2-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5L20.6 3c.8-.3 1.6.2 1.3 1.3z"/></svg>',
      Twitter: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.9 2H22l-7.2 8.2L23.3 22H16l-5.2-6.8L4.8 22H1.6l7.7-8.8L1 2h7.4l4.7 6.3L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z"/></svg>',
      Instagram: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.5.5.7.3 1.3.6 1.9 1.2.6.6 1 1.2 1.2 1.9.3.7.5 1.4.5 2.5.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1.1-.2 1.8-.5 2.5-.3.7-.6 1.3-1.2 1.9-.6.6-1.2 1-1.9 1.2-.7.3-1.4.5-2.5.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.5-.5-.7-.3-1.3-.6-1.9-1.2-.6-.6-1-1.2-1.2-1.9-.3-.7-.5-1.4-.5-2.5C2 15.1 2 14.7 2 12s0-3.1.1-4.1c0-1.1.2-1.8.5-2.5.3-.7.6-1.3 1.2-1.9.6-.6 1.2-1 1.9-1.2.7-.3 1.4-.5 2.5-.5C8.9 2 9.3 2 12 2zm0 1.8c-2.6 0-3 0-4 .1-.9 0-1.4.2-1.7.3-.4.2-.7.3-1 .6-.3.3-.5.6-.6 1-.1.3-.3.8-.3 1.7-.1 1-.1 1.4-.1 4s0 3 .1 4c0 .9.2 1.4.3 1.7.2.4.3.7.6 1 .3.3.6.5 1 .6.3.1.8.3 1.7.3 1 .1 1.4.1 4 .1s3 0 4-.1c.9 0 1.4-.2 1.7-.3.4-.2.7-.3 1-.6.3-.3.5-.6.6-1 .1-.3.3-.8.3-1.7.1-1 .1-1.4.1-4s0-3-.1-4c0-.9-.2-1.4-.3-1.7-.2-.4-.3-.7-.6-1-.3-.3-.6-.5-1-.6-.3-.1-.8-.3-1.7-.3-1-.1-1.4-.1-4-.1zm0 3a5.2 5.2 0 1 1 0 10.4A5.2 5.2 0 0 1 12 6.8zm0 1.8a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8zm5.4-2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>'
    };

    var platforms = [
      { name: 'Facebook', color: '#1877F2', href: 'https://www.facebook.com/sharer/sharer.php?u=' + url },
      { name: 'WhatsApp', color: '#25D366', href: 'https://wa.me/?text=' + title + '%20' + url },
      { name: 'Telegram', color: '#26A5E4', href: 'https://t.me/share/url?url=' + url + '&text=' + title },
      { name: 'Instagram', color: '#E1306C', href: '#' },
      { name: 'Twitter', color: '#000000', href: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title }
    ];

    var wrap = document.createElement('div');
    wrap.className = 'bs-share-row';
    var label = document.createElement('span');
    label.className = 'bs-share-label';
    label.textContent = 'Share this story';
    wrap.appendChild(label);

    platforms.forEach(function (p) {
      var a = document.createElement('a');
      a.className = 'bs-share-btn';
      a.style.setProperty('--share-color', p.color);
      a.title = 'Share on ' + p.name;
      a.innerHTML = icons[p.name];

      if (p.name === 'Instagram') {
        // Instagram has no public web share-intent URL for an arbitrary
        // link, so the practical equivalent is: copy the link for pasting
        // into an Instagram post/story/DM.
        a.href = '#';
        a.addEventListener('click', function (ev) {
          ev.preventDefault();
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(window.location.href).then(function () {
              a.classList.add('bs-share-copied');
              setTimeout(function () { a.classList.remove('bs-share-copied'); }, 1500);
            }).catch(function () {});
          }
        });
      } else {
        a.href = p.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      wrap.appendChild(a);
    });

    root.appendChild(wrap);
  }

  /* ---- Shine-text on every headline (home, category, and article page) --- */
  function applyHeadlineShine() {
    var els = document.querySelectorAll('.card h3 a, .hero h2 a, #article-root h1');
    els.forEach(function (el) { el.classList.add('shine-text'); });
  }

  /* ---- On-click: replay shine, slide the clicked post right, then
     navigate. Never intercepts modifier/middle clicks. ---------------------- */
  function initPostClickSlide() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('a[href*="article.html?slug="]') : null;
      if (!link) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.target === '_blank') return;

      var container = link.closest('.card, .hero, li');
      if (container) triggerShine(container);

      if (reduceMotion || !container) return;

      e.preventDefault();
      var href = link.href;
      container.classList.add('slide-right-out');
      setTimeout(function () {
        window.location.href = href;
      }, 320);
    });
  }

  /* ---- Re-scan after pagination (Older/Newer Posts) reloads new cards ---- */
  function initPaginationHook() {
    document.addEventListener('click', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('load-more-btn')) {
        setTimeout(function () {
          scanRevealTargets();
          scanTypewriterTargets();
          injectShineOverlays();
          applyHeadlineShine();
        }, 200);
      }
    });
  }

  function init() {
    initProgressBar();
    hidePreloader();
    scanRevealTargets();
    scanTypewriterTargets();
    injectShineOverlays();
    applyHeadlineShine();
    injectShareButtons();
    initPostClickSlide();
    initPaginationHook();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(init, 250);
    });
  } else {
    setTimeout(init, 250);
  }
})();
