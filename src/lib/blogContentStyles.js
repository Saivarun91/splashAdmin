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

.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  margin: 0.85rem 0;
  clear: both;
  width: 100%;
}
.${BLOG_RENDERED_CONTENT_CLASS} .blog-image-row img,
.${BLOG_RENDERED_CONTENT_CLASS} div[data-image-row] img {
  float: none !important;
  margin: 0 !important;
  clear: none !important;
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
