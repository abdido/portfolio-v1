import React, { useState } from 'react';
import { LayoutDashboard, FolderGit2, FileText, FolderOpen, Award, Mail, Settings, LogOut, ArrowLeft, ShieldCheck, Globe, FileCheck } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import AdminLoginModal from '../cms/AdminLoginModal';
import DashboardTab from '../cms/DashboardTab';
import ProjectsTab from '../cms/ProjectsTab';
import BlogTab from '../cms/BlogTab';
import MediaTab from '../cms/MediaTab';
import CvTab from '../cms/CvTab';
import ExperienceTab from '../cms/ExperienceTab';
import InboxTab from '../cms/InboxTab';
import SettingsTab from '../cms/SettingsTab';
import '../styles/cms.css';

const AdminPage = () => {
  const { profile, isAdminAuthenticated, logoutAdmin, messages, navigateTo } = usePortfolio();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'projects', 'articles', 'media', 'cv', 'experiences', 'inbox', 'settings'

  const unreadCount = messages.filter(m => !m.read).length;

  if (!isAdminAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem', background: 'var(--bg-primary)' }}>
        <div style={{ marginBottom: '1.5rem', width: '100%', maxWidth: '380px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigateTo('home')} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} /> Ke Website Publik
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CMS Portal v1.0</span>
        </div>
        <AdminLoginModal />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab setActiveTab={setActiveTab} />;
      case 'projects':
        return <ProjectsTab />;
      case 'articles':
        return <BlogTab />;
      case 'media':
        return <MediaTab />;
      case 'cv':
        return <CvTab />;
      case 'experiences':
        return <ExperienceTab />;
      case 'inbox':
        return <InboxTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Standalone CMS Top Bar */}
      <header style={{ height: '64px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{profile.name?.split(' ')[0] || "Sulistyawan"}</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)' }}></span>
            <span style={{ color: 'var(--accent-color)' }}>CMS</span>
          </div>

          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent-color)', border: 'none' }}>
            <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Admin Workspace
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigateTo('home')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Globe size={14} /> Lihat Website Utama
          </button>

          <button
            onClick={() => logoutAdmin()}
            className="btn btn-danger btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </header>

      {/* Standalone CMS Workspace */}
      <div className="admin-container" style={{ flexGrow: 1 }}>
        {/* CMS Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">Menu Pengelolaan</div>

          <button
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'cv' ? 'active' : ''}`}
            onClick={() => setActiveTab('cv')}
          >
            <FileCheck size={18} />
            <span>Kelola CV & Resume</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FolderGit2 size={18} />
            <span>Kelola Proyek</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            <FileText size={18} />
            <span>Kelola Artikel</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <FolderOpen size={18} />
            <span>Media Library</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'experiences' ? 'active' : ''}`}
            onClick={() => setActiveTab('experiences')}
          >
            <Award size={18} />
            <span>Skill & Karir</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            <Mail size={18} />
            <span>Inbox Pesan</span>
            {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Pengaturan</span>
          </button>

          <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              className="admin-nav-item"
              onClick={() => navigateTo('home')}
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={16} />
              <span>Website Publik</span>
            </button>

            <button
              className="admin-nav-item"
              onClick={() => logoutAdmin()}
              style={{ color: 'var(--danger-color)' }}
            >
              <LogOut size={16} />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </aside>

        {/* Tab Content Area */}
        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
