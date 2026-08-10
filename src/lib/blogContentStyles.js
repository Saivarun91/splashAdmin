/**
 * Shared styles for published/preview blog HTML.
 * Mirrors TipTap editor content (BlogDescriptionEditor) so spacing,
 * image widths/floats, tables, and image rows render identically.
 */
export const BLOG_RENDERED_CONTENT_CLASS = 'blog-rendered-content';

export const BLOG_RENDERED_CONTENT_CSS = `
.${BLOG_RENDERED_CONTENT_CLASS} {
  box-sizing: border-box;
  color: #111827;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.65;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.${BLOG_RENDERED_CONTENT_CLASS} *,
.${BLOG_RENDERED_CONTENT_CLASS} *::before,
.${BLOG_RENDERED_CONTENT_CLASS} *::after {
  box-sizing: border-box;
}
.${BLOG_RENDERED_CONTENT_CLASS} p {
  margin: 0.5em 0;
  line-height: 1.65;
}
.${BLOG_RENDERED_CONTENT_CLASS} h1,
.${BLOG_RENDERED_CONTENT_CLASS} h2,
.${BLOG_RENDERED_CONTENT_CLASS} h3,
.${BLOG_RENDERED_CONTENT_CLASS} h4 {
  font-weight: 600;
  margin: 0.75em 0 0.4em;
  color: inherit;
  line-height: 1.3;
}
.${BLOG_RENDERED_CONTENT_CLASS} h1 { font-size: 1.75rem; }
.${BLOG_RENDERED_CONTENT_CLASS} h2 { font-size: 1.4rem; }
.${BLOG_RENDERED_CONTENT_CLASS} h3 { font-size: 1.2rem; }
.${BLOG_RENDERED_CONTENT_CLASS} h4 { font-size: 1.05rem; }
.${BLOG_RENDERED_CONTENT_CLASS} ul,
.${BLOG_RENDERED_CONTENT_CLASS} ol {
  padding-left: 1.4rem;
  margin: 0.5em 0;
}
.${BLOG_RENDERED_CONTENT_CLASS} li { margin: 0.2em 0; }
.${BLOG_RENDERED_CONTENT_CLASS} a {
  color: #2563eb;
  text-decoration: underline;
}
.${BLOG_RENDERED_CONTENT_CLASS} strong { font-weight: 700; }
.${BLOG_RENDERED_CONTENT_CLASS} em { font-style: italic; }
.${BLOG_RENDERED_CONTENT_CLASS} u { text-decoration: underline; }
.${BLOG_RENDERED_CONTENT_CLASS} mark {
  background-color: #fef08a;
  border-radius: 0.15em;
  padding: 0 0.15em;
}

/* Images: honor inline width / float / margin from the editor */
.${BLOG_RENDERED_CONTENT_CLASS} img,
.${BLOG_RENDERED_CONTENT_CLASS} img.blog-img {
  height: auto !important;
  max-width: 100%;
  border-radius: 0.375rem;
  display: inline-block;
  vertical-align: middle;
}
.${BLOG_RENDERED_CONTENT_CLASS} img.blog-img-top {
  display: block;
  float: none;
  clear: both;
}
.${BLOG_RENDERED_CONTENT_CLASS} img.blog-img-left,
.${BLOG_RENDERED_CONTENT_CLASS} img.blog-img-wrap {
  float: left;
  margin: 0 1rem 0.85rem 0;
}
.${BLOG_RENDERED_CONTENT_CLASS} img.blog-img-right {
  float: right;
  margin: 0 0 0.85rem 1rem;
}

.${BLOG_RENDERED_CONTENT_CLASS} img.blog-img-center {
  display: block;
  float: none;
  clear: both;
  margin-left: auto;
  margin-right: auto;
}

.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure {
  margin: 0.85rem 0;
  max-width: 100%;
  height: auto;
  display: flex;
  gap: 0.65rem;
}
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  float: none !important;
  margin: 0 !important;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row figure.blog-figure img,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] figure.blog-figure img {
  width: auto;
  max-width: none;
}
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure--below { flex-direction: column; }
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure--above { flex-direction: column-reverse; }
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure--left { flex-direction: row-reverse; align-items: center; }
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure--right { flex-direction: row; align-items: center; }
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure.blog-img-left,
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure.blog-img-wrap {
  float: left;
  margin: 0 1rem 0.85rem 0;
}
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure.blog-img-right {
  float: right;
  margin: 0 0 0.85rem 1rem;
}
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure.blog-img-center {
  display: flex;
  float: none;
  clear: both;
  margin-left: auto;
  margin-right: auto;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-figcaption,
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure figcaption {
  font-size: 0.9em;
  line-height: 1.45;
  color: #4b5563;
  margin: 0;
}
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure > p,
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure > h1,
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure > h2,
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure > h3,
.${BLOG_RENDERED_CONTENT_CLASS} figure.blog-figure > h4 {
  margin: 0.25em 0;
  flex: 1 1 auto;
  min-width: 120px;
}

.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row],
.${BLOG_RENDERED_CONTENT_CLASS} .blog-card-row,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-card-row] {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  justify-content: flex-start;
  margin: 0.85rem 0;
  clear: both;
  width: 100%;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] {
  flex-wrap: nowrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row > figure,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > [data-image-text] {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 !important;
  float: none !important;
  clear: none !important;
  box-sizing: border-box;
}
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure img,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > [data-image-text] img {
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 0 !important;
  float: none !important;
  clear: none !important;
}
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h1,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h2,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h3,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h4,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure p {
  width: 100%;
  text-align: center;
  margin: 0.35em 0 0;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row > img,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > img {
  flex: 0 1 var(--saved-width, auto);
  min-width: 0;
  max-width: var(--saved-width, 100%);
}
@media (min-width: 1024px) {
  .${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row > figure,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > [data-image-text] {
    flex: 0 1 var(--saved-width, auto);
    max-width: var(--saved-width, 100%);
  }
}
@media (max-width: 1023px) {
  .${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    justify-content: stretch;
  }
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row]:has(> :nth-child(1):last-child) {
    grid-template-columns: minmax(0, 1fr);
  }
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > img,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > [data-image-text] {
    flex: unset;
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > img {
    width: 100%;
    max-width: 100%;
  }
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h1,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h2,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h3,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h4,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure p {
    font-size: 0.82rem;
    line-height: 1.4;
    white-space: normal;
    overflow-wrap: break-word;
  }
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h3 span,
  .${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] > figure h4 span {
    font-size: inherit;
    line-height: inherit;
  }
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row--center,
.${BLOG_RENDERED_CONTENT_CLASS} .blog-card-row--center,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row][data-align="center"],
.${BLOG_RENDERED_CONTENT_CLASS} div[data-card-row][data-align="center"] {
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row--right,
.${BLOG_RENDERED_CONTENT_CLASS} .blog-card-row--right,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row][data-align="right"],
.${BLOG_RENDERED_CONTENT_CLASS} div[data-card-row][data-align="right"] {
  justify-content: flex-end;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row img,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] img,
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row figure,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] figure {
  float: none !important;
  margin: 0 !important;
  clear: none !important;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row img.blog-img-top,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] img.blog-img-top,
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row img.blog-img-left,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] img.blog-img-left,
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row img.blog-img-right,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] img.blog-img-right,
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row img.blog-img-wrap,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] img.blog-img-wrap,
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row img.blog-img-center,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] img.blog-img-center {
  display: block !important;
  float: none !important;
  clear: none !important;
  margin: 0 !important;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row figure.blog-figure,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] figure.blog-figure {
  float: none !important;
  clear: none !important;
  margin: 0 !important;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-card,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-blog-card] {
  flex: 1 1 180px;
  min-width: 160px;
  max-width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 0.85rem;
  background: #f9fafb;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-card img,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-blog-card] img {
  float: none !important;
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 0 0 0.5rem !important;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-card h4,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-blog-card] h4 {
  margin-top: 0.25rem;
}

.${BLOG_RENDERED_CONTENT_CLASS} .tableWrapper {
  overflow-x: auto;
  margin: 0.75rem 0;
  max-width: 100%;
}
.${BLOG_RENDERED_CONTENT_CLASS} table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 0.75rem 0;
  overflow: hidden;
}
.${BLOG_RENDERED_CONTENT_CLASS} td,
.${BLOG_RENDERED_CONTENT_CLASS} th {
  border: 1px solid #d1d5db;
  padding: 0.45rem 0.6rem;
  min-width: 48px;
  vertical-align: top;
  position: relative;
  word-break: break-word;
}
.${BLOG_RENDERED_CONTENT_CLASS} th {
  background: #f3f4f6;
  font-weight: 600;
}

.${BLOG_RENDERED_CONTENT_CLASS} blockquote {
  margin: 0.75em 0;
  padding-left: 1rem;
  border-left: 3px solid #d1d5db;
  color: #374151;
}
.${BLOG_RENDERED_CONTENT_CLASS} hr {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 1.25em 0;
}
.${BLOG_RENDERED_CONTENT_CLASS} pre,
.${BLOG_RENDERED_CONTENT_CLASS} code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}
.${BLOG_RENDERED_CONTENT_CLASS} pre {
  background: #f3f4f6;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin: 0.75em 0;
}

/* Clear floats like the editor canvas */
.${BLOG_RENDERED_CONTENT_CLASS}::after {
  content: "";
  display: table;
  clear: both;
}
`;
