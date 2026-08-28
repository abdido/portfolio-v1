import React from 'react';
import { X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { getLocalizedProject } from '../utils/langHelper';
import { IconGithub } from './SocialIcons';

const ProjectModal = () => {
  const { selectedProject, setSelectedProject, language, t } = usePortfolio();

  const item = getLocalizedProject(selectedProject, language);

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ color: 'var(--accent-color)', background: 'var(--accent-light)', border: 'none' }}>
                {item.category}
              </span>
              {item.featured && (
                <span className="badge" style={{ background: 'var(--accent-color)', color: '#fff', border: 'none' }}>
                  {t('modalBadgeFeatured')}
                </span>
              )}
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700 }}>
              {item.title}
            </h2>
          </div>
          <button className="modal-close" onClick={() => setSelectedProject(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.75rem', background: 'var(--bg-card)' }}>
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem', background: 'var(--bg-card)', padding: '1.15rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {item.client && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{t('lblClient')}</span>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>{item.client}</p>
              </div>
            )}
            {item.year && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{t('lblYear')}</span>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem' }}>{item.year}</p>
              </div>
            )}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Category</span>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem', color: 'var(--accent-color)' }}>{item.category}</p>
            </div>
          </div>

          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.65rem' }}>
            {t('modalOverviewTitle')}
          </h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.975rem', marginBottom: '1.75rem' }}>
            {item.description || item.summary}
          </p>

          {item.features && item.features.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                {t('modalFeaturesTitle')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {item.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--success-color)', flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.65rem' }}>
            {t('modalTechTitle')}
          </h4>
          <div className="project-tags" style={{ marginBottom: '2rem' }}>
            {item.tags?.map((t, i) => (
              <span key={i} className="badge" style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}>
                {t}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            {item.githubUrl && (
              <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <IconGithub size={16} /> {t('modalRepoBtn')}
              </a>
            )}
            {item.liveUrl && (
              <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <ExternalLink size={16} /> {t('modalDemoBtn')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
