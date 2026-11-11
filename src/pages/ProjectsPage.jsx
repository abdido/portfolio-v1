import React, { useState, useMemo } from 'react';
import { FolderGit2, Search, SlidersHorizontal, LayoutGrid, Rows } from 'lucide-react';
import { getLocalizedProject } from '../utils/langHelper';
import { usePortfolio } from '../context/usePortfolio';
import ProjectCard from '../components/ProjectCard';

const ProjectsPage = () => {
  const { projects, t, language } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'featured'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'horizontal'

  // Extract unique categories from visible projects
  const categories = useMemo(() => {
    const visible = projects.filter(p => !p.hidden);
    const set = new Set(visible.map(p => p.category));
    return ['Semua', ...Array.from(set)];
  }, [projects]);

  // Filter & Sort Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (p.hidden) return false;
      const localized = getLocalizedProject(p, language);
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch = (localized.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (localized.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'featured') {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      return String(b.createdAt || b.year || '').localeCompare(String(a.createdAt || a.year || ''));
    });
  }, [projects, selectedCategory, searchQuery, sortBy, language]);

  return (
    <div className="page-wrapper container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="section-tag">
          <FolderGit2 size={13} /> {t('projectsTag')}
        </div>
        <h1 className="section-title">{t('projectsTitle')}</h1>
        <p className="section-subtitle">
          {t('projectsSubtitle')}
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="filter-bar">
        {/* Category Pills */}
        <div className="filter-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'Semua' ? t('catAll') : cat}
            </button>
          ))}
        </div>

        {/* Right Search & View Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={t('searchPlaceholderProj')}
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">{t('sortNewest')}</option>
            <option value="featured">{t('sortFeatured')}</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.2rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)' }}
              title={t('viewGrid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('horizontal')}
              className={`btn-icon ${viewMode === 'horizontal' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)' }}
              title={t('viewHorizontal')}
            >
              <Rows size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Showcase Container */}
      {filteredProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="projects-grid">
            {filteredProjects.map(proj => (
              <ProjectCard key={proj.id} project={proj} layout="grid" />
            ))}
          </div>
        ) : (
          <div className="works-list">
            {filteredProjects.map(proj => (
              <ProjectCard key={proj.id} project={proj} layout="horizontal" />
            ))}
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <SlidersHorizontal size={36} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>{t('noProjectsFound')}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {t('noProjectsDesc')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
