import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { activePage, navigateTo, profile, language, setLanguage, t } = usePortfolio();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('navHome') },
    { id: 'projects', label: t('navProjects') },
    { id: 'blog', label: t('navBlog') },
    { id: 'about', label: t('navAbout') }
  ];

  const handleNavClick = (pageId) => {
    navigateTo(pageId);
    setMobileOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <a href="/" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} className="nav-brand">
          <span>{profile.name?.split(' ')[0] || "Sulistyawan"}</span>
          <span className="brand-dot"></span>
          <span style={{ color: 'var(--accent-color)' }}>UX</span>
        </a>

        {/* Desktop Navigation Links */}
        <ul className="nav-menu">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Language Selector */}
          <div className="lang-toggle">
            <button
              className={`lang-btn ${language === 'ID' ? 'active' : ''}`}
              onClick={() => setLanguage('ID')}
              title="Bahasa Indonesia"
            >
              ID
            </button>
            <button
              className={`lang-btn ${language === 'EN' ? 'active' : ''}`}
              onClick={() => setLanguage('EN')}
              title="English Language"
            >
              EN
            </button>
          </div>

          <ThemeToggle />

          <button
            onClick={() => handleNavClick('contact')}
            className="btn btn-primary btn-sm nav-contact-cta"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>{t('navContactBtn')}</span>
            <ArrowRight size={14} />
          </button>

          {/* Mobile Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu" aria-expanded={mobileOpen} aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div id="mobile-navigation" hidden={!mobileOpen} inert={!mobileOpen} className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-list">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                className={`mobile-nav-link ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              className={`mobile-nav-link ${activePage === 'contact' ? 'active' : ''}`}
              onClick={() => handleNavClick('contact')}
            >
              <span>{t('navContact')}</span>
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
