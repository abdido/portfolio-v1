import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import { renderRichContent } from '../utils/richText';

const ArticleReaderModal = () => {
  const { selectedArticle, setSelectedArticle } = usePortfolio();

  if (!selectedArticle) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge" style={{ color: 'var(--accent-color)' }}>
                {selectedArticle.category}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={13} /> {selectedArticle.date}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={13} /> {selectedArticle.readTime || '5 min'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedArticle.title}</h2>
          </div>
          <button className="modal-close" onClick={() => setSelectedArticle(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-color)', marginBottom: '1.5rem', fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            "{selectedArticle.excerpt}"
          </div>

          <div
            className="article-content-body"
            dangerouslySetInnerHTML={{ __html: renderRichContent(selectedArticle.content) }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tag Terkait:</span>
            {selectedArticle.tags?.map((t, i) => (
              <span key={i} className="badge">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleReaderModal;
