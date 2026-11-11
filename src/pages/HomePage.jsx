import React from 'react';
import { ArrowRight, Code2, Sparkles, Layout, Smartphone, Layers } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import ProjectCard from '../components/ProjectCard';

const HomePage = () => {
  const { profile, projects, navigateTo, t, language } = usePortfolio();

  const featuredProjects = projects.filter(p => p.featured && !p.hidden).slice(0, 3);

  return (
    <div className="page-wrapper container">
      {/* Minimalist Hero Section */}
      <section className="hero-section">
        <div className="hero-tag-pill">
          <Sparkles size={14} /> {t('heroPill')}
        </div>

        <h1 className="hero-headline">
          {t('heroHeadlinePart1')}{' '}
          <span className="italic-accent">{t('heroHeadlinePart2')}</span>
        </h1>

        <p className="hero-subtitle">
          {(language === 'EN' ? profile.bioEn || profile.bio : profile.bio) || t('heroSubtitle')}
        </p>

        <div className="hero-cta-group">
          <button onClick={() => navigateTo('projects')} className="btn btn-primary">
            <span>{t('heroCtaProjects')}</span>
            <ArrowRight size={16} />
          </button>
          <button onClick={() => navigateTo('contact')} className="btn btn-secondary">
            <span>{t('heroCtaContact')}</span>
          </button>
        </div>
      </section>

      {/* Stats Counters Grid with Divider Lines */}
      <section className="stats-section">
        <div className="stats-grid-clean">
          <div className="stat-item">
            <span className="stat-num">{profile.stats?.yearsExperience ?? 0}+</span>
            <span className="stat-lbl">{t('statYears')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{profile.stats?.completedProjects ?? 0}+</span>
            <span className="stat-lbl">{t('statProjects')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{profile.stats?.satisfiedClients ?? 0}+</span>
            <span className="stat-lbl">{t('statClients')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{profile.stats?.codeCommits ?? 0}+</span>
            <span className="stat-lbl">{t('statCommits')}</span>
          </div>
        </div>
      </section>

      {/* Capabilities Section (What I Bring) */}
      <section style={{ marginBottom: '6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="section-tag">
            <Code2 size={13} /> {t('capTag')}
          </div>
          <h2 className="section-title" style={{ maxWidth: '750px', margin: '0 auto 1rem' }}>
            {t('capTitle')}
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            {t('capSubtitle')}
          </p>
        </div>

        <div className="capabilities-grid">
          <div className="capability-card">
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Layout size={22} />
            </div>
            <h3 className="capability-title">{t('cap1Title')}</h3>
            <p className="capability-desc">
              {t('cap1Desc')}
            </p>
            <div className="capability-tags">
              <span className="badge">React / Next.js</span>
              <span className="badge">Node.js</span>
              <span className="badge">PostgreSQL</span>
            </div>
          </div>

          <div className="capability-card">
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Smartphone size={22} />
            </div>
            <h3 className="capability-title">{t('cap2Title')}</h3>
            <p className="capability-desc">
              {t('cap2Desc')}
            </p>
            <div className="capability-tags">
              <span className="badge">React Native</span>
              <span className="badge">iOS / Android</span>
              <span className="badge">REST & GraphQL</span>
            </div>
          </div>

          <div className="capability-card">
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Layers size={22} />
            </div>
            <h3 className="capability-title">{t('cap3Title')}</h3>
            <p className="capability-desc">
              {t('cap3Desc')}
            </p>
            <div className="capability-tags">
              <span className="badge">Figma</span>
              <span className="badge">Design Systems</span>
              <span className="badge">WCAG AAA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Works Showcase */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-tag">
              <Code2 size={13} /> {t('projectsTag')}
            </div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              {t('projectsTitle')}
            </h2>
          </div>
          <button onClick={() => navigateTo('projects')} className="btn btn-secondary">
            <span>{t('lblViewAll')} ({projects.length})</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="works-list">
          {featuredProjects.map(proj => (
            <ProjectCard key={proj.id} project={proj} layout="horizontal" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
