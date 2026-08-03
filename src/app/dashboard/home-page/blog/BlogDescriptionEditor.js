'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Node } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { StarterKit } from '@tiptap/starter-kit';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { BulletList, OrderedList } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extension-placeholder';
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
} from 'lucide-react';
import {
  BLOG_RENDERED_CONTENT_CLASS,
  BLOG_RENDERED_CONTENT_CSS,
} from '@/lib/blogContentStyles';

const ICON = '#3B82F6';

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

const LAYOUT_CSS = {
  left: 'float:left;margin:0 1rem 0.85rem 0;',
  right: 'float:right;margin:0 0 0.85rem 1rem;',
  top: 'display:block;float:none;margin:0.85rem 0;clear:both;',
  wrap: 'float:left;margin:0 1rem 0.85rem 0;',
};

function clampImageWidth(w, maxW = 1400) {
  const n = Math.round(Number(w) || 0);
  return Math.max(40, Math.min(n, maxW));
}

/** Side-by-side image strip — drop images next to each other into this row. */
const ImageRow = Node.create({
  name: 'imageRow',
  group: 'block',
  content: 'image{1,4}',
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-image-row]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        ...HTMLAttributes,
        'data-image-row': '',
        class: 'blog-image-row',
        style: 'display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;margin:0.85rem 0;clear:both;',
      },
      0,
    ];
  },

  addCommands() {
    return {
      setImageRow:
        (images) =>
        ({ commands }) => {
          const content = (images || []).slice(0, 4).map((attrs) => ({
            type: 'image',
            attrs: {
              src: attrs.src,
              alt: attrs.alt || '',
              width: clampImageWidth(attrs.width || 320, 700),
              layout: 'top',
            },
          }));
          if (content.length < 2) return false;
          return commands.insertContent({ type: this.name, content });
        },
    };
  },
});

function findImageNearPos(doc, pos) {
  const $pos = doc.resolve(Math.max(0, Math.min(pos, doc.content.size)));
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type.name === 'image') {
      return { pos: $pos.before(depth), node };
    }
    if (node.type.name === 'imageRow') {
      return { pos: $pos.before(depth), node, isRow: true };
    }
  }
  // Check node right after / before
  const after = $pos.nodeAfter;
  if (after?.type.name === 'image') return { pos: $pos.pos, node: after };
  if (after?.type.name === 'imageRow') return { pos: $pos.pos, node: after, isRow: true };
  const before = $pos.nodeBefore;
  if (before?.type.name === 'image') return { pos: $pos.pos - before.nodeSize, node: before };
  if (before?.type.name === 'imageRow') {
    return { pos: $pos.pos - before.nodeSize, node: before, isRow: true };
  }
  return null;
}

function extractImageNodes(slice) {
  const images = [];
  slice.content.descendants((node) => {
    if (node.type.name === 'image' && node.attrs?.src) {
      images.push(node);
      return false;
    }
    return true;
  });
  return images;
}

function placeBesideOnDrop(view, event, slice, moved) {
  const images = extractImageNodes(slice);
  if (!images.length) return false;

  const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
  if (!coords) return false;

  const { state } = view;
  let target = findImageNearPos(state.doc, coords.pos);
  if (!target) return false;

  // Prefer a concrete image under the pointer (not only row wrapper)
  if (target.isRow) {
    let offset = target.pos + 1;
    let best = null;
    target.node.forEach((child) => {
      if (child.type.name === 'image') {
        const dom = view.nodeDOM(offset);
        if (dom?.getBoundingClientRect) {
          const r = dom.getBoundingClientRect();
          if (
            event.clientX >= r.left - 12 &&
            event.clientX <= r.right + 12 &&
            event.clientY >= r.top - 12 &&
            event.clientY <= r.bottom + 12
          ) {
            best = { pos: offset, node: child };
          }
        }
      }
      offset += child.nodeSize;
    });
    if (best) target = best;
  }

  const targetDom = view.nodeDOM(target.pos);
  if (!targetDom || typeof targetDom.getBoundingClientRect !== 'function') return false;

  const rect = targetDom.getBoundingClientRect();
  const nearY = event.clientY >= rect.top - 28 && event.clientY <= rect.bottom + 28;
  const nearX = event.clientX >= rect.left - 28 && event.clientX <= rect.right + 28;
  if (!nearY || !nearX) return false;

  // Dropping on the same node → let ProseMirror do a normal move
  if (moved && state.selection instanceof NodeSelection && state.selection.from === target.pos) {
    return false;
  }

  const onLeft = event.clientX < rect.left + rect.width * 0.5;
  event.preventDefault();

  const imageType = state.schema.nodes.image;
  const rowType = state.schema.nodes.imageRow;
  if (!imageType || !rowType) return false;

  const dropped = images.map((img) =>
    imageType.create({
      ...img.attrs,
      layout: 'top',
      width: clampImageWidth(img.attrs.width || 320, 700),
    })
  );

  let tr = state.tr;
  if (moved && !state.selection.empty) {
    tr = tr.deleteSelection();
  }

  let insertPos = tr.mapping.map(target.pos);
  let targetNode = tr.doc.nodeAt(insertPos);
  if (!targetNode || (targetNode.type.name !== 'image' && targetNode.type.name !== 'imageRow')) {
    const found = findImageNearPos(tr.doc, insertPos);
    if (!found) return false;
    insertPos = found.pos;
    targetNode = found.node;
  }

  if (targetNode.type.name === 'imageRow') {
    const kids = [];
    targetNode.forEach((child) => {
      if (child.type.name === 'image') kids.push(child);
    });
    const merged = onLeft ? [...dropped, ...kids] : [...kids, ...dropped];
    const row = rowType.create(
      null,
      merged.slice(0, 4).map((n) =>
        imageType.create({
          ...n.attrs,
          layout: 'top',
          width: clampImageWidth(n.attrs.width || 320, 700),
        })
      )
    );
    tr = tr.replaceWith(insertPos, insertPos + targetNode.nodeSize, row);
  } else if (targetNode.type.name === 'image') {
    const targetImg = imageType.create({
      ...targetNode.attrs,
      layout: 'top',
      width: clampImageWidth(targetNode.attrs.width || 320, 700),
    });
    const rowChildren = onLeft ? [...dropped, targetImg] : [targetImg, ...dropped];
    tr = tr.replaceWith(
      insertPos,
      insertPos + targetNode.nodeSize,
      rowType.create(null, rowChildren.slice(0, 4))
    );
  } else {
    return false;
  }

  view.dispatch(tr.scrollIntoView());
  return true;
}

const CustomImage = TiptapImage.extend({
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 360,
        parseHTML: (el) => {
          const w =
            el.getAttribute('width') ||
            el.getAttribute('data-width') ||
            (el.style?.width || '').replace(/px$/i, '');
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
        parseHTML: (el) => el.getAttribute('data-layout') || 'top',
        renderHTML: (attrs) => ({
          'data-layout': attrs.layout || 'top',
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const layout = HTMLAttributes['data-layout'] || 'top';
    const width = HTMLAttributes.width || HTMLAttributes['data-width'] || 360;
    const { style: _s, class: _c, ...rest } = HTMLAttributes;
    return [
      'img',
      {
        ...rest,
        class: `blog-img blog-img-${layout}`,
        'data-layout': layout,
        width: String(width),
        'data-width': String(width),
        style: `${LAYOUT_CSS[layout] || LAYOUT_CSS.top}width:${width}px;max-width:100%;height:auto;border-radius:0.375rem;`,
      },
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const outer = document.createElement('div');
      outer.className = `blog-img-node blog-img-node--${node.attrs.layout || 'top'}`;
      outer.contentEditable = 'false';
      // Entire card is a TipTap drag handle so repositioning is easy
      outer.setAttribute('data-drag-handle', '');
      outer.draggable = true;

      const toolbar = document.createElement('div');
      toolbar.className = 'blog-img-toolbar';

      const dragBtn = document.createElement('span');
      dragBtn.className = 'blog-img-drag';
      dragBtn.setAttribute('data-drag-handle', '');
      dragBtn.draggable = true;
      dragBtn.contentEditable = 'false';
      dragBtn.title = 'Drag to move — drop on another image (left/right) to place side by side';
      dragBtn.textContent = '⠿ Move';

      const sizeLabel = document.createElement('span');
      sizeLabel.className = 'blog-img-size-label';

      toolbar.appendChild(dragBtn);
      toolbar.appendChild(sizeLabel);

      const frame = document.createElement('div');
      frame.className = 'blog-img-frame';

      const img = document.createElement('img');
      img.src = node.attrs.src || '';
      img.alt = node.attrs.alt || '';
      img.draggable = false;

      const handles = ['nw', 'ne', 'sw', 'se', 'e', 'w'].map((dir) => {
        const h = document.createElement('span');
        h.className = `blog-img-handle blog-img-handle--${dir}`;
        h.dataset.dir = dir;
        h.title = 'Drag to resize';
        h.draggable = false;
        frame.appendChild(h);
        return h;
      });

      frame.appendChild(img);
      outer.appendChild(toolbar);
      outer.appendChild(frame);

      const applyChrome = (attrs) => {
        const layout = attrs.layout || 'top';
        const width = clampImageWidth(attrs.width || 360);
        const inRow = Boolean(outer.closest?.('.blog-image-row, [data-image-row]'));
        outer.className = `blog-img-node blog-img-node--${layout}${inRow ? ' in-row' : ''}`;
        // Editor always uses block flow so drag/drop positioning works reliably.
        // Float styles are still written to HTML via renderHTML for the live site.
        outer.style.cssText = inRow
          ? `float:none;display:block;margin:0;width:${width}px;max-width:100%;`
          : `display:block;float:none;clear:both;margin:0.85rem 0;width:${width}px;max-width:100%;`;
        outer.dataset.width = String(width);
        outer.dataset.layout = layout;
        sizeLabel.textContent = `${width}px · drag to move`;
        img.style.cssText = 'display:block;width:100%;height:auto;border-radius:0.375rem;pointer-events:none;';
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

      outer.addEventListener('click', (e) => {
        if (e.target.closest('.blog-img-handle')) return;
        if (typeof getPos === 'function') {
          const pos = getPos();
          if (typeof pos === 'number') editor.commands.setNodeSelection(pos);
        }
      });

      outer.addEventListener('dragstart', (e) => {
        if (resizing || e.target.closest?.('.blog-img-handle')) {
          e.preventDefault();
          return;
        }
        if (typeof getPos === 'function') {
          const pos = getPos();
          if (typeof pos === 'number') editor.commands.setNodeSelection(pos);
        }
        outer.classList.add('is-dragging');
      });

      outer.addEventListener('dragend', () => {
        outer.classList.remove('is-dragging');
        // Refresh in-row class after possible row merge
        applyChrome({
          layout: outer.dataset.layout || 'top',
          width: outer.dataset.width || 360,
        });
      });

      return {
        dom: outer,
        // Let ProseMirror/TipTap handle drag & drop; we only steal resize events
        stopEvent: (event) => {
          if (event.target?.closest?.('.blog-img-handle')) return true;
          if (resizing) return true;
          return false;
        },
        ignoreMutation: () => true,
        selectNode: () => outer.classList.add('is-selected'),
        deselectNode: () => outer.classList.remove('is-selected'),
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

export default function BlogDescriptionEditor({ value = '', onChange, onInlineImage, error }) {
  const [menu, setMenu] = useState(null);
  const [showSource, setShowSource] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(value || '');
  const [customSize, setCustomSize] = useState('');
  const [customImageWidth, setCustomImageWidth] = useState('');
  const [cellColor, setCellColor] = useState('#fef08a');
  const [, setSelTick] = useState(0);
  const fileInputRef = useRef(null);
  const syncingFromProp = useRef(false);

  const closeMenu = useCallback(() => setMenu(null), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        },
        bulletList: false,
        orderedList: false,
      }),
      StyledBulletList,
      StyledOrderedList,
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      ImageRow,
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
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      if (syncingFromProp.current) return;
      const html = ed.getHTML();
      onChange?.(html);
      if (!showSource) setSourceHtml(html);
    },
    editorProps: {
      attributes: { class: 'blog-desc-prosemirror focus:outline-none text-gray-900' },
      handleDrop: (view, event, slice, moved) => placeBesideOnDrop(view, event, slice, moved),
    },
  });

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
    if ((value || '') === editor.getHTML()) return;
    syncingFromProp.current = true;
    editor.commands.setContent(value || '', { emitUpdate: false });
    setSourceHtml(value || '');
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

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL', prev || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    closeMenu();
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
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { layout }).run();
    } else {
      window.alert('Select an image first, or upload an image then choose layout.');
    }
    closeMenu();
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

  const onPickImage = async (file) => {
    if (!file || !editor) return;
    if (!String(file.type || '').startsWith('image/')) {
      window.alert('Please choose an image file');
      return;
    }
    let src = null;
    if (typeof onInlineImage === 'function') {
      src = await onInlineImage(file);
    } else {
      src = URL.createObjectURL(file);
    }
    if (!src) return;
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'image',
          attrs: { src, alt: file.name || 'image', layout: 'top', width: 360 },
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
    editor.commands.setContent(sourceHtml || '', { emitUpdate: true });
    onChange?.(sourceHtml || '');
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
          display: block;
          margin: 0 !important;
          clear: none !important;
        }
        .blog-desc-prosemirror .blog-image-row,
        .blog-desc-prosemirror div[data-image-row] {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-start;
          margin: 0.85rem 0;
          clear: both;
          width: 100%;
        }
        .blog-desc-prosemirror .blog-image-row .blog-img-node {
          float: none !important;
        }
        .blog-desc-prosemirror .ProseMirror-selectednode.blog-img-node,
        .blog-desc-prosemirror .blog-img-node.is-selected {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 0.45rem;
        }
        .blog-desc-prosemirror .blog-img-toolbar {
          display: none;
          align-items: center;
          gap: 6px;
          position: absolute;
          left: 6px;
          top: 6px;
          z-index: 8;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.78);
          color: #fff;
          font-size: 11px;
          line-height: 1;
          pointer-events: none;
        }
        .blog-desc-prosemirror .blog-img-node.is-selected .blog-img-toolbar,
        .blog-desc-prosemirror .blog-img-node:hover .blog-img-toolbar {
          display: inline-flex;
        }
        .blog-desc-prosemirror .blog-img-drag {
          cursor: grab;
          user-select: none;
          font-size: 12px;
          padding: 2px 4px;
          border-radius: 4px;
          letter-spacing: 0.02em;
        }
        .blog-desc-prosemirror .blog-img-drag:active { cursor: grabbing; }
        .blog-desc-prosemirror .blog-img-size-label {
          opacity: 0.9;
          font-family: ui-sans-serif, system-ui, sans-serif;
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
        .blog-desc-preview .blog-image-row,
        .blog-desc-preview div[data-image-row] {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-start;
          margin: 0.85rem 0;
          clear: both;
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

        {/* Font size */}
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

        {/* Paragraph */}
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

        {/* Bullet styles */}
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

        {/* Ordered styles */}
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

        <ToolbarBtn title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().setParagraph().run()}>
          <span className="text-[11px] font-bold tracking-tight">T<sub className="text-[8px]">x</sub></span>
        </ToolbarBtn>

        <div className="relative">
          <ToolbarBtn title="Upload image" onClick={() => fileInputRef.current?.click()}>
            <ImagePlus size={15} />
          </ToolbarBtn>
        </div>
        <div className="relative">
          <ToolbarBtn
            title="Image options"
            active={editor.isActive('image') || menu === 'img'}
            onClick={() => {
              if (!editor.isActive('image')) {
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
            <MenuItem onClick={() => setImageLayout('left')}><PanelLeft size={14} /> Image Left + text right</MenuItem>
            <MenuItem onClick={() => setImageLayout('right')}><PanelRight size={14} /> Image Right + text left</MenuItem>
            <MenuItem onClick={() => setImageLayout('top')}><Square size={14} /> Image Top</MenuItem>
            <MenuItem onClick={() => setImageLayout('wrap')}>Text Wrap</MenuItem>
            <div className="my-1 border-t border-gray-100" />
            <div className="px-3 py-2">
              <p className="mb-1 text-[11px] text-gray-500">Any width (px) — or drag image corners</p>
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
              <p className="mt-2 text-[11px] text-gray-500">Use ⠿ on the image to drag/move it in the content.</p>
            </div>
          </Menu>
        </div>

        {/* Text align */}
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

        {/* Image layout / blocks */}
        <div className="relative">
          <ToolbarBtn title="Image layout" active={menu === 'layout'} onClick={() => toggleMenu('layout')}>
            <Columns2 size={15} />
            <ChevronDown size={11} />
          </ToolbarBtn>
          <Menu open={menu === 'layout'} onClose={closeMenu} className="w-56">
            <MenuItem onClick={() => setImageLayout('left')}>
              <span className="flex w-8 gap-0.5"><span className="h-6 w-3 rounded bg-blue-200" /><span className="flex flex-1 flex-col justify-center gap-0.5"><i className="block h-0.5 bg-gray-300" /><i className="block h-0.5 bg-gray-300" /></span></span>
              Image Left
            </MenuItem>
            <MenuItem onClick={() => setImageLayout('right')}>
              <span className="flex w-8 gap-0.5"><span className="flex flex-1 flex-col justify-center gap-0.5"><i className="block h-0.5 bg-gray-300" /><i className="block h-0.5 bg-gray-300" /></span><span className="h-6 w-3 rounded bg-blue-200" /></span>
              Image Right
            </MenuItem>
            <MenuItem onClick={() => setImageLayout('top')}>
              <span className="flex w-8 flex-col gap-0.5"><span className="h-3 w-full rounded bg-blue-200" /><i className="block h-0.5 bg-gray-300" /><i className="block h-0.5 bg-gray-300" /></span>
              Image Top
            </MenuItem>
            <MenuItem onClick={() => setImageLayout('wrap')}>
              Text Wrap
            </MenuItem>
            <div className="border-t border-gray-100 px-3 py-2 text-[11px] leading-snug text-gray-500">
              Drag an image anywhere to move it. Drop onto another image (left or right half) to place them side by side.
            </div>
          </Menu>
        </div>

        {/* Slider excluded */}

        {/* Table */}
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
      </div>

      {showPreview ? (
        <div
          className={`blog-desc-preview ${BLOG_RENDERED_CONTENT_CLASS}`}
          dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
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
