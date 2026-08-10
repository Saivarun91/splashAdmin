'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { StarterKit } from '@tiptap/starter-kit';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { BulletList, OrderedList } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  Unlink,
  ImagePlus,
  Image as ImageIcon,
  Code2,
  Highlighter,
  Palette,
  Undo2,
  Redo2,
  Eye,
  Maximize2,
  Minimize2,
  FileText,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Columns2,
  Table as TableIcon,
  Plus,
  Trash2,
  PanelLeft,
  PanelRight,
  Square,
  Rows3,
  LayoutGrid,
  Type,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  BLOG_RENDERED_CONTENT_CLASS,
  BLOG_RENDERED_CONTENT_CSS,
} from '@/lib/blogContentStyles';
import { sanitizeBlogEditorHtml } from '@/lib/sanitizeBlogEditorHtml';

const ICON = '#3B82F6';

const LINK_REL_NOFOLLOW = 'noopener noreferrer nofollow';
const LINK_REL_DOFOLLOW = 'noopener noreferrer';

function linkFollowFromRel(rel) {
  return String(rel || '').includes('nofollow') ? 'nofollow' : 'dofollow';
}

function relFromLinkFollow(follow) {
  return follow === 'dofollow' ? LINK_REL_DOFOLLOW : LINK_REL_NOFOLLOW;
}

const BlogLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rel: {
        default: LINK_REL_NOFOLLOW,
        parseHTML: (element) => element.getAttribute('rel'),
        renderHTML: (attributes) => {
          if (!attributes.rel) return {};
          return { rel: attributes.rel };
        },
      },
    };
  },
});

const BULLET_STYLES = [
  { value: 'disc', label: 'Disc', sample: '•' },
  { value: 'circle', label: 'Circle', sample: '◦' },
  { value: 'square', label: 'Square', sample: '■' },
  { value: '"— "', label: 'Dash', sample: '—' },
  { value: '"→ "', label: 'Arrow', sample: '→' },
  { value: '"✓ "', label: 'Check', sample: '✓' },
  { value: '"★ "', label: 'Star', sample: '★' },
];

const ORDERED_STYLES = [
  { value: 'decimal', label: '1, 2, 3' },
  { value: 'decimal-leading-zero', label: '01, 02, 03' },
  { value: 'lower-alpha', label: 'a, b, c' },
  { value: 'upper-alpha', label: 'A, B, C' },
  { value: 'lower-roman', label: 'i, ii, iii' },
  { value: 'upper-roman', label: 'I, II, III' },
];

const FONT_SIZES = ['8', '9', '10', '11', '12', '13', '14', '16', '18', '24', '32'];

const CAPTION_POSITIONS = [
  { value: 'below', label: 'Text below image' },
  { value: 'above', label: 'Text above image' },
  { value: 'left', label: 'Text left of image' },
  { value: 'right', label: 'Text right of image' },
];

const ROW_ALIGN_JUSTIFY = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const listStyleAttribute = {
  listStyleType: {
    default: null,
    parseHTML: (el) => el.style.listStyleType || null,
    renderHTML: (attrs) => {
      if (!attrs.listStyleType) return {};
      return { style: `list-style-type: ${attrs.listStyleType}` };
    },
  },
};

const StyledBulletList = BulletList.extend({
  addAttributes() {
    return { ...this.parent?.(), ...listStyleAttribute };
  },
});

const StyledOrderedList = OrderedList.extend({
  addAttributes() {
    return { ...this.parent?.(), ...listStyleAttribute };
  },
});

const BlogEditorBridge = Extension.create({
  name: 'blogEditorBridge',
  addStorage() {
    return { onInlineImage: null };
  },
});

const LAYOUT_CSS = {
  left: 'float:left;margin:0 1rem 0.85rem 0;',
  right: 'float:right;margin:0 0 0.85rem 1rem;',
  top: 'display:block;float:none;margin:0.85rem 0;clear:both;',
  wrap: 'float:left;margin:0 1rem 0.85rem 0;',
  center: 'display:block;float:none;margin:0.85rem auto;clear:both;',
};

function clampImageWidth(w, maxW = 1400) {
  const n = Math.round(Number(w) || 0);
  return Math.max(40, Math.min(n, maxW));
}

function rowAlignStyle(align = 'left') {
  const justify = ROW_ALIGN_JUSTIFY[align] || ROW_ALIGN_JUSTIFY.left;
  return `display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;justify-content:${justify};margin:0.85rem 0;clear:both;width:100%;`;
}

function readNaturalWidth(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(360);
      return;
    }
    const img = new window.Image();
    img.onload = () => resolve(clampImageWidth(img.naturalWidth || 360));
    img.onerror = () => resolve(360);
    img.src = src;
  });
}


/** Side-by-side image strip — unlimited images / image+text blocks. */
const ImageRow = Node.create({
  name: 'imageRow',
  group: 'block',
  content: '(image | imageTextBlock)+',
  defining: true,
  isolating: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      align: {
        default: 'left',
        parseHTML: (el) => el.getAttribute('data-align') || 'left',
        renderHTML: (attrs) => ({ 'data-align': attrs.align || 'left' }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-image-row]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const align = node?.attrs?.align || HTMLAttributes['data-align'] || 'left';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-image-row': '',
        'data-align': align,
        class: `blog-image-row blog-image-row--${align}`,
        style: rowAlignStyle(align),
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setImageRow:
        (images, align = 'left') =>
        ({ commands }) => {
          const content = (images || []).map((attrs) => ({
            type: 'image',
            attrs: {
              src: attrs.src,
              alt: attrs.alt || '',
              width: clampImageWidth(attrs.width || 320, 700),
              layout: 'top',
            },
          }));
          if (content.length < 1) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { align },
            content,
          });
        },
    };
  },
});

/**
 * Image + real editable text (paragraph/heading) so font size/style toolbar works.
 * Replaces plain string captions.
 */
const ImageTextBlock = Node.create({
  name: 'imageTextBlock',
  group: 'block',
  content: 'image (paragraph | heading)*',
  defining: true,
  isolating: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      textPos: {
        default: 'below',
        parseHTML: (el) =>
          el.getAttribute('data-text-pos') ||
          el.getAttribute('data-caption-pos') ||
          (el.className.match(/blog-figure--(below|above|left|right)/) || [])[1] ||
          'below',
        renderHTML: (attrs) => ({
          'data-text-pos': attrs.textPos || 'below',
          'data-caption-pos': attrs.textPos || 'below',
        }),
      },
      layout: {
        default: 'top',
        parseHTML: (el) =>
          el.getAttribute('data-layout') ||
          (el.className.match(/blog-img-(left|right|top|wrap|center)/) || [])[1] ||
          'top',
        renderHTML: (attrs) => ({ 'data-layout': attrs.layout || 'top' }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-image-text]' },
      {
        tag: 'figure.blog-figure',
        getAttrs: (el) => {
          if (!el.querySelector?.('img[src]')) return false;
          return {};
        },
        contentElement: (el) => {
          const wrap = document.createElement('div');
          const img = el.querySelector('img');
          if (img) wrap.appendChild(img.cloneNode(true));
          el.querySelectorAll('p, h1, h2, h3, h4').forEach((n) => {
            wrap.appendChild(n.cloneNode(true));
          });
          const fc = el.querySelector('figcaption');
          if (fc && !wrap.querySelector('p, h1, h2, h3, h4')) {
            const p = document.createElement('p');
            p.innerHTML = fc.innerHTML || fc.textContent || '';
            wrap.appendChild(p);
          }
          return wrap;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const textPos = node.attrs.textPos || 'below';
    const layout = node.attrs.layout || 'top';
    return [
      'figure',
      mergeAttributes(HTMLAttributes, {
        'data-image-text': '',
        'data-text-pos': textPos,
        'data-caption-pos': textPos,
        'data-layout': layout,
        class: `blog-figure blog-figure--${textPos} blog-img blog-img-${layout}`,
        style: LAYOUT_CSS[layout] || LAYOUT_CSS.top,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      addTextNearImage:
        (textPos = 'below') =>
        ({ state, dispatch, tr }) => {
          const { selection, schema } = state;
          const blockType = schema.nodes.imageTextBlock;
          const imageType = schema.nodes.image;
          const paraType = schema.nodes.paragraph;
          if (!blockType || !imageType || !paraType) return false;

          // Already inside imageTextBlock → ensure a paragraph exists and focus it
          for (let d = selection.$from.depth; d > 0; d -= 1) {
            const n = selection.$from.node(d);
            if (n.type.name === 'imageTextBlock') {
              const blockPos = selection.$from.before(d);
              let hasText = false;
              n.forEach((child) => {
                if (child.type.name === 'paragraph' || child.type.name === 'heading') hasText = true;
              });
              if (dispatch) {
                let nextTr = tr;
                if (!hasText) {
                  const insertAt = blockPos + n.nodeSize - 1;
                  nextTr = nextTr.insert(
                    insertAt,
                    paraType.create(null, schema.text('Type text here…'))
                  );
                }
                if (textPos && textPos !== n.attrs.textPos) {
                  nextTr = nextTr.setNodeMarkup(blockPos, undefined, {
                    ...n.attrs,
                    textPos,
                  });
                }
                const textStart = blockPos + 1 + (n.firstChild?.nodeSize || 0);
                nextTr = nextTr.setSelection(TextSelection.near(nextTr.doc.resolve(textStart)));
                dispatch(nextTr.scrollIntoView());
              }
              return true;
            }
          }

          if (!(selection instanceof NodeSelection) || selection.node.type.name !== 'image') {
            return false;
          }

          const imageNode = selection.node;
          const pos = selection.from;
          const legacyCaption = (imageNode.attrs.caption || '').trim();
          const cleanImage = imageType.create({
            ...imageNode.attrs,
            layout: 'top',
            caption: '',
            captionPos: 'below',
          });
          const para = paraType.create(
            null,
            schema.text(legacyCaption || 'Type text here…')
          );
          const block = blockType.create(
            {
              textPos: textPos || imageNode.attrs.captionPos || 'below',
              layout: imageNode.attrs.layout || 'top',
            },
            [cleanImage, para]
          );
          if (dispatch) {
            let nextTr = tr.replaceWith(pos, pos + imageNode.nodeSize, block);
            const textStart = pos + 1 + cleanImage.nodeSize;
            nextTr = nextTr.setSelection(TextSelection.near(nextTr.doc.resolve(textStart)));
            dispatch(nextTr.scrollIntoView());
          }
          return true;
        },
      setImageTextPos:
        (textPos) =>
        ({ state, dispatch, tr }) => {
          const { selection } = state;
          for (let d = selection.$from.depth; d > 0; d -= 1) {
            const n = selection.$from.node(d);
            if (n.type.name === 'imageTextBlock') {
              if (dispatch) {
                dispatch(
                  tr
                    .setNodeMarkup(selection.$from.before(d), undefined, {
                      ...n.attrs,
                      textPos,
                    })
                    .scrollIntoView()
                );
              }
              return true;
            }
          }
          if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
            const $pos = state.doc.resolve(selection.from);
            if ($pos.parent.type.name === 'imageTextBlock') {
              if (dispatch) {
                dispatch(
                  tr
                    .setNodeMarkup($pos.before($pos.depth), undefined, {
                      ...$pos.parent.attrs,
                      textPos,
                    })
                    .scrollIntoView()
                );
              }
              return true;
            }
          }
          return false;
        },
      removeTextNearImage:
        () =>
        ({ state, dispatch, tr }) => {
          const { selection, schema } = state;
          for (let d = selection.$from.depth; d > 0; d -= 1) {
            const n = selection.$from.node(d);
            if (n.type.name === 'imageTextBlock') {
              const blockPos = selection.$from.before(d);
              let imageChild = null;
              n.forEach((child) => {
                if (child.type.name === 'image' && !imageChild) imageChild = child;
              });
              if (!imageChild) return false;
              const image = schema.nodes.image.create({
                ...imageChild.attrs,
                layout: n.attrs.layout || imageChild.attrs.layout || 'top',
              });
              if (dispatch) {
                dispatch(tr.replaceWith(blockPos, blockPos + n.nodeSize, image).scrollIntoView());
              }
              return true;
            }
          }
          return false;
        },
    };
  },
});

/** Flexible card: user adds image / title / text only if they want. */
const BlogCard = Node.create({
  name: 'blogCard',
  content: '(image | heading | paragraph)*',
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-blog-card]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-blog-card': '',
        class: 'blog-card',
      }),
      0,
    ];
  },

  addNodeView() {
    return ({ editor, getPos, node }) => {
      const outer = document.createElement('div');
      outer.className = 'blog-card-editor';
      outer.setAttribute('data-blog-card', '');

      const bar = document.createElement('div');
      bar.className = 'blog-card-editor-bar';
      bar.contentEditable = 'false';

      const makeBtn = (label, title, onClick) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.title = title;
        btn.className = 'blog-card-editor-btn';
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        });
        return btn;
      };

      const runAtEnd = (fn) => {
        if (typeof getPos !== 'function') return;
        const pos = getPos();
        if (typeof pos !== 'number') return;
        const current = editor.state.doc.nodeAt(pos);
        if (!current) return;
        fn(pos, current);
      };

      bar.appendChild(
        makeBtn('+ Image', 'Add image to this card', () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const uploader = editor.storage.blogEditorBridge?.onInlineImage;
            let src = null;
            if (typeof uploader === 'function') src = await uploader(file);
            else src = URL.createObjectURL(file);
            if (!src) return;
            const width = await readNaturalWidth(src);
            runAtEnd((pos, current) => {
              editor
                .chain()
                .focus()
                .insertContentAt(pos + current.nodeSize - 1, {
                  type: 'image',
                  attrs: {
                    src,
                    alt: file.name || 'image',
                    layout: 'top',
                    width: clampImageWidth(width, 480),
                  },
                })
                .run();
            });
          };
          input.click();
        })
      );
      bar.appendChild(
        makeBtn('+ Title', 'Add title to this card', () => {
          runAtEnd((pos, current) => {
            editor
              .chain()
              .focus()
              .insertContentAt(pos + current.nodeSize - 1, {
                type: 'heading',
                attrs: { level: 4 },
                content: [{ type: 'text', text: 'Card title' }],
              })
              .run();
          });
        })
      );
      bar.appendChild(
        makeBtn('+ Text', 'Add text to this card', () => {
          runAtEnd((pos, current) => {
            const insertPos = pos + current.nodeSize - 1;
            editor
              .chain()
              .focus()
              .insertContentAt(insertPos, {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Add your text…' }],
              })
              .setTextSelection(insertPos + 1)
              .run();
          });
        })
      );
      bar.appendChild(
        makeBtn('Remove', 'Remove this card', () => {
          runAtEnd((pos, current) => {
            const $pos = editor.state.doc.resolve(pos);
            const parent = $pos.parent;
            if (parent.type.name === 'cardRow' && parent.childCount <= 1) {
              const rowPos = $pos.before($pos.depth);
              editor
                .chain()
                .focus()
                .deleteRange({ from: rowPos, to: rowPos + parent.nodeSize })
                .run();
              return;
            }
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + current.nodeSize })
              .run();
          });
        })
      );

      const body = document.createElement('div');
      body.className = 'blog-card-editor-body';
      if (!node.content.size) {
        body.dataset.empty = '1';
      }

      outer.appendChild(bar);
      outer.appendChild(body);

      return {
        dom: outer,
        contentDOM: body,
        update: (updated) => {
          if (updated.type.name !== 'blogCard') return false;
          if (updated.content.size) delete body.dataset.empty;
          else body.dataset.empty = '1';
          return true;
        },
        ignoreMutation: (mutation) => {
          if (mutation.type === 'selection') return false;
          return !body.contains(mutation.target);
        },
        stopEvent: (event) => Boolean(event.target?.closest?.('.blog-card-editor-bar')),
      };
    };
  },
});

/** Row of cards — same flexible side-by-side idea as images. */
const CardRow = Node.create({
  name: 'cardRow',
  group: 'block',
  content: 'blogCard+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      align: {
        default: 'left',
        parseHTML: (el) => el.getAttribute('data-align') || 'left',
        renderHTML: (attrs) => ({ 'data-align': attrs.align || 'left' }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-card-row]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const align = node?.attrs?.align || HTMLAttributes['data-align'] || 'left';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-card-row': '',
        'data-align': align,
        class: `blog-card-row blog-card-row--${align}`,
        style: rowAlignStyle(align),
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertCardRow:
        (align = 'left') =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { align },
            content: [{ type: 'blogCard' }],
          }),
      addCardToRow:
        () =>
        ({ state, dispatch }) => {
          const { $from } = state.selection;
          let rowPos = null;
          let rowNode = null;
          for (let d = $from.depth; d > 0; d -= 1) {
            const n = $from.node(d);
            if (n.type.name === 'cardRow') {
              rowPos = $from.before(d);
              rowNode = n;
              break;
            }
          }
          if (rowPos == null || !rowNode) return false;
          if (dispatch) {
            const insertAt = rowPos + rowNode.nodeSize - 1;
            const card = state.schema.nodes.blogCard.create();
            dispatch(state.tr.insert(insertAt, card).scrollIntoView());
          }
          return true;
        },
    };
  },
});

const CustomImage = TiptapImage.extend({
  draggable: true,
  selectable: true,
  inline: false,
  group: 'block',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 360,
        parseHTML: (el) => {
          const target = el.tagName === 'FIGURE' ? el.querySelector('img') || el : el;
          const w =
            target.getAttribute('width') ||
            target.getAttribute('data-width') ||
            el.getAttribute('data-width') ||
            (target.style?.width || '').replace(/px$/i, '');
          const n = parseInt(w, 10);
          return Number.isFinite(n) && n > 0 ? n : 360;
        },
        renderHTML: (attrs) => {
          if (!attrs.width) return {};
          return {
            width: String(attrs.width),
            'data-width': String(attrs.width),
          };
        },
      },
      layout: {
        default: 'top',
        parseHTML: (el) =>
          el.getAttribute('data-layout') ||
          (el.className.match(/blog-img-(left|right|top|wrap|center)/) || [])[1] ||
          'top',
        renderHTML: (attrs) => ({
          'data-layout': attrs.layout || 'top',
        }),
      },
      caption: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-caption') || '',
        renderHTML: () => ({}),
      },
      captionPos: {
        default: 'below',
        parseHTML: () => 'below',
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const layout = node.attrs.layout || 'top';
    const width = node.attrs.width || 360;
    const { style: _s, class: _c, ...rest } = HTMLAttributes;
    return [
      'img',
      {
        ...rest,
        src: node.attrs.src,
        alt: node.attrs.alt || '',
        class: 'blog-img blog-img-' + layout,
        'data-layout': layout,
        width: String(width),
        'data-width': String(width),
        style:
          (LAYOUT_CSS[layout] || LAYOUT_CSS.top) +
          'width:' +
          width +
          'px;max-width:100%;height:auto;border-radius:0.375rem;',
      },
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const outer = document.createElement('div');
      outer.className = 'blog-img-node blog-img-node--' + (node.attrs.layout || 'top');
      outer.contentEditable = 'false';
      // ProseMirror moves draggable leaf nodes via HTML5 drag — keep this true
      outer.draggable = true;

      const frame = document.createElement('div');
      frame.className = 'blog-img-frame';

      const img = document.createElement('img');
      img.src = node.attrs.src || '';
      img.alt = node.attrs.alt || '';
      img.draggable = false;

      const handles = ['nw', 'ne', 'sw', 'se', 'e', 'w'].map((dir) => {
        const h = document.createElement('span');
        h.className = 'blog-img-handle blog-img-handle--' + dir;
        h.dataset.dir = dir;
        h.title = 'Drag corner to resize';
        h.draggable = false;
        frame.appendChild(h);
        return h;
      });

      frame.appendChild(img);
      outer.appendChild(frame);

      const applyChrome = (attrs) => {
        const layout = attrs.layout || 'top';
        const width = clampImageWidth(attrs.width || 360);
        const inRow = Boolean(
          outer.closest?.(
            '.blog-image-row, [data-image-row], figure.blog-figure, [data-image-text], .blog-card-editor, .blog-card, [data-blog-card]'
          )
        );
        outer.className =
          'blog-img-node blog-img-node--' + layout + (inRow ? ' in-row' : '');
        if (inRow) {
          outer.style.cssText =
            'float:none;display:block;margin:0;clear:none;width:' +
            width +
            'px;max-width:100%;box-sizing:border-box;';
        } else {
          const layoutStyle = LAYOUT_CSS[layout] || LAYOUT_CSS.top;
          outer.style.cssText =
            layoutStyle + 'width:' + width + 'px;max-width:100%;box-sizing:border-box;';
        }
        outer.dataset.width = String(width);
        outer.dataset.layout = layout;
        img.style.cssText =
          'display:block;width:100%;height:auto;border-radius:0.375rem;pointer-events:none;';
      };
      applyChrome(node.attrs);

      let resizing = false;
      let startX = 0;
      let startW = 0;
      let dir = 'se';

      const onMove = (e) => {
        if (!resizing) return;
        const dx = e.clientX - startX;
        let next = startW;
        if (dir.includes('e')) next = startW + dx;
        if (dir.includes('w')) next = startW - dx;
        const layout =
          (outer.className.match(/blog-img-node--([a-z]+)/) || [])[1] || 'top';
        applyChrome({ layout, width: clampImageWidth(next) });
      };

      const onUp = () => {
        if (!resizing) return;
        resizing = false;
        outer.draggable = true;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        const finalW = clampImageWidth(outer.dataset.width || startW);
        if (typeof getPos === 'function') {
          const pos = getPos();
          if (typeof pos === 'number') {
            editor
              .chain()
              .setNodeSelection(pos)
              .updateAttributes('image', { width: finalW })
              .run();
          }
        }
      };

      handles.forEach((h) => {
        h.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          resizing = true;
          outer.draggable = false;
          dir = h.dataset.dir || 'se';
          startX = e.clientX;
          startW = outer.getBoundingClientRect().width;
          if (typeof getPos === 'function') {
            const pos = getPos();
            if (typeof pos === 'number') editor.commands.setNodeSelection(pos);
          }
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        });
      });

      // Select on pointer down so ProseMirror dragstart sees a NodeSelection
      outer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest?.('.blog-img-handle')) return;
        if (typeof getPos === 'function') {
          const pos = getPos();
          if (typeof pos === 'number') {
            editor.commands.setNodeSelection(pos);
          }
        }
      });

      return {
        dom: outer,
        // Never block drag/drop — only steal resize-handle mouse events
        stopEvent: (event) => {
          if (resizing) return true;
          if (
            event.target?.closest?.('.blog-img-handle') &&
            (event.type === 'mousedown' ||
              event.type === 'mousemove' ||
              event.type === 'mouseup' ||
              event.type === 'pointerdown')
          ) {
            return true;
          }
          return false;
        },
        ignoreMutation: () => true,
        selectNode: () => {
          outer.classList.add('is-selected');
          outer.draggable = true;
        },
        deselectNode: () => {
          outer.classList.remove('is-selected');
          outer.draggable = true;
        },
        update: (updated) => {
          if (updated.type.name !== 'image') return false;
          img.src = updated.attrs.src || '';
          img.alt = updated.attrs.alt || '';
          applyChrome(updated.attrs);
          return true;
        },
        destroy: () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        },
      };
    };
  },
});

const StyledTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (el) => el.style.backgroundColor || el.getAttribute('data-bg') || null,
        renderHTML: (attrs) => {
          if (!attrs.backgroundColor) return {};
          return {
            'data-bg': attrs.backgroundColor,
            style: `background-color: ${attrs.backgroundColor}`,
          };
        },
      },
    };
  },
});

function ToolbarBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center gap-0.5 rounded-md px-1.5 transition-colors ${
        active ? 'bg-blue-100' : 'hover:bg-blue-50'
      } disabled:cursor-not-allowed disabled:opacity-35`}
      style={{ color: ICON }}
    >
      {children}
    </button>
  );
}

function Menu({ open, onClose, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={`absolute left-0 top-full z-40 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg ${className}`}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}

function MenuItem({ onClick, active, children, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
        danger ? 'text-red-600 hover:bg-red-50' : active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50'
      }`}
    >
      {children}
    </button>
  );
}

function MenuLabel({ children }) {
  return <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">{children}</p>;
}

function getImageSelectionContext(editor) {
  if (!editor) return null;
  const { state } = editor;
  const { selection } = state;
  if (selection instanceof NodeSelection) {
    const node = selection.node;
    if (node.type.name === 'image') {
      const $pos = state.doc.resolve(selection.from);
      const parent = $pos.parent;
      if (parent.type.name === 'imageRow') {
        return {
          kind: 'imageInRow',
          imagePos: selection.from,
          imageNode: node,
          rowPos: $pos.before($pos.depth),
          rowNode: parent,
        };
      }
      if (parent.type.name === 'imageTextBlock') {
        return {
          kind: 'imageText',
          imagePos: selection.from,
          imageNode: node,
          blockPos: $pos.before($pos.depth),
          blockNode: parent,
        };
      }
      return { kind: 'image', imagePos: selection.from, imageNode: node };
    }
    if (node.type.name === 'imageTextBlock') {
      return {
        kind: 'imageText',
        blockPos: selection.from,
        blockNode: node,
      };
    }
    if (node.type.name === 'imageRow') {
      return { kind: 'row', rowPos: selection.from, rowNode: node };
    }
    if (node.type.name === 'cardRow') {
      return { kind: 'cardRow', rowPos: selection.from, rowNode: node };
    }
    if (node.type.name === 'blogCard') {
      return { kind: 'blogCard', cardPos: selection.from, cardNode: node };
    }
  }

  const { $from } = selection;
  for (let d = $from.depth; d > 0; d -= 1) {
    const n = $from.node(d);
    if (n.type.name === 'imageTextBlock') {
      return {
        kind: 'imageText',
        blockPos: $from.before(d),
        blockNode: n,
      };
    }
    if (n.type.name === 'imageRow') {
      return { kind: 'row', rowPos: $from.before(d), rowNode: n };
    }
    if (n.type.name === 'blogCard') {
      const cardCtx = {
        kind: 'blogCard',
        cardPos: $from.before(d),
        cardNode: n,
      };
      const rowDepth = d - 1;
      if (rowDepth > 0 && $from.node(rowDepth).type.name === 'cardRow') {
        return {
          ...cardCtx,
          rowPos: $from.before(rowDepth),
          rowNode: $from.node(rowDepth),
        };
      }
      return cardCtx;
    }
    if (n.type.name === 'cardRow') {
      return { kind: 'cardRow', rowPos: $from.before(d), rowNode: n };
    }
  }
  return null;
}

function findNeighborImage(doc, imagePos, direction) {
  const $pos = doc.resolve(imagePos);
  if (direction === 'prev') {
    const before = $pos.nodeBefore;
    if (before?.type.name === 'image') {
      return { pos: imagePos - before.nodeSize, node: before };
    }
  } else {
    const afterPos = imagePos + ($pos.nodeAfter?.nodeSize || doc.nodeAt(imagePos)?.nodeSize || 0);
    const after = doc.nodeAt(afterPos);
    // when selection is on image, nodeAfter at imagePos is the image itself in some cases
    const imageNode = doc.nodeAt(imagePos);
    if (!imageNode) return null;
    const nextPos = imagePos + imageNode.nodeSize;
    const next = doc.nodeAt(nextPos);
    if (next?.type.name === 'image') return { pos: nextPos, node: next };
    if (after?.type.name === 'image' && afterPos !== imagePos) {
      return { pos: afterPos, node: after };
    }
  }
  return null;
}

export default function BlogDescriptionEditor({ value = '', onChange, onInlineImage, error }) {
  const [menu, setMenu] = useState(null);
  const [showSource, setShowSource] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(() => sanitizeBlogEditorHtml(value || ''));
  const [customSize, setCustomSize] = useState('');
  const [customImageWidth, setCustomImageWidth] = useState('');
  const [cellColor, setCellColor] = useState('#fef08a');
  const [, setSelTick] = useState(0);
  const fileInputRef = useRef(null);
  const sideBySideInputRef = useRef(null);
  const addBesideInputRef = useRef(null);
  const syncingFromProp = useRef(false);
  const onInlineImageRef = useRef(onInlineImage);

  useEffect(() => {
    onInlineImageRef.current = onInlineImage;
  }, [onInlineImage]);

  const closeMenu = useCallback(() => setMenu(null), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      BlogEditorBridge,
      StarterKit.configure({
        link: false,
        bulletList: false,
        orderedList: false,
      }),
      BlogLink.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { target: '_blank' },
      }),
      StyledBulletList,
      StyledOrderedList,
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Underline,
      ImageRow,
      ImageTextBlock,
      CardRow,
      BlogCard,
      CustomImage.configure({ allowBase64: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({
        resizable: true,
        handleWidth: 8,
        cellMinWidth: 48,
        lastColumnResizable: true,
      }),
      TableRow,
      TableHeader,
      StyledTableCell,
      Placeholder.configure({ placeholder: 'Start typing...' }),
    ],
    content: sanitizeBlogEditorHtml(value || ''),
    onCreate: ({ editor: ed }) => {
      ed.storage.blogEditorBridge.onInlineImage = (...args) => onInlineImageRef.current?.(...args);
    },
    onUpdate: ({ editor: ed }) => {
      if (syncingFromProp.current) return;
      const html = sanitizeBlogEditorHtml(ed.getHTML());
      onChange?.(html);
      if (!showSource) setSourceHtml(html);
    },
    editorProps: {
      attributes: { class: 'blog-desc-prosemirror focus:outline-none text-gray-900' },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.storage.blogEditorBridge.onInlineImage = (...args) => onInlineImageRef.current?.(...args);
  }, [editor]);

  useEffect(() => {
    if (!editor) return undefined;
    const bump = () => setSelTick((n) => n + 1);
    editor.on('selectionUpdate', bump);
    editor.on('transaction', bump);
    return () => {
      editor.off('selectionUpdate', bump);
      editor.off('transaction', bump);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const clean = sanitizeBlogEditorHtml(value || '');
    if (clean === editor.getHTML()) return;
    syncingFromProp.current = true;
    editor.commands.setContent(clean, { emitUpdate: false });
    setSourceHtml(clean);
    syncingFromProp.current = false;
  }, [value, editor]);

  useEffect(() => {
    if (!isFullscreen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isFullscreen]);

  const toggleMenu = (id) => setMenu((m) => (m === id ? null : id));

  const uploadFiles = async (files) => {
    const list = Array.from(files || []).filter((f) => String(f.type || '').startsWith('image/'));
    if (!list.length) {
      window.alert('Please choose image files');
      return [];
    }
    const out = [];
    for (const file of list) {
      let src = null;
      if (typeof onInlineImageRef.current === 'function') {
        src = await onInlineImageRef.current(file);
      } else {
        src = URL.createObjectURL(file);
      }
      if (!src) continue;
      const width = await readNaturalWidth(src);
      out.push({
        src,
        alt: file.name || 'image',
        width,
        layout: 'top',
      });
    }
    return out;
  };

  const setLink = () => {
    if (!editor) return;
    const prevAttrs = editor.getAttributes('link');
    const prev = prevAttrs.href || '';
    const url = window.prompt('Enter URL', prev || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: url.trim(),
        rel: prevAttrs.rel || LINK_REL_NOFOLLOW,
      })
      .run();
    closeMenu();
  };

  const applyLinkFollow = (followType) => {
    if (!editor?.isActive('link')) return;
    const { href } = editor.getAttributes('link');
    if (!href) return;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href, rel: relFromLinkFollow(followType) })
      .run();
  };

  const applyBulletStyle = (style) => {
    if (!editor) return;
    if (!editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().updateAttributes('bulletList', { listStyleType: style }).run();
    } else {
      editor.chain().focus().updateAttributes('bulletList', { listStyleType: style }).run();
    }
    closeMenu();
  };

  const applyOrderedStyle = (style) => {
    if (!editor) return;
    if (!editor.isActive('orderedList')) {
      editor.chain().focus().toggleOrderedList().updateAttributes('orderedList', { listStyleType: style }).run();
    } else {
      editor.chain().focus().updateAttributes('orderedList', { listStyleType: style }).run();
    }
    closeMenu();
  };

  const setImageLayout = (layout) => {
    if (!editor) return;
    const ctx = getImageSelectionContext(editor);

    // Image+text block: move/align the whole figure
    if (ctx?.kind === 'imageText' && ctx.blockPos != null && ctx.blockNode) {
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.setNodeMarkup(ctx.blockPos, undefined, {
            ...ctx.blockNode.attrs,
            layout,
          });
          if (ctx.imagePos != null && ctx.imageNode) {
            tr.setNodeMarkup(ctx.imagePos, undefined, {
              ...ctx.imageNode.attrs,
              layout: 'top',
            });
          }
          return true;
        })
        .run();
      closeMenu();
      return;
    }

    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { layout }).run();
    } else {
      window.alert('Select an image first, or upload an image then choose layout.');
    }
    closeMenu();
  };

  /** Move selected image / image-text / image-row up or down in the document. */
  const moveSelectedBlock = (direction) => {
    if (!editor) return;
    const { state } = editor;
    const ctx = getImageSelectionContext(editor);

    let from = null;
    let node = null;

    if (ctx?.kind === 'imageText' && ctx.blockPos != null && ctx.blockNode) {
      from = ctx.blockPos;
      node = ctx.blockNode;
    } else if ((ctx?.kind === 'imageInRow' || ctx?.kind === 'row') && ctx.rowPos != null && ctx.rowNode) {
      from = ctx.rowPos;
      node = ctx.rowNode;
    } else if (ctx?.kind === 'image' && ctx.imagePos != null && ctx.imageNode) {
      from = ctx.imagePos;
      node = ctx.imageNode;
    } else if (state.selection instanceof NodeSelection) {
      from = state.selection.from;
      node = state.selection.node;
    }

    if (from == null || !node) {
      window.alert('Select an image first, then Move up / Move down.');
      return;
    }

    const to = from + node.nodeSize;
    const $from = state.doc.resolve(from);

    if (direction === 'up') {
      const before = $from.nodeBefore;
      if (!before) {
        window.alert('Already at the top.');
        return;
      }
      const beforeStart = from - before.nodeSize;
      const tr = state.tr.replaceWith(beforeStart, to, [node, before]);
      tr.setSelection(NodeSelection.create(tr.doc, beforeStart));
      editor.view.dispatch(tr.scrollIntoView());
      closeMenu();
      return;
    }

    if (direction === 'down') {
      const after = state.doc.nodeAt(to);
      if (!after) {
        window.alert('Already at the bottom.');
        return;
      }
      const afterEnd = to + after.nodeSize;
      const tr = state.tr.replaceWith(from, afterEnd, [after, node]);
      tr.setSelection(NodeSelection.create(tr.doc, from + after.nodeSize));
      editor.view.dispatch(tr.scrollIntoView());
      closeMenu();
    }
  };

  const setImageWidth = (width) => {
    if (!editor) return;
    if (!editor.isActive('image')) {
      window.alert('Select an image in the editor first.');
      return;
    }
    const w = clampImageWidth(width);
    editor.chain().focus().updateAttributes('image', { width: w }).run();
    setCustomImageWidth(String(w));
    closeMenu();
  };

  const addTextNearImage = (textPos = 'below') => {
    if (!editor) return;
    const ok = editor.chain().focus().addTextNearImage(textPos).run();
    if (!ok) {
      window.alert('Select an image first, then add text near it. After that, select the text and use the toolbar (size, bold, color…).');
    }
    closeMenu();
  };

  const setCaptionPos = (textPos) => {
    if (!editor) return;
    if (editor.isActive('imageTextBlock') || getImageSelectionContext(editor)?.kind === 'imageText') {
      editor.chain().focus().setImageTextPos(textPos).run();
      closeMenu();
      return;
    }
    addTextNearImage(textPos);
  };

  const removeTextNearImage = () => {
    if (!editor) return;
    if (!editor.chain().focus().removeTextNearImage().run()) {
      window.alert('No image text to remove. Select an image that already has text.');
    }
    closeMenu();
  };

  const setRowAlign = (align) => {
    if (!editor) return;
    const ctx = getImageSelectionContext(editor);
    if (ctx?.kind === 'imageInRow' || ctx?.kind === 'row') {
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.setNodeMarkup(ctx.rowPos, undefined, {
            ...ctx.rowNode.attrs,
            align,
          });
          return true;
        })
        .run();
      closeMenu();
      return;
    }
    if (ctx?.kind === 'cardRow' || (ctx?.kind === 'blogCard' && ctx.rowPos != null)) {
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.setNodeMarkup(ctx.rowPos, undefined, {
            ...ctx.rowNode.attrs,
            align,
          });
          return true;
        })
        .run();
      closeMenu();
      return;
    }
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { layout: align === 'center' ? 'center' : align === 'right' ? 'right' : 'top' }).run();
      closeMenu();
      return;
    }
    window.alert('Select an image row or cards row first.');
    closeMenu();
  };

  /** One-click: join selected image with previous/next into a side-by-side row. */
  const joinWithNeighbor = (direction) => {
    if (!editor) return;
    const ctx = getImageSelectionContext(editor);
    if (!ctx || ctx.kind !== 'image') {
      window.alert('Select a single image (not already side by side), then use Side by side.');
      return;
    }
    const neighbor = findNeighborImage(editor.state.doc, ctx.imagePos, direction);
    if (!neighbor) {
      window.alert(
        direction === 'prev'
          ? 'No image just above/before this one. Upload another image next to it, or use “Add image beside”.'
          : 'No image just below/after this one. Upload another image next to it, or use “Add image beside”.'
      );
      return;
    }

    const { state } = editor;
    const imageType = state.schema.nodes.image;
    const rowType = state.schema.nodes.imageRow;
    const a = imageType.create({ ...ctx.imageNode.attrs, layout: 'top' });
    const b = imageType.create({ ...neighbor.node.attrs, layout: 'top' });
    const kids = direction === 'prev' ? [b, a] : [a, b];
    const from = Math.min(ctx.imagePos, neighbor.pos);
    const to =
      Math.max(ctx.imagePos + ctx.imageNode.nodeSize, neighbor.pos + neighbor.node.nodeSize);
    const row = rowType.create({ align: 'left' }, kids);
    editor.view.dispatch(state.tr.replaceWith(from, to, row).scrollIntoView());
    closeMenu();
  };

  /** Stack a side-by-side row back to one-under-another. */
  const stackSeparately = () => {
    if (!editor) return;
    const ctx = getImageSelectionContext(editor);
    if (!ctx || (ctx.kind !== 'imageInRow' && ctx.kind !== 'row')) {
      window.alert('Select images that are already side by side.');
      return;
    }
    const { state } = editor;
    const kids = [];
    ctx.rowNode.forEach((child) => {
      if (child.type.name === 'image' || child.type.name === 'imageTextBlock') {
        kids.push(child);
      }
    });
    if (!kids.length) return;
    const nodes = kids.map((child) => {
      if (child.type.name === 'image') {
        return state.schema.nodes.image.create({ ...child.attrs, layout: 'top' });
      }
      return child;
    });
    editor.view.dispatch(
      state.tr.replaceWith(ctx.rowPos, ctx.rowPos + ctx.rowNode.nodeSize, nodes).scrollIntoView()
    );
    closeMenu();
  };

  const addImagesBeside = async (files) => {
    if (!editor) return;
    const uploaded = await uploadFiles(files);
    if (!uploaded.length) return;
    const ctx = getImageSelectionContext(editor);
    const { state } = editor;
    const imageType = state.schema.nodes.image;
    const rowType = state.schema.nodes.imageRow;
    const newNodes = uploaded.map((attrs) =>
      imageType.create({
        ...attrs,
        layout: 'top',
        width: clampImageWidth(attrs.width || 320, 700),
      })
    );

    if (ctx?.kind === 'imageInRow' || ctx?.kind === 'row') {
      const kids = [];
      ctx.rowNode.forEach((child) => {
        if (child.type.name === 'image' || child.type.name === 'imageTextBlock') kids.push(child);
      });
      const row = rowType.create(
        { align: ctx.rowNode.attrs.align || 'left' },
        [...kids, ...newNodes]
      );
      editor.view.dispatch(
        state.tr.replaceWith(ctx.rowPos, ctx.rowPos + ctx.rowNode.nodeSize, row).scrollIntoView()
      );
      closeMenu();
      return;
    }

    if (ctx?.kind === 'image') {
      const current = imageType.create({ ...ctx.imageNode.attrs, layout: 'top' });
      const row = rowType.create({ align: 'left' }, [current, ...newNodes]);
      editor.view.dispatch(
        state.tr
          .replaceWith(ctx.imagePos, ctx.imagePos + ctx.imageNode.nodeSize, row)
          .scrollIntoView()
      );
      closeMenu();
      return;
    }

    editor.commands.setImageRow(uploaded, 'left');
    closeMenu();
  };

  const insertSideBySideFromFiles = async (files) => {
    if (!editor) return;
    const uploaded = await uploadFiles(files);
    if (!uploaded.length) return;
    if (uploaded.length === 1) {
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'image',
            attrs: {
              ...uploaded[0],
              width: clampImageWidth(uploaded[0].width || 360),
            },
          },
          { type: 'paragraph' },
        ])
        .run();
    } else {
      editor.commands.setImageRow(uploaded, 'left');
    }
    closeMenu();
  };

  const onPickImage = async (file) => {
    if (!file || !editor) return;
    const uploaded = await uploadFiles([file]);
    if (!uploaded[0]) return;
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'image',
          attrs: {
            ...uploaded[0],
            width: clampImageWidth(uploaded[0].width || 360),
          },
        },
        { type: 'paragraph' },
      ])
      .run();
  };

  const applyFontSize = (px) => {
    if (!editor || !px) return;
    const size = String(px).endsWith('px') ? String(px) : `${px}px`;
    editor.chain().focus().setFontSize(size).run();
    closeMenu();
  };

  const applySource = () => {
    if (!editor) return;
    const clean = sanitizeBlogEditorHtml(sourceHtml || '');
    setSourceHtml(clean);
    editor.commands.setContent(clean, { emitUpdate: true });
    onChange?.(clean);
    setShowSource(false);
  };

  const setCellBg = (color) => {
    if (!editor) return;
    editor.chain().focus().setCellAttribute('backgroundColor', color).run();
    closeMenu();
  };

  if (!editor) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-8 text-center text-sm text-gray-500">
        Loading editor…
      </div>
    );
  }

  const imgCtx = getImageSelectionContext(editor);
  const imageSelected = editor.isActive('image') || imgCtx?.kind === 'imageText';
  const inImageRow = imgCtx?.kind === 'imageInRow' || imgCtx?.kind === 'row';
  const inCardRow = imgCtx?.kind === 'cardRow' || Boolean(imgCtx?.rowNode);
  const inImageText = imgCtx?.kind === 'imageText';
  const currentCaptionPos =
    (inImageText && imgCtx.blockNode?.attrs?.textPos) ||
    editor.getAttributes('imageTextBlock')?.textPos ||
    'below';
  const currentRowAlign = imgCtx?.rowNode?.attrs?.align || null;

  const inTable = editor.isActive('table');
  const fontSizeRaw = editor.getAttributes('textStyle')?.fontSize || '';
  const currentFontSize = String(fontSizeRaw).replace(/px$/i, '').trim() || '—';
  const blockLabel = editor.isActive('heading', { level: 1 })
    ? 'H1'
    : editor.isActive('heading', { level: 2 })
      ? 'H2'
      : editor.isActive('heading', { level: 3 })
        ? 'H3'
        : editor.isActive('heading', { level: 4 })
          ? 'H4'
          : 'P';
  const linkActive = editor.isActive('link');
  const linkFollow = linkActive ? linkFollowFromRel(editor.getAttributes('link').rel) : 'nofollow';
  const shellClass = isFullscreen
    ? 'fixed inset-0 z-[80] flex flex-col bg-white shadow-2xl'
    : `overflow-visible rounded-lg border bg-white ${error ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className={shellClass}>
      <style>{`
        ${BLOG_RENDERED_CONTENT_CSS}
        .blog-desc-prosemirror { min-height: ${isFullscreen ? 'calc(100vh - 56px)' : '240px'}; padding: 0.875rem 1rem; outline: none; }
        .blog-desc-prosemirror p.is-editor-empty:first-child::before {
          color: #9ca3af; content: attr(data-placeholder); float: left; height: 0; pointer-events: none;
        }
        .blog-desc-prosemirror p { margin: 0.5em 0; line-height: 1.65; }
        .blog-desc-prosemirror h1,.blog-desc-prosemirror h2,.blog-desc-prosemirror h3,.blog-desc-prosemirror h4 { font-weight: 600; margin: 0.75em 0 0.4em; }
        .blog-desc-prosemirror h1 { font-size: 1.75rem; }
        .blog-desc-prosemirror h2 { font-size: 1.4rem; }
        .blog-desc-prosemirror h3 { font-size: 1.2rem; }
        .blog-desc-prosemirror ul { padding-left: 1.4rem; margin: 0.5em 0; }
        .blog-desc-prosemirror ol { padding-left: 1.4rem; margin: 0.5em 0; }
        .blog-desc-prosemirror a { color: #2563eb; text-decoration: underline; }
        .blog-desc-prosemirror img { height: auto; border-radius: 0.375rem; max-width: 100%; }
        .blog-desc-prosemirror::after { content: ""; display: table; clear: both; }
        .blog-desc-prosemirror .blog-img-node {
          position: relative;
          max-width: 100%;
          line-height: 0;
          box-sizing: border-box;
          cursor: grab;
        }
        .blog-desc-prosemirror .blog-img-node:active { cursor: grabbing; }
        .blog-desc-prosemirror .blog-img-node.in-row {
          float: none !important;
          display: block !important;
          margin: 0 !important;
          clear: none !important;
          cursor: grab;
        }
        .blog-desc-prosemirror .blog-img-node--left,
        .blog-desc-prosemirror .blog-img-node--wrap {
          float: left;
          margin: 0 1rem 0.85rem 0;
          clear: none;
        }
        .blog-desc-prosemirror .blog-img-node--right {
          float: right;
          margin: 0 0 0.85rem 1rem;
          clear: none;
        }
        .blog-desc-prosemirror .blog-img-node--top {
          display: block;
          float: none;
          margin: 0.85rem 0;
          clear: both;
        }
        .blog-desc-prosemirror .blog-img-node--center {
          display: block;
          float: none;
          margin: 0.85rem auto;
          clear: both;
        }
        .blog-desc-prosemirror .blog-image-row,
        .blog-desc-prosemirror div[data-image-row] {
          display: flex;
          flex-wrap: nowrap;
          gap: 12px;
          align-items: flex-start;
          margin: 0.85rem 0;
          clear: both;
          width: 100%;
        }
        .blog-desc-prosemirror .blog-card-row,
        .blog-desc-prosemirror div[data-card-row] {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-start;
          margin: 0.85rem 0;
          clear: both;
          width: 100%;
        }
        .blog-desc-prosemirror .blog-image-row--center,
        .blog-desc-prosemirror .blog-card-row--center { justify-content: center; }
        .blog-desc-prosemirror .blog-image-row--right,
        .blog-desc-prosemirror .blog-card-row--right { justify-content: flex-end; }
        .blog-desc-prosemirror .blog-image-row--left,
        .blog-desc-prosemirror .blog-card-row--left { justify-content: flex-start; }
        .blog-desc-prosemirror .blog-image-row .blog-img-node {
          float: none !important;
          flex: 0 1 auto;
          min-width: 0;
        }
        .blog-desc-prosemirror .blog-image-row img,
        .blog-desc-prosemirror div[data-image-row] img {
          clear: none !important;
          margin: 0 !important;
          float: none !important;
          flex-shrink: 1;
          min-width: 0;
        }
        .blog-desc-prosemirror .blog-img-media {
          display: flex;
          gap: 8px;
          width: 100%;
        }
        .blog-desc-prosemirror .blog-img-media--below { flex-direction: column; }
        .blog-desc-prosemirror .blog-img-media--above { flex-direction: column-reverse; }
        .blog-desc-prosemirror .blog-img-media--left { flex-direction: row-reverse; align-items: center; }
        .blog-desc-prosemirror .blog-img-media--right { flex-direction: row; align-items: center; }
        .blog-desc-prosemirror .blog-img-caption {
          font-size: 12px;
          line-height: 1.4;
          color: #4b5563;
          white-space: pre-wrap;
          padding: 2px 0;
        }
        .blog-desc-prosemirror .ProseMirror-selectednode.blog-img-node,
        .blog-desc-prosemirror .blog-img-node.is-selected {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 0.45rem;
        }
        .blog-desc-prosemirror .blog-img-frame {
          position: relative;
          width: 100%;
        }
        .blog-desc-prosemirror .blog-img-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border: 2px solid #fff;
          border-radius: 2px;
          box-shadow: 0 0 0 1px rgba(59,130,246,0.45);
          z-index: 9;
          opacity: 0;
          pointer-events: auto;
        }
        .blog-desc-prosemirror .blog-img-node.is-selected .blog-img-handle,
        .blog-desc-prosemirror .blog-img-node:hover .blog-img-handle {
          opacity: 1;
        }
        .blog-desc-prosemirror .blog-img-handle--nw { left: -5px; top: -5px; cursor: nwse-resize; }
        .blog-desc-prosemirror .blog-img-handle--ne { right: -5px; top: -5px; cursor: nesw-resize; }
        .blog-desc-prosemirror .blog-img-handle--sw { left: -5px; bottom: -5px; cursor: nesw-resize; }
        .blog-desc-prosemirror .blog-img-handle--se { right: -5px; bottom: -5px; cursor: nwse-resize; }
        .blog-desc-prosemirror .blog-img-handle--e { right: -5px; top: 50%; margin-top: -5px; cursor: ew-resize; }
        .blog-desc-prosemirror .blog-img-handle--w { left: -5px; top: 50%; margin-top: -5px; cursor: ew-resize; }
        .blog-desc-prosemirror figure.blog-figure,
        .blog-desc-prosemirror [data-image-text] {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          max-width: 100%;
          margin: 0.85rem 0;
          clear: both;
        }
        .blog-desc-prosemirror figure.blog-figure--below,
        .blog-desc-prosemirror [data-text-pos="below"] { flex-direction: column; }
        .blog-desc-prosemirror figure.blog-figure--above,
        .blog-desc-prosemirror [data-text-pos="above"] { flex-direction: column-reverse; }
        .blog-desc-prosemirror figure.blog-figure--left,
        .blog-desc-prosemirror [data-text-pos="left"] { flex-direction: row-reverse; align-items: center; }
        .blog-desc-prosemirror figure.blog-figure--right,
        .blog-desc-prosemirror [data-text-pos="right"] { flex-direction: row; align-items: center; }
        .blog-desc-prosemirror figure.blog-figure > .blog-img-node,
        .blog-desc-prosemirror [data-image-text] > .blog-img-node { flex: 0 0 auto; }
        .blog-desc-prosemirror figure.blog-figure > p,
        .blog-desc-prosemirror figure.blog-figure > h1,
        .blog-desc-prosemirror figure.blog-figure > h2,
        .blog-desc-prosemirror figure.blog-figure > h3,
        .blog-desc-prosemirror figure.blog-figure > h4,
        .blog-desc-prosemirror [data-image-text] > p,
        .blog-desc-prosemirror [data-image-text] > h1,
        .blog-desc-prosemirror [data-image-text] > h2,
        .blog-desc-prosemirror [data-image-text] > h3,
        .blog-desc-prosemirror [data-image-text] > h4 {
          flex: 1 1 auto;
          min-width: 120px;
          margin: 0.25em 0;
          line-height: 1.5;
        }
        .blog-desc-prosemirror .blog-card-editor {
          flex: 1 1 180px;
          min-width: 160px;
          max-width: 100%;
          border: 1px dashed #d1d5db;
          border-radius: 0.5rem;
          background: #fff;
          overflow: hidden;
        }
        .blog-desc-prosemirror .blog-card-editor-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 6px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .blog-desc-prosemirror .blog-card-editor-btn {
          border: 0;
          border-radius: 4px;
          background: #fff;
          color: #374151;
          font-size: 11px;
          padding: 3px 8px;
          cursor: pointer;
          box-shadow: 0 0 0 1px #e5e7eb;
        }
        .blog-desc-prosemirror .blog-card-editor-btn:hover { background: #f3f4f6; }
        .blog-desc-prosemirror .blog-card-editor-body {
          min-height: 48px;
          padding: 8px 10px;
        }
        .blog-desc-prosemirror .blog-card-editor-body[data-empty='1']::before {
          content: 'Empty card — use + Image / + Title / + Text, then style text with the toolbar';
          color: #9ca3af;
          font-size: 12px;
        }
        .blog-desc-prosemirror .tableWrapper { overflow-x: auto; margin: 0.75rem 0; max-width: 100%; }
        .blog-desc-prosemirror table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 0; overflow: hidden; }
        .blog-desc-prosemirror td, .blog-desc-prosemirror th {
          border: 1px solid #d1d5db;
          padding: 0.45rem 0.6rem;
          min-width: 48px;
          vertical-align: top;
          position: relative;
          box-sizing: border-box;
          word-break: break-word;
        }
        .blog-desc-prosemirror th { background: #f3f4f6; font-weight: 600; }
        .blog-desc-prosemirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 5px;
          background-color: #93c5fd;
          pointer-events: none;
          z-index: 20;
        }
        .blog-desc-prosemirror.resize-cursor,
        .blog-desc-prosemirror .resize-cursor {
          cursor: ew-resize;
          cursor: col-resize;
        }
        .blog-desc-preview {
          min-height: ${isFullscreen ? 'calc(100vh - 56px)' : '240px'};
          padding: 0.875rem 1rem;
          overflow: auto;
          background: #fff;
        }
      `}</style>

      <div className="relative z-20 flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-white px-2 py-1.5">
        <ToolbarBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} strokeWidth={2.5} />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={15} />
        </ToolbarBtn>

        <label className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-blue-50" title="Text color">
          <Palette size={15} style={{ color: ICON }} />
          <input type="color" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
        </label>
        <label className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-blue-50" title="Highlight">
          <Highlighter size={15} style={{ color: ICON }} />
          <input type="color" defaultValue="#fef08a" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()} />
        </label>

        <div className="relative">
          <ToolbarBtn title="Font size" active={menu === 'size'} onClick={() => toggleMenu('size')}>
            <span className="min-w-[1.25rem] text-center text-xs font-semibold">{currentFontSize}</span>
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'size'} onClose={closeMenu} className="w-40">
            {FONT_SIZES.map((s) => (
              <MenuItem key={s} active={currentFontSize === s} onClick={() => applyFontSize(s)}>{s}</MenuItem>
            ))}
            <div className="border-t border-gray-100 px-2 py-2">
              <p className="mb-1 text-[11px] text-gray-500">Custom</p>
              <div className="flex items-center gap-1">
                <input
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="px"
                  className="w-16 rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  onClick={() => applyFontSize(customSize)}
                >
                  Apply
                </button>
              </div>
            </div>
          </Menu>
        </div>

        <div className="relative">
          <ToolbarBtn title="Paragraph style" active={menu === 'block'} onClick={() => toggleMenu('block')}>
            <span className="min-w-[1.25rem] text-center text-xs font-semibold">{blockLabel}</span>
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'block'} onClose={closeMenu}>
            <MenuItem active={editor.isActive('paragraph')} onClick={() => { editor.chain().focus().setParagraph().run(); closeMenu(); }}>Paragraph</MenuItem>
            {[1, 2, 3, 4].map((level) => (
              <MenuItem key={level} active={editor.isActive('heading', { level })} onClick={() => { editor.chain().focus().setHeading({ level }).run(); closeMenu(); }}>
                Heading {level}
              </MenuItem>
            ))}
          </Menu>
        </div>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        <div className="relative">
          <ToolbarBtn title="Bullet list" active={editor.isActive('bulletList') || menu === 'ul'} onClick={() => toggleMenu('ul')}>
            <List size={15} />
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'ul'} onClose={closeMenu} className="w-44">
            {BULLET_STYLES.map((item) => (
              <MenuItem key={item.label} onClick={() => applyBulletStyle(item.value)}>
                <span className="w-5 text-center">{item.sample}</span> {item.label}
              </MenuItem>
            ))}
          </Menu>
        </div>

        <div className="relative">
          <ToolbarBtn title="Numbered list" active={editor.isActive('orderedList') || menu === 'ol'} onClick={() => toggleMenu('ol')}>
            <ListOrdered size={15} />
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'ol'} onClose={closeMenu} className="w-44">
            {ORDERED_STYLES.map((item) => (
              <MenuItem key={item.value} onClick={() => applyOrderedStyle(item.value)}>
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </div>

        <ToolbarBtn title="Insert link" active={editor.isActive('link')} onClick={setLink}>
          <Link2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Remove link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink size={15} />
        </ToolbarBtn>
        {linkActive ? (
          <select
            title="Link follow type"
            aria-label="Link follow type"
            className="h-8 max-w-[108px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700"
            value={linkFollow}
            onChange={(e) => applyLinkFollow(e.target.value)}
          >
            <option value="nofollow">No follow</option>
            <option value="dofollow">Do follow</option>
          </select>
        ) : null}

        <ToolbarBtn title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().setParagraph().run()}>
          <span className="text-[11px] font-bold tracking-tight">T<sub className="text-[8px]">x</sub></span>
        </ToolbarBtn>

        <ToolbarBtn title="Upload one image" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus size={15} />
        </ToolbarBtn>

        {/* Easy image layout: side-by-side vs stack */}
        <div className="relative">
          <ToolbarBtn
            title="Images: side by side or stacked"
            active={menu === 'layout' || inImageRow}
            onClick={() => toggleMenu('layout')}
          >
            <Columns2 size={15} />
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'layout'} onClose={closeMenu} className="w-72">
            <MenuLabel>Move image</MenuLabel>
            <MenuItem onClick={() => moveSelectedBlock('up')}>
              <ArrowUp size={14} /> Move up
            </MenuItem>
            <MenuItem onClick={() => moveSelectedBlock('down')}>
              <ArrowDown size={14} /> Move down
            </MenuItem>
            <div className="border-t border-gray-100 px-3 py-2 text-[11px] leading-snug text-gray-500">
              Or click the image, then drag it to a new place in the content.
            </div>

            <div className="my-1 border-t border-gray-100" />
            <MenuLabel>Easy layout</MenuLabel>
            <MenuItem onClick={() => sideBySideInputRef.current?.click()}>
              <Columns2 size={14} /> Insert side-by-side images…
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (!imageSelected && !inImageRow) {
                  window.alert('Select an image first, then add another beside it.');
                  return;
                }
                addBesideInputRef.current?.click();
              }}
            >
              <Plus size={14} /> Add image beside selected
            </MenuItem>
            <MenuItem onClick={() => joinWithNeighbor('next')}>
              <Columns2 size={14} /> Side by side with next image
            </MenuItem>
            <MenuItem onClick={() => joinWithNeighbor('prev')}>
              <Columns2 size={14} /> Side by side with previous image
            </MenuItem>
            <MenuItem onClick={stackSeparately}>
              <Rows3 size={14} /> Stack one under another
            </MenuItem>

            <div className="my-1 border-t border-gray-100" />
            <MenuLabel>Align this group</MenuLabel>
            <MenuItem active={currentRowAlign === 'left'} onClick={() => setRowAlign('left')}>
              <AlignLeft size={14} /> Left
            </MenuItem>
            <MenuItem active={currentRowAlign === 'center'} onClick={() => setRowAlign('center')}>
              <AlignCenter size={14} /> Middle / Center
            </MenuItem>
            <MenuItem active={currentRowAlign === 'right'} onClick={() => setRowAlign('right')}>
              <AlignRight size={14} /> Right
            </MenuItem>

            <div className="my-1 border-t border-gray-100" />
            <MenuLabel>Single image placement</MenuLabel>
            <MenuItem onClick={() => setImageLayout('left')}><PanelLeft size={14} /> Image left + text</MenuItem>
            <MenuItem onClick={() => setImageLayout('right')}><PanelRight size={14} /> Image right + text</MenuItem>
            <MenuItem onClick={() => setImageLayout('top')}><Square size={14} /> Image on its own row</MenuItem>
            <MenuItem onClick={() => setImageLayout('center')}><AlignCenter size={14} /> Image centered</MenuItem>
            <MenuItem onClick={() => setImageLayout('wrap')}>Text wrap</MenuItem>
          </Menu>
        </div>

        {/* Image text — real editable text, uses normal toolbar formatting */}
        <div className="relative">
          <ToolbarBtn
            title="Text near image"
            active={menu === 'caption' || inImageText}
            onClick={() => {
              if (!imageSelected && !inImageText) {
                window.alert('Select an image first to add text near it.');
                return;
              }
              toggleMenu('caption');
            }}
          >
            <Type size={15} />
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'caption'} onClose={closeMenu} className="w-72">
            <MenuItem onClick={() => addTextNearImage('below')}>
              <Type size={14} /> Add text near image
            </MenuItem>
            <MenuItem onClick={removeTextNearImage}>
              <Trash2 size={14} /> Remove text near image
            </MenuItem>
            <div className="my-1 border-t border-gray-100" />
            <MenuLabel>Text position</MenuLabel>
            {CAPTION_POSITIONS.map((item) => (
              <MenuItem
                key={item.value}
                active={currentCaptionPos === item.value}
                onClick={() => setCaptionPos(item.value)}
              >
                {item.label}
              </MenuItem>
            ))}
            <div className="border-t border-gray-100 px-3 py-2 text-[11px] leading-snug text-gray-500">
              After adding text, click inside that text and use the top toolbar (font size, bold, italic, color, align) — same as normal text.
            </div>
          </Menu>
        </div>

        <div className="relative">
          <ToolbarBtn
            title="Image size"
            active={imageSelected || menu === 'img'}
            onClick={() => {
              if (!imageSelected) {
                window.alert('Select an image in the editor first.');
                return;
              }
              toggleMenu('img');
            }}
          >
            <ImageIcon size={15} />
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'img'} onClose={closeMenu} className="w-56">
            <div className="px-3 py-2">
              <p className="mb-1 text-[11px] text-gray-500">Width (px) — or drag image corners. Size follows your upload by default.</p>
              <div className="flex items-center gap-1">
                <input
                  value={customImageWidth || (editor.getAttributes('image')?.width ?? '')}
                  onChange={(e) => setCustomImageWidth(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="e.g. 280"
                  className="w-24 rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  onClick={() => setImageWidth(customImageWidth || editor.getAttributes('image')?.width)}
                >
                  Apply
                </button>
              </div>
            </div>
          </Menu>
        </div>

        {/* Cards */}
        <div className="relative">
          <ToolbarBtn title="Cards section" active={menu === 'cards' || inCardRow} onClick={() => toggleMenu('cards')}>
            <LayoutGrid size={15} />
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'cards'} onClose={closeMenu} className="w-72">
            <MenuItem
              onClick={() => {
                editor.chain().focus().insertCardRow('left').run();
                closeMenu();
              }}
            >
              <Plus size={14} /> Insert cards row
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (!editor.commands.addCardToRow()) {
                  window.alert('Click inside a cards row first, then add another card.');
                  return;
                }
                closeMenu();
              }}
            >
              <Plus size={14} /> Add another card
            </MenuItem>
            <div className="my-1 border-t border-gray-100" />
            <MenuLabel>Align cards row</MenuLabel>
            <MenuItem active={inCardRow && currentRowAlign === 'left'} onClick={() => setRowAlign('left')}>
              <AlignLeft size={14} /> Left
            </MenuItem>
            <MenuItem active={inCardRow && currentRowAlign === 'center'} onClick={() => setRowAlign('center')}>
              <AlignCenter size={14} /> Middle / Center
            </MenuItem>
            <MenuItem active={inCardRow && currentRowAlign === 'right'} onClick={() => setRowAlign('right')}>
              <AlignRight size={14} /> Right
            </MenuItem>
            <div className="border-t border-gray-100 px-3 py-2 text-[11px] leading-snug text-gray-500">
              Cards start empty. Use + Image / + Title / + Text on each card. Style text with the top toolbar — cards use the portal theme on the live site.
            </div>
          </Menu>
        </div>

        <div className="relative">
          <ToolbarBtn title="Text align" active={menu === 'align'} onClick={() => toggleMenu('align')}>
            <AlignLeft size={15} />
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'align'} onClose={closeMenu} className="w-40">
            <MenuItem active={editor.isActive({ textAlign: 'left' })} onClick={() => { editor.chain().focus().setTextAlign('left').run(); closeMenu(); }}>
              <AlignLeft size={14} /> Left
            </MenuItem>
            <MenuItem active={editor.isActive({ textAlign: 'center' })} onClick={() => { editor.chain().focus().setTextAlign('center').run(); closeMenu(); }}>
              <AlignCenter size={14} /> Center
            </MenuItem>
            <MenuItem active={editor.isActive({ textAlign: 'right' })} onClick={() => { editor.chain().focus().setTextAlign('right').run(); closeMenu(); }}>
              <AlignRight size={14} /> Right
            </MenuItem>
            <MenuItem active={editor.isActive({ textAlign: 'justify' })} onClick={() => { editor.chain().focus().setTextAlign('justify').run(); closeMenu(); }}>
              <AlignJustify size={14} /> Justify
            </MenuItem>
          </Menu>
        </div>

        <div className="relative">
          <ToolbarBtn title="Table" active={menu === 'table'} onClick={() => toggleMenu('table')}>
            <TableIcon size={15} />
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'table'} onClose={closeMenu} className="w-56">
            <MenuItem onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); closeMenu(); }}>
              <Plus size={14} /> Insert Table (3×3)
            </MenuItem>
            <div className="border-t border-gray-100 px-3 py-2">
              <p className="mb-1 text-[11px] text-gray-500">Cell background color</p>
              <div className="flex items-center gap-2">
                <input type="color" value={cellColor} onChange={(e) => setCellColor(e.target.value)} className="h-7 w-10 cursor-pointer rounded border border-gray-200" />
                <button type="button" disabled={!inTable} className="rounded bg-blue-600 px-2 py-1 text-xs text-white disabled:opacity-40" onClick={() => setCellBg(cellColor)}>
                  Apply
                </button>
              </div>
            </div>
            <MenuItem danger={!inTable} onClick={() => { if (inTable) { editor.chain().focus().addColumnBefore().run(); closeMenu(); } }}><span className={!inTable ? 'opacity-40' : ''}>Add Column Before</span></MenuItem>
            <MenuItem onClick={() => { if (inTable) { editor.chain().focus().addColumnAfter().run(); closeMenu(); } }}><span className={!inTable ? 'opacity-40' : ''}>Add Column After</span></MenuItem>
            <MenuItem onClick={() => { if (inTable) { editor.chain().focus().deleteColumn().run(); closeMenu(); } }}>
              <Trash2 size={14} className="text-red-500" /> <span className={`text-red-600 ${!inTable ? 'opacity-40' : ''}`}>Delete Column</span>
            </MenuItem>
            <MenuItem onClick={() => { if (inTable) { editor.chain().focus().addRowBefore().run(); closeMenu(); } }}><span className={!inTable ? 'opacity-40' : ''}>Add Row Before</span></MenuItem>
            <MenuItem onClick={() => { if (inTable) { editor.chain().focus().addRowAfter().run(); closeMenu(); } }}><span className={!inTable ? 'opacity-40' : ''}>Add Row After</span></MenuItem>
            <MenuItem onClick={() => { if (inTable) { editor.chain().focus().deleteRow().run(); closeMenu(); } }}>
              <Trash2 size={14} className="text-red-500" /> <span className={`text-red-600 ${!inTable ? 'opacity-40' : ''}`}>Delete Row</span>
            </MenuItem>
            <MenuItem onClick={() => { if (inTable) { editor.chain().focus().deleteTable().run(); closeMenu(); } }}>
              <Trash2 size={14} className="text-red-500" /> <span className={`text-red-600 ${!inTable ? 'opacity-40' : ''}`}>Delete Table</span>
            </MenuItem>
          </Menu>
        </div>

        <ToolbarBtn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={15} />
        </ToolbarBtn>

        <ToolbarBtn
          title="Preview"
          active={showPreview}
          onClick={() => {
            if (showSource) applySource();
            setShowPreview((v) => !v);
            setShowSource(false);
            closeMenu();
          }}
        >
          <Eye size={15} />
        </ToolbarBtn>
        <ToolbarBtn title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} active={isFullscreen} onClick={() => setIsFullscreen((v) => !v)}>
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </ToolbarBtn>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarBtn
          title="Visual editor"
          active={!showSource && !showPreview}
          onClick={() => {
            if (showSource) applySource();
            setShowSource(false);
            setShowPreview(false);
          }}
        >
          <FileText size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Code view"
          active={showSource}
          onClick={() => {
            if (showSource) applySource();
            else {
              setSourceHtml(editor.getHTML());
              setShowSource(true);
              setShowPreview(false);
            }
          }}
        >
          <Code2 size={15} />
        </ToolbarBtn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPickImage(file);
            e.target.value = '';
          }}
        />
        <input
          ref={sideBySideInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            insertSideBySideFromFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={addBesideInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addImagesBeside(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {showPreview ? (
        <div
          className={`blog-desc-preview ${BLOG_RENDERED_CONTENT_CLASS}`}
          dangerouslySetInnerHTML={{ __html: sanitizeBlogEditorHtml(editor.getHTML()) }}
        />
      ) : showSource ? (
        <textarea
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
          onBlur={applySource}
          rows={isFullscreen ? 30 : 14}
          className="w-full flex-1 resize-y border-0 bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-gray-900 outline-none"
          spellCheck={false}
        />
      ) : (
        <div className={isFullscreen ? 'flex-1 overflow-auto' : ''}>
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
