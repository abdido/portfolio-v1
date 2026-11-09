import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import { getLocalizedArticle } from '../utils/langHelper';

const BlogCard = ({ article }) => {
  const { openArticleDetail, language, t } = usePortfolio();

  const item = getLocalizedArticle(article, language);

  return (
    <div className="blog-card" onClick={() => openArticleDetail(article)} style={{ cursor: 'pointer' }}>
      <div className="blog-meta">
        <span className="badge" style={{ color: 'var(--accent-color)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {item.category}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 'auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
            <Calendar size={13} /> {item.date}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
            <Clock size={13} /> {item.readTime || '5 min'}
          </span>
        </div>
      </div>

      <h3 className="blog-title"><a href={`/blog/${article.slug || article.id}`} onClick={e => { e.preventDefault(); e.stopPropagation(); openArticleDetail(article); }}>{item.title}</a></h3>
      <p className="blog-excerpt">{item.excerpt}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {item.tags?.slice(0, 2).map((t, i) => (
            <span key={i} className="badge" style={{ fontSize: '0.7rem' }}>
              #{t}
            </span>
          ))}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {t('btnReadArticle')} <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
};

export default BlogCard;
