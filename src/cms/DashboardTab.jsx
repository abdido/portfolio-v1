import React from 'react';
import { FolderGit2, FileText, Mail, Award, ArrowUpRight, CheckCircle2, Eye, Download, BarChart3, RefreshCw, CalendarDays } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';

const DashboardTab = ({ setActiveTab }) => {
  const { projects, articles, messages, skills, profile, getAnalytics } = usePortfolio();
  const [analytics, setAnalytics] = React.useState(null);
  const [analyticsRange, setAnalyticsRange] = React.useState(30);
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = React.useState(0);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(true);
  const [analyticsError, setAnalyticsError] = React.useState('');

  const unreadMessages = messages.filter(m => !m.read);

  React.useEffect(() => {
    let mounted = true;
    setAnalyticsLoading(true);
    setAnalyticsError('');
    getAnalytics(analyticsRange)
      .then(result => { if (mounted) setAnalytics(result); })
      .catch(error => { if (mounted) setAnalyticsError(error.message || 'Analytics belum dapat dimuat.'); })
      .finally(() => { if (mounted) setAnalyticsLoading(false); });
    return () => { mounted = false; };
  }, [analyticsRange, analyticsRefreshKey, getAnalytics]);

  const formatDate = date => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(`${date}T00:00:00Z`));
  const pageLabel = page => ({ '/': 'Beranda', '/about': 'Tentang', '/projects': 'Proyek', '/blog': 'Blog', '/contact': 'Kontak' }[page] || page);
  const maxViews = Math.max(1, ...(analytics?.daily || []).map(item => item.views));
  const dateLabelStep = analyticsRange >= 90 ? 10 : analyticsRange >= 30 ? 3 : 1;

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

      <section className="analytics-section" aria-labelledby="analytics-title">
        <div className="analytics-section-header">
          <div>
            <div className="analytics-kicker"><BarChart3 size={14} /> PRIVACY-FIRST ANALYTICS</div>
            <h3 id="analytics-title">Performa website</h3>
            <p>Statistik agregat tanpa menyimpan identitas pengunjung.</p>
          </div>
          <div className="analytics-controls">
            <label htmlFor="analytics-range"><CalendarDays size={15} /> Rentang</label>
            <select id="analytics-range" className="form-control" value={analyticsRange} onChange={event => setAnalyticsRange(Number(event.target.value))}>
              <option value="7">7 hari</option>
              <option value="30">30 hari</option>
              <option value="90">90 hari</option>
            </select>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAnalyticsRefreshKey(value => value + 1)} title="Muat ulang analytics">
              <RefreshCw size={14} /> <span className="analytics-refresh-label">Muat ulang</span>
            </button>
          </div>
        </div>

        {analyticsLoading && <div className="analytics-state" role="status">Memuat statistik…</div>}
        {!analyticsLoading && analyticsError && <div className="analytics-state analytics-state-error" role="alert">{analyticsError}</div>}
        {!analyticsLoading && !analyticsError && analytics && (
          <>
            <div className="analytics-metrics-grid">
              <div className="analytics-metric-card"><div className="analytics-metric-icon analytics-blue"><Eye size={18} /></div><div><strong>{analytics.totals.pageViews}</strong><span>Kunjungan halaman</span></div></div>
              <div className="analytics-metric-card"><div className="analytics-metric-icon analytics-violet"><Download size={18} /></div><div><strong>{analytics.totals.cvDownloads}</strong><span>Download CV</span></div></div>
              <div className="analytics-metric-card"><div className="analytics-metric-icon analytics-teal"><Mail size={18} /></div><div><strong>{analytics.totals.contacts}</strong><span>Pesan masuk</span></div></div>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card analytics-chart-card">
                <div className="analytics-card-heading"><div><h4>Kunjungan harian</h4><span>{formatDate(analytics.range.from)} – {formatDate(analytics.range.to)}</span></div><Eye size={17} /></div>
                <div className={`analytics-chart ${analyticsRange <= 7 ? 'analytics-chart-compact' : ''}`} aria-label="Grafik kunjungan harian" style={{ '--analytics-columns': analytics.daily.length, '--analytics-gap': analyticsRange >= 90 ? '2px' : analyticsRange >= 30 ? '4px' : '12px' }}>
                  {analytics.daily.map((item,index) => {
                    const showDate = index % dateLabelStep === 0 || index === analytics.daily.length - 1;
                    return <div className="analytics-bar-column" key={item.date} title={`${formatDate(item.date)}: ${item.views} kunjungan`}><div className="analytics-bar-value">{item.views || ''}</div><div className="analytics-bar-track"><div className="analytics-bar-fill" style={{ height: `${item.views ? Math.max(8, (item.views / maxViews) * 100) : 3}%` }} /></div><span className={showDate ? '' : 'analytics-date-hidden'}>{item.date.slice(5)}</span></div>;
                  })}
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-card-heading"><div><h4>Halaman terpopuler</h4><span>Dalam rentang terpilih</span></div><ArrowUpRight size={17} /></div>
                {analytics.topPages.length === 0 ? <div className="analytics-empty">Belum ada kunjungan tercatat.</div> : <div className="analytics-ranking">{analytics.topPages.map((item, index) => <div className="analytics-ranking-row" key={item.page}><span className="analytics-rank">{index + 1}</span><span className="analytics-ranking-name">{pageLabel(item.page)}</span><strong>{item.views}</strong></div>)}</div>}
              </div>
            </div>

            <div className="analytics-card analytics-profile-ranking">
              <div className="analytics-card-heading"><div><h4>Profil CV paling banyak diunduh</h4><span>Hanya event download yang berhasil</span></div><Download size={17} /></div>
              {analytics.topCvProfiles.length === 0 ? <div className="analytics-empty">Belum ada download CV tercatat.</div> : <div className="analytics-ranking analytics-profile-ranking-list">{analytics.topCvProfiles.map((item, index) => <div className="analytics-ranking-row" key={item.id}><span className="analytics-rank">{index + 1}</span><span className="analytics-ranking-name">{item.name}</span><strong>{item.downloads} download</strong></div>)}</div>}
            </div>
          </>
        )}
      </section>

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
