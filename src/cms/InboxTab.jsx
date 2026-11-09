import React, { useState } from 'react';
import { Trash2, Eye, X, CornerUpLeft } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';

const InboxTab = () => {
  const { messages, markMessageAsRead, deleteMessage, showToast } = usePortfolio();
  const [filterRead, setFilterRead] = useState('all'); // 'all' | 'unread'
  const [selectedMsg, setSelectedMsg] = useState(null);

  const filtered = messages.filter(m => {
    if (filterRead === 'unread') return !m.read;
    return true;
  });

  const handleOpenMsg = (msg) => {
    setSelectedMsg(msg);
    if (!msg.read) {
      markMessageAsRead(msg.id);
    }
  };

  const handleReplyMailto = (msg) => {
    const mailtoUrl = `mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Inquiry Response')}&body=${encodeURIComponent(`Halo ${msg.name},\n\nTerima kasih atas pesan Anda mengenai "${msg.subject}".\n\nSalam,\nSulistyawan Abdillah Rosyid`)}`;
    window.open(mailtoUrl, '_blank');
    showToast("Membuka aplikasi Email Anda untuk membalas...", "info");
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Inbox Pesan Kontak</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Pesan yang dikirim pengunjung melalui formulir kontak publik.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`filter-btn ${filterRead === 'all' ? 'active' : ''}`}
            onClick={() => setFilterRead('all')}
          >
            Semua ({messages.length})
          </button>
          <button
            className={`filter-btn ${filterRead === 'unread' ? 'active' : ''}`}
            onClick={() => setFilterRead('unread')}
          >
            Belum Dibaca ({messages.filter(m => !m.read).length})
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="table-wrapper">
        <table className="cms-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Pengirim</th>
              <th>Email</th>
              <th>Subjek & Layanan</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(msg => (
                <tr key={msg.id} style={{ background: !msg.read ? 'var(--accent-light)' : undefined }}>
                  <td>
                    {!msg.read ? (
                      <span className="badge" style={{ background: '#ef4444', color: '#fff' }}>Baru</span>
                    ) : (
                      <span className="badge">Dibaca</span>
                    )}
                  </td>
                  <td><strong>{msg.name}</strong></td>
                  <td style={{ fontSize: '0.85rem' }}>{msg.email}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{msg.subject || 'Tanpa Subjek'}</div>
                    <span className="badge" style={{ fontSize: '0.7rem' }}>{msg.service}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{msg.date}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => handleOpenMsg(msg)} className="btn-icon btn-primary" title="Baca Pesan">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => { if (window.confirm("Hapus pesan ini?")) deleteMessage(msg.id); }} className="btn-icon btn-danger" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Tidak ada pesan di Inbox.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Message Modal */}
      {selectedMsg && (
        <div className="modal-overlay" onClick={() => setSelectedMsg(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge" style={{ marginBottom: '0.25rem' }}>{selectedMsg.service}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedMsg.subject || 'Rincian Pesan Kontak'}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedMsg(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                <p><strong>Pengirim:</strong> {selectedMsg.name}</p>
                <p><strong>Email:</strong> {selectedMsg.email}</p>
                <p><strong>Tanggal Masuk:</strong> {selectedMsg.date}</p>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Isi Pesan:</h4>
              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {selectedMsg.message}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => handleReplyMailto(selectedMsg)} className="btn btn-primary">
                  <CornerUpLeft size={16} /> Balas via Email
                </button>
                <button onClick={() => { deleteMessage(selectedMsg.id); setSelectedMsg(null); }} className="btn btn-danger">
                  <Trash2 size={16} /> Hapus Pesan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxTab;
