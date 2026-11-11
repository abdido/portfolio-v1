import React, { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Share2, Tag, BookOpen } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import { getLocalizedArticle } from '../utils/langHelper';
import { renderRichContent } from '../utils/richText';
import BlogCard from '../components/BlogCard';

const ArticleDetailPage = () => {
  const { selectedArticle, articles, profile, navigateTo, showToast, t, language } = usePortfolio();

  const item = getLocalizedArticle(selectedArticle, language);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArticle]);

  // Fallback if no article selected or article is hidden
  if (!item || selectedArticle?.hidden) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2>{language === 'EN' ? 'Article Not Found' : 'Artikel Tidak Ditemukan'}</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem' }}>
          {language === 'EN' ? 'This article is not available or has been taken down.' : 'Artikel ini tidak tersedia atau telah dinonaktifkan.'}
        </p>
        <button onClick={() => navigateTo('blog')} className="btn btn-primary">
          <ArrowLeft size={16} /> {t('btnBackToArticles')}
        </button>
      </div>
    );
  }

  // Related articles in same category or recent
  const relatedArticles = articles
    .filter(a => a.id !== item.id && !a.hidden)
    .slice(0, 2);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(language === 'EN' ? 'Article link copied.' : 'Tautan artikel disalin.');
    } catch { showToast(language === 'EN' ? 'Unable to copy. Copy the address from your browser.' : 'Tidak dapat menyalin. Salin alamat dari browser.', 'error'); }
  };

  return (
    <div className="page-wrapper container">
      {/* Top Back Navigation Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigateTo('blog')}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> {t('btnBackToArticles')}
        </button>
      </div>

      {/* Main Article Container */}
      <article style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Article Meta Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span className="badge" style={{ color: 'var(--accent-color)', background: 'var(--accent-light)', border: 'none', fontSize: '0.8rem', padding: '0.3rem 0.85rem' }}>
              {item.category}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> {item.date}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> {item.readTime || '5 min'}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            {item.title}
          </h1>

          {/* Author info & Share button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={profile.avatar}
                alt={profile.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-color)' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{profile.name}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{profile.role}</div>
              </div>
            </div>

            <button onClick={handleShare} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
              <Share2 size={14} /> {t('lblShareArticle')}
            </button>
          </div>
        </div>

        {/* Featured Excerpt Box */}
        <div style={{ background: 'var(--bg-card)', borderLeft: '4px solid var(--accent-color)', padding: '1.25rem 1.5rem', borderRadius: '0 var(--radius-md) var(--radius-md) 0', marginBottom: '2.5rem', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          "{item.excerpt}"
        </div>

        {/* Rich Article Body Content */}
        <div
          className="article-content-body"
          dangerouslySetInnerHTML={{ __html: renderRichContent(item.content) }}
        />

        {/* Tags Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.5rem' }}>
            <Tag size={14} /> {t('lblRelatedTopics')}
          </span>
          {item.tags?.map((t, i) => (
            <span key={i} className="badge" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
              #{t}
            </span>
          ))}
        </div>
      </article>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3.5rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>
              {t('lblRelatedArticlesTitle')}
            </h3>
            <button onClick={() => navigateTo('blog')} className="btn btn-secondary btn-sm">
              {t('lblViewAll')}
            </button>
          </div>

          <div className="blog-grid">
            {relatedArticles.map(art => (
              <BlogCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ArticleDetailPage;
