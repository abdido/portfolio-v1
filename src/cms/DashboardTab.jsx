import React from 'react';
import { FolderGit2, FileText, Mail, Award, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const DashboardTab = ({ setActiveTab }) => {
  const { projects, articles, messages, skills, experiences, profile } = usePortfolio();

  const unreadMessages = messages.filter(m => !m.read);

  return (
    <div>
      {/* Header Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ringkasan Dashboard CMS</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Selamat datang kembali, <strong>{profile.name}</strong>. Berikut adalah data statistik terkini portofolio Anda.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-grid">
        <div className="metric-card" onClick={() => setActiveTab('projects')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon">
            <FolderGit2 size={24} />
          </div>
          <div>
            <div className="metric-val">{projects.length}</div>
            <div className="metric-lbl">Total Proyek</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('articles')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="metric-val">{articles.length}</div>
            <div className="metric-lbl">Artikel Terbit</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('inbox')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Mail size={24} />
          </div>
          <div>
            <div className="metric-val">{messages.length} ({unreadMessages.length} baru)</div>
            <div className="metric-lbl">Pesan Inbox</div>
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('experiences')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="metric-val">{skills.length}</div>
            <div className="metric-lbl">Jumlah Skill Item</div>
          </div>
        </div>
      </div>

      {/* Quick Alerts */}
      {unreadMessages.length > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Mail size={20} style={{ color: '#ef4444' }} />
            <span>Anda memiliki <strong>{unreadMessages.length} pesan belum dibaca</strong> di Inbox Kontak.</span>
          </div>
          <button onClick={() => setActiveTab('inbox')} className="btn btn-sm btn-danger">
            Buka Inbox
          </button>
        </div>
      )}

      {/* Recent Activity / Projects List */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Proyek Terakhir Ditambahkan</h3>
          <button onClick={() => setActiveTab('projects')} className="btn btn-sm btn-secondary">
            Kelola Proyek <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="table-wrapper">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Judul Proyek</th>
                <th>Kategori</th>
                <th>Klien</th>
                <th>Status Unggulan</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 4).map(p => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong></td>
                  <td><span className="badge">{p.category}</span></td>
                  <td>{p.client || '-'}</td>
                  <td>
                    {p.featured ? (
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Unggulan
                      </span>
                    ) : (
                      <span className="badge">Standar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
