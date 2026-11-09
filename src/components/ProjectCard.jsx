import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import { getLocalizedProject } from '../utils/langHelper';
import { IconGithub } from './SocialIcons';

const ProjectCard = ({ project, layout = 'grid' }) => {
  const { setSelectedProject, language, t } = usePortfolio();

  const item = getLocalizedProject(project, language);

  if (layout === 'horizontal') {
    return (
      <div className="work-card-horizontal" onClick={() => setSelectedProject(project)}>
        <div className="work-card-content">
          {item.client && (
            <div className="work-card-client">
              {t('lblClient')}: {item.client} — {item.year}
            </div>
          )}
          <h3 className="work-card-title">{item.title}</h3>
          <p className="work-card-summary">{item.summary}</p>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {item.tags?.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="badge">
                {tag}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}
              className="btn btn-primary btn-sm"
            >
              <span>Case Study</span>
              <ArrowRight size={14} />
            </button>
            {item.liveUrl && (
              <a
                href={item.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink size={14} />
                <span>{t('btnLiveDemo')}</span>
              </a>
            )}
          </div>
        </div>

        <div className="work-card-media">
          <img src={item.image} alt={item.title} className="work-card-img" loading="lazy" />
        </div>
      </div>
    );
  }

  return (
    <div className="project-card" onClick={() => setSelectedProject(project)}>
      <div className="project-img-wrapper">
        <img src={item.image} alt={item.title} className="project-img" loading="lazy" />
        {item.featured && <span className="project-featured-badge">{t('modalBadgeFeatured')}</span>}
      </div>

      <div className="project-body">
        <div className="project-category">{item.category}</div>
        <h3 className="project-title"><button className="text-button" onClick={e => { e.stopPropagation(); setSelectedProject(project); }}>{item.title}</button></h3>
        <p className="project-summary">{item.summary}</p>

        <div className="project-tags">
          {item.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="badge">
              {tag}
            </span>
          ))}
        </div>

        <div className="project-footer">
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            Case Study <ArrowRight size={14} />
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {item.githubUrl && (
              <a
                href={item.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn-icon btn-secondary"
                title="GitHub Repo"
              >
                <IconGithub size={16} />
              </a>
            )}
            {item.liveUrl && (
              <a
                href={item.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn-icon btn-secondary"
                title="Live Demo"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
