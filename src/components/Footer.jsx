import React from 'react';
import { ArrowUp } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import { IconGithub, IconLinkedin, IconTwitter, IconInstagram } from './SocialIcons';

const Footer = () => {
  const { profile, settings, t } = usePortfolio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            {profile.name}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
            {profile.role} — {t('footerDesc')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {profile.socials?.github && (
            <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="btn-icon btn-secondary" title="GitHub">
              <IconGithub size={18} />
            </a>
          )}
          {profile.socials?.linkedin && (
            <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="btn-icon btn-secondary" title="LinkedIn">
              <IconLinkedin size={18} />
            </a>
          )}
          {profile.socials?.twitter && (
            <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="btn-icon btn-secondary" title="Twitter">
              <IconTwitter size={18} />
            </a>
          )}
          {profile.socials?.instagram && (
            <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer" className="btn-icon btn-secondary" title="Instagram">
              <IconInstagram size={18} />
            </a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {settings.footerText || "© 2026 Sulistyawan Abdillah Rosyid. All rights reserved."}
          </p>

          <button
            onClick={scrollToTop}
            className="btn-icon btn-secondary"
            title={t('footerScrollTop')}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
