'use client';

import { LucideIconByName } from './IconPicker';
import { buildMediaUrl, isHttpUrl } from '@/utils/imagehelper';
import { sanitizeBlogEditorHtml } from '@/lib/sanitizeBlogEditorHtml';
import {
  BLOG_RENDERED_CONTENT_CLASS,
  BLOG_RENDERED_CONTENT_CSS,
} from '@/lib/blogContentStyles';

function mediaSrc(src) {
  if (!src) return '';
  if (src.startsWith('blob:') || isHttpUrl(src)) return src;
  return buildMediaUrl(src);
}

function hasHtml(html) {
  const text = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return text.length > 0;
}

function RatioFrame({ ratio }) {
  const [w, h] = String(ratio || '1:1')
    .split(':')
    .map((n) => Number(n) || 1);
  const max = Math.max(w, h);
  return (
    <div className="flex h-24 items-center justify-center">
      <div
        className="rounded-md border border-[rgba(201,168,76,0.45)] bg-[rgba(201,168,76,0.08)]"
        style={{
          width: `${(w / max) * 64}px`,
          height: `${(h / max) * 64}px`,
        }}
      />
    </div>
  );
}

export default function LandingPagePreview({ page }) {
  if (!page) return null;

  const hero = page.hero || {};
  const why = page.why || {};
  const article = page.article || {};
  const generateCards = page.generate_cards || [];
  const visuals = page.visuals || [];
  const ratios = page.aspect_ratios || [];
  const ecommerce = page.ecommerce_use_cases || [];
  const faqs = page.faqs || [];
  const whyBody = why.body || why.intro || '';
  const topic = page.primary_keyword || page.name || '';

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#0E0D09] text-[#F2EDD8] shadow-sm">
      <style>{BLOG_RENDERED_CONTENT_CSS}</style>
      <div className="border-b border-[rgba(201,168,76,0.28)] bg-[#161410] px-4 py-2 text-center text-xs tracking-wide text-[#C9A84C]">
        Admin preview — {page.status || 'Draft'}
        {page.path ? ` · ${page.path}` : ''}
      </div>

      <section className="px-6 py-10 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            {why.eyebrow || topic ? (
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]">
                {why.eyebrow || topic}
              </p>
            ) : null}
            <h1 className="mb-4 text-4xl font-normal leading-tight md:text-5xl">{hero.title || page.name}</h1>
            {hero.tagline ? (
              <p className="max-w-2xl text-base font-light leading-relaxed text-[rgba(242,237,216,0.58)] md:text-lg">
                {hero.tagline}
              </p>
            ) : null}
          </div>
          {hero.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaSrc(hero.image)} alt="" className="w-full rounded-2xl object-cover" />
          ) : null}
        </div>
      </section>

      {why.title || hasHtml(whyBody) ? (
        <section className="space-y-6 px-6 py-8 md:px-10">
          {why.title ? <h2 className="text-3xl font-normal">{why.title}</h2> : null}
          {hasHtml(whyBody) ? (
            <div
              className={`${BLOG_RENDERED_CONTENT_CLASS} text-[rgba(242,237,216,0.85)]`}
              dangerouslySetInnerHTML={{ __html: sanitizeBlogEditorHtml(whyBody) }}
            />
          ) : null}
        </section>
      ) : null}

      {generateCards.length > 0 ? (
        <section className="px-6 py-8 md:px-10">
          <h2 className="mb-3 text-center text-3xl font-normal">
            {page.generate_title || `What We Generate for ${topic}`}
          </h2>
          {page.generate_subtitle ? (
            <p className="mx-auto mb-8 max-w-3xl text-center font-light text-[rgba(242,237,216,0.58)]">
              {page.generate_subtitle}
            </p>
          ) : null}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {generateCards.map((card) => (
              <article key={card.id} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#C9A84C]">
                  <LucideIconByName name={card.icon} className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-xl">{card.title}</h3>
                <p className="text-sm font-light text-[rgba(242,237,216,0.58)]">{card.tagline}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {visuals.length > 0 ? (
        <section className="px-6 py-8 md:px-10">
          <h2 className="mb-3 text-center text-3xl font-normal">
            {page.visuals_title || `Themes for ${topic}`}
          </h2>
          {page.visuals_subtitle ? (
            <p className="mx-auto mb-8 max-w-3xl text-center font-light text-[rgba(242,237,216,0.58)]">
              {page.visuals_subtitle}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visuals.map((visual) => (
              <figure key={visual.id || visual.image} className="overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaSrc(visual.image)} alt={visual.name || ''} className="h-48 w-full object-cover" />
                {visual.name ? (
                  <figcaption className="mt-2 text-sm text-[rgba(242,237,216,0.7)]">{visual.name}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {ratios.length > 0 ? (
        <section className="px-6 py-8 md:px-10">
          <h2 className="mb-8 text-center text-3xl font-normal">Available Aspect Ratios</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {ratios.map((ratio) => (
              <article
                key={ratio.id || ratio.ratio}
                className="rounded-2xl border border-white/10 bg-[#161410] p-4 text-center"
              >
                <p className="mb-2 text-sm text-[#C9A84C]">{ratio.ratio}</p>
                <RatioFrame ratio={ratio.ratio} />
                <h3 className="mt-2 text-lg">{ratio.name}</h3>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-[rgba(242,237,216,0.45)]">
                  {ratio.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {article.title || hasHtml(article.body) ? (
        <section className="space-y-6 px-6 py-8 md:px-10">
          {article.title ? <h2 className="text-3xl font-normal">{article.title}</h2> : null}
          {hasHtml(article.body) ? (
            <div
              className={`${BLOG_RENDERED_CONTENT_CLASS} text-[rgba(242,237,216,0.85)]`}
              dangerouslySetInnerHTML={{ __html: sanitizeBlogEditorHtml(article.body) }}
            />
          ) : null}
        </section>
      ) : null}

      {ecommerce.length > 0 ? (
        <section className="px-6 py-8 md:px-10">
          <h2 className="mb-3 text-center text-3xl font-normal">
            {page.ecommerce_title || 'Ecommerce Ready Visuals'}
          </h2>
          {page.ecommerce_subtitle ? (
            <p className="mx-auto mb-8 max-w-3xl text-center font-light text-[rgba(242,237,216,0.58)]">
              {page.ecommerce_subtitle}
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ecommerce.map((card) => (
              <article key={card.id} className="rounded-2xl border border-white/10 bg-[#161410] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(201,168,76,0.12)] text-[#C9A84C]">
                  <LucideIconByName name={card.icon} className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-xl">{card.title}</h3>
                <p className="font-light leading-relaxed text-[rgba(242,237,216,0.58)]">{card.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {faqs.length > 0 ? (
        <section className="space-y-4 px-6 py-8 md:px-10">
          <h2 className="text-3xl font-normal">{page.faq_title || 'Frequently Asked Questions'}</h2>
          {faqs.map((faq) => (
            <div key={faq.id || faq.question} className="rounded-xl border border-white/10 bg-[#161410] p-4">
              <h3 className="mb-2 font-medium">{faq.question}</h3>
              <p className="text-sm font-light text-[rgba(242,237,216,0.58)]">{faq.answer}</p>
            </div>
          ))}
        </section>
      ) : null}

      {page.cta?.title || page.cta?.tagline ? (
        <section className="px-6 py-12 text-center md:px-10">
          {page.cta?.title ? <h2 className="mb-4 text-4xl font-normal">{page.cta.title}</h2> : null}
          {page.cta?.tagline ? (
            <p className="mx-auto max-w-2xl font-light text-[rgba(242,237,216,0.58)]">{page.cta.tagline}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
