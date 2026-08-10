/**
 * Strip TipTap editor chrome that accidentally leaked into saved blog HTML
 * (Move overlay, size label, image-text hint, resize handles).
 */
export function sanitizeBlogEditorHtml(html) {
  if (!html || typeof html !== 'string') return html || '';

  let out = html
    .replace(/<div[^>]*class="[^"]*blog-img-toolbar[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*blog-image-text-hint[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<span[^>]*class="[^"]*blog-img-drag[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<span[^>]*class="[^"]*blog-img-size-label[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<span[^>]*class="[^"]*blog-img-handle[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');

  if (typeof document === 'undefined') {
    return out
      .replace(/Select the text below to change size\s*\/\s*bold\s*\/\s*color\s*\(toolbar\)/gi, '')
      .replace(/⠿\s*Move\s*\d*\s*px/gi, '')
      .replace(/\bMove\s*\d+px\b/gi, '')
      .replace(/<div([^>]*class="[^"]*blog-img-node[^"]*"[^>]*)>/gi, '<div$1>')
      .trim();
  }

  try {
    const doc = new DOMParser().parseFromString(`<div id="__blog_sanitize_root">${out}</div>`, 'text/html');
    const root = doc.getElementById('__blog_sanitize_root');
    if (!root) return out;

    root
      .querySelectorAll(
        '.blog-img-toolbar, .blog-img-drag, .blog-img-size-label, .blog-image-text-hint, .blog-img-handle'
      )
      .forEach((el) => el.remove());

    // Unwrap editor-only wrappers; keep the real image/content
    root.querySelectorAll('.blog-img-frame, .blog-img-media, .blog-img-node').forEach((wrap) => {
      const parent = wrap.parentNode;
      if (!parent) return;
      while (wrap.firstChild) parent.insertBefore(wrap.firstChild, wrap);
      parent.removeChild(wrap);
    });

    root.querySelectorAll('p, div, span, figcaption, h1, h2, h3, h4').forEach((el) => {
      const t = (el.textContent || '').replace(/\u00a0/g, ' ').trim();
      if (
        /^Select the text below to change size/i.test(t) ||
        /^⠿?\s*Move\s*\d*\s*px$/i.test(t) ||
        /^Move\s*\d+px$/i.test(t)
      ) {
        el.remove();
      }
    });

    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      n.textContent = String(n.textContent || '')
        .replace(/Select the text below to change size\s*\/\s*bold\s*\/\s*color\s*\(toolbar\)/gi, '')
        .replace(/⠿\s*Move\s*\d*\s*px/gi, '')
        .replace(/\bMove\s*\d+px\b/gi, '');
    });

    root.querySelectorAll('[data-blog-card]').forEach((card) => {
      card.removeAttribute('data-bg');
      card.removeAttribute('data-border');
      card.removeAttribute('data-color');
      card.style.removeProperty('background-color');
      card.style.removeProperty('border-color');
      card.style.removeProperty('color');
      card.querySelectorAll('mark, span, p, strong, em, h1, h2, h3, h4').forEach((el) => {
        el.style.removeProperty('background-color');
        el.style.removeProperty('background');
        el.style.removeProperty('color');
        el.removeAttribute('data-color');
        if (el.getAttribute('style')?.trim() === '') el.removeAttribute('style');
      });
      card.querySelectorAll('mark').forEach((mark) => {
        const parent = mark.parentNode;
        if (!parent) return;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
      });
    });

    root.querySelectorAll('[data-image-row]').forEach((row) => {
      row.style.setProperty('width', '100%');
      row.style.setProperty('max-width', '100%');
      row.style.setProperty('flex-wrap', 'nowrap');
      row.style.setProperty('display', 'flex');
      row.querySelectorAll(':scope > figure, :scope > [data-image-text]').forEach((figure) => {
        const img = figure.querySelector('img');
        const w = parseInt(img?.getAttribute('data-width') || img?.getAttribute('width') || '0', 10);
        figure.style.removeProperty('float');
        figure.style.removeProperty('clear');
        figure.style.margin = '0';
        figure.style.display = 'flex';
        figure.style.flexDirection = 'column';
        figure.style.alignItems = 'center';
        if (Number.isFinite(w) && w > 0) {
          figure.style.flex = `0 1 ${w}px`;
          figure.style.maxWidth = `${w}px`;
          figure.style.minWidth = '0';
        }
        if (img) {
          img.style.removeProperty('float');
          img.style.removeProperty('clear');
          img.style.margin = '0';
          img.style.display = 'block';
          img.style.width = '100%';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        }
      });
      row.querySelectorAll(':scope > img').forEach((img) => {
        img.style.removeProperty('float');
        img.style.removeProperty('clear');
        img.style.margin = '0';
        img.style.display = 'block';
        const w = parseInt(img.getAttribute('data-width') || img.getAttribute('width') || '0', 10);
        if (Number.isFinite(w) && w > 0) {
          img.style.width = `${w}px`;
          img.style.maxWidth = `${w}px`;
          img.style.flex = `0 1 ${w}px`;
          img.style.minWidth = '0';
        }
      });
    });

    return root.innerHTML;
  } catch {
    return out
      .replace(/Select the text below to change size\s*\/\s*bold\s*\/\s*color\s*\(toolbar\)/gi, '')
      .replace(/⠿\s*Move\s*\d*\s*px/gi, '')
      .replace(/\bMove\s*\d+px\b/gi, '');
  }
}
