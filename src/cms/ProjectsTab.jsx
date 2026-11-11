import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Star, Search, X, FolderGit2, Globe, Eye, EyeOff } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';

const ProjectsTab = () => {
  const { projects, addProject, updateProject, deleteProject, toggleProjectFeatured, toggleProjectHidden } = usePortfolio();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [langTab, setLangTab] = useState('id'); // 'id' | 'en'

  // Extract unique categories dynamically from current projects list
  const existingCategories = useMemo(() => {
    const defaults = ['Web App', 'Mobile App', 'UI/UX', 'Fullstack', 'Backend'];
    const customFromProjects = projects.map(p => p.category).filter(Boolean);
    return Array.from(new Set([...defaults, ...customFromProjects]));
  }, [projects]);

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    category: 'Web App',
    summary: '',
    summaryEn: '',
    description: '',
    descriptionEn: '',
    image: '',
    tags: '',
    liveUrl: '',
    githubUrl: '',
    client: '',
    year: '2026',
    featured: false,
    hidden: false
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setLangTab('id');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setFormData({
      title: '',
      titleEn: '',
      category: existingCategories[0] || 'Web App',
      summary: '',
      summaryEn: '',
      description: '',
      descriptionEn: '',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      tags: 'React, Node.js, Tailwind',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
      client: 'Klien Baru',
      year: '2026',
      featured: false,
      hidden: false
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setLangTab('id');
    const isCustom = !existingCategories.includes(proj.category);
    setIsCustomCategory(isCustom);
    setCustomCategoryInput(isCustom ? proj.category : '');
    setFormData({
      title: proj.title || '',
      titleEn: proj.titleEn || '',
      category: proj.category || 'Web App',
      summary: proj.summary || '',
      summaryEn: proj.summaryEn || '',
      description: proj.description || '',
      descriptionEn: proj.descriptionEn || '',
      image: proj.image || '',
      tags: proj.tags ? proj.tags.join(', ') : '',
      liveUrl: proj.liveUrl || '',
      githubUrl: proj.githubUrl || '',
      client: proj.client || '',
      year: proj.year || '2026',
      featured: proj.featured || false,
      hidden: Boolean(proj.hidden)
    });
    setModalOpen(true);
  };

  const handleCategorySelectChange = (e) => {
    const val = e.target.value;
    if (val === '__NEW_CATEGORY__') {
      setIsCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setIsCustomCategory(false);
      setFormData(prev => ({ ...prev, category: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.title.trim()) {
      setLangTab('id');
      alert("Silakan masukkan Judul Proyek (Bahasa Indonesia)!");
      return;
    }

    if (!formData.summary || !formData.summary.trim()) {
      setLangTab('id');
      alert("Silakan masukkan Ringkasan Singkat (Bahasa Indonesia)!");
      return;
    }

    const finalCategory = isCustomCategory ? customCategoryInput.trim() : formData.category;

    if (!finalCategory) {
      alert("Silakan masukkan nama kategori!");
      return;
    }

    const tagArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      ...formData,
      category: finalCategory,
      tags: tagArray
    };

    if (editingProject) {
      if (!await updateProject(editingProject.id, payload)) return;
    } else {
      if (!await addProject(payload)) return;
    }

    setModalOpen(false);
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Top Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manajemen Proyek Dual-Language</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tambah, perbarui rincian Bahasa Indonesia & Inggris, dan atur proyek portofolio.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Tambah Proyek Baru
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="search-box" style={{ maxWidth: '360px' }}>
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari nama proyek atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="table-wrapper">
        <table className="cms-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Judul Proyek</th>
              <th>Kategori</th>
              <th>Status Publikasi</th>
              <th>Dual-Lang</th>
              <th>Unggulan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(p => (
                <tr key={p.id} style={{ opacity: p.hidden ? 0.78 : 1, transition: 'opacity 0.2s ease' }}>
                  <td>
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td>
                    <strong>{p.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      EN: {p.titleEn || '(Fallback ID)'}
                    </div>
                  </td>
                  <td><span className="badge">{p.category}</span></td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleProjectHidden(p.id)}
                      className="badge"
                      style={{
                        cursor: 'pointer',
                        background: p.hidden ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: p.hidden ? 'var(--warning-color)' : 'var(--success-color)',
                        border: p.hidden ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.25rem 0.65rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                      }}
                      title={p.hidden ? 'Proyek sedang disembunyikan. Klik untuk publikasikan kembali.' : 'Proyek aktif tayang. Klik untuk sembunyikan (takedown).'}
                    >
                      {p.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{p.hidden ? 'Disembunyikan' : 'Tayang'}</span>
                    </button>
                  </td>
                  <td>
                    <span className="badge" style={{ background: p.titleEn ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)', color: p.titleEn ? 'var(--success-color)' : 'var(--text-muted)', border: 'none' }}>
                      <Globe size={12} style={{ marginRight: '4px' }} />
                      {p.titleEn ? 'ID + EN' : 'ID Only'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleProjectFeatured(p.id)}
                      className={`btn-icon ${p.featured ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
                      title="Toggle Unggulan"
                    >
                      <Star size={14} fill={p.featured ? 'currentColor' : 'none'} />
                      <span style={{ marginLeft: '4px' }}>{p.featured ? 'Ya' : 'Tidak'}</span>
                    </button>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        onClick={() => toggleProjectHidden(p.id)}
                        className={`btn-icon ${p.hidden ? 'btn-warning' : 'btn-secondary'}`}
                        title={p.hidden ? 'Tampilkan Kembali Proyek' : 'Sembunyikan / Takedown Proyek'}
                      >
                        {p.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => handleOpenEdit(p)} className="btn-icon btn-secondary" title="Edit Proyek">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { if (window.confirm("Hapus proyek ini?")) deleteProject(p.id); }} className="btn-icon btn-danger" title="Hapus Proyek">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Tidak ada proyek ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderGit2 size={20} className="text-accent" />
                {editingProject ? 'Edit Proyek Dual-Language' : 'Tambah Proyek Baru (ID & EN)'}
              </h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Language Switcher Tabs */}
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setLangTab('id')}
                  className={`btn ${langTab === 'id' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🇮🇩</span>
                  <span>Bahasa Indonesia</span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: langTab === 'id' ? 'rgba(255,255,255,0.22)' : 'var(--bg-secondary)',
                    color: langTab === 'id' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600
                  }}>
                    Utama
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLangTab('en')}
                  className={`btn ${langTab === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🇬🇧</span>
                  <span>English Version</span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: (formData.titleEn && formData.summaryEn)
                      ? (langTab === 'en' ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.15)')
                      : (langTab === 'en' ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)'),
                    color: (formData.titleEn && formData.summaryEn)
                      ? (langTab === 'en' ? '#fff' : 'var(--success-color)')
                      : (langTab === 'en' ? '#fff' : 'var(--text-muted)'),
                    fontWeight: 600
                  }}>
                    {formData.titleEn && formData.summaryEn ? '✓ Terisi' : 'Opsional'}
                  </span>
                </button>
              </div>

              {/* TAB 1: BAHASA INDONESIA */}
              {langTab === 'id' && (
                <div style={{ animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Globe size={15} className="text-accent" />
                    <span>Konten Proyek dalam <strong>Bahasa Indonesia</strong> (Bahasa Utama / Default website)</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Judul Proyek (Bahasa Indonesia) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: NusaCloud - Platform SaaS Management & Analytics"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ringkasan Singkat (Indonesian Summary) *</label>
                    <textarea
                      rows="2"
                      className="form-control"
                      placeholder="Ringkasan 1-2 kalimat..."
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Deskripsi Lengkap Proyek (Bahasa Indonesia)</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="Rincian latar belakang, fitur, arsitektur, dan teknologi proyek..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* TAB 2: ENGLISH VERSION */}
              {langTab === 'en' && (
                <div style={{ animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Globe size={15} style={{ color: '#38bdf8' }} />
                      <span>Project Content in <strong>English</strong> (Tampil saat pengunjung memilih mode EN)</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      *Kosongkan jika ingin menggunakan konten Bahasa Indonesia (fallback).
                    </span>
                  </div>

                  {/* Indonesian Reference Helper Box for Admin */}
                  {(formData.title || formData.summary) && (
                    <div style={{ marginBottom: '1.15rem', padding: '0.85rem 1rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-color)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>🇮🇩 Referensi Teks Bahasa Indonesia:</span>
                      </div>
                      {formData.title && (
                        <div style={{ marginBottom: '0.35rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Judul ID:</span>{' '}
                          <span style={{ color: 'var(--text-primary)' }}>{formData.title}</span>
                        </div>
                      )}
                      {formData.summary && (
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Ringkasan ID:</span>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>{formData.summary}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#38bdf8' }}>Project Title (English Version)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. NusaCloud - SaaS Infrastructure & Analytics Platform"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#38bdf8' }}>English Summary</label>
                    <textarea
                      rows="2"
                      className="form-control"
                      placeholder="1-2 sentences summary in English..."
                      value={formData.summaryEn}
                      onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#38bdf8' }}>English Full Description</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="Detailed project background, architecture, and technology in English..."
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* SHARED / GENERAL PROJECT SETTINGS */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
                  <FolderGit2 size={16} />
                  <span>Pengaturan & Rincian Umum Proyek (Berlaku untuk ID & EN)</span>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Kategori Proyek *</label>
                    <select
                      className="form-control"
                      value={isCustomCategory ? '__NEW_CATEGORY__' : formData.category}
                      onChange={handleCategorySelectChange}
                    >
                      {existingCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__NEW_CATEGORY__">+ Tambah Kategori Baru...</option>
                    </select>

                    {isCustomCategory && (
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginTop: '0.5rem' }}
                        placeholder="Ketik nama kategori baru..."
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tahun Pengerjaan</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="2026"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Klien / Perusahaan</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="PT Nusa Digital"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">URL Gambar Sampul (Image URL)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teknologi / Tags (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="React, Node.js, PostgreSQL"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Live Demo URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://demo.example.com"
                      value={formData.liveUrl}
                      onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">GitHub Repository URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://github.com/username/repo"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span>Tampilkan sebagai Proyek Unggulan di Beranda Utama</span>
                  </label>
                </div>

                {/* Takedown / Hide Project Toggle */}
                <div className="form-group" style={{ marginTop: '0.75rem', padding: '0.9rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={formData.hidden}
                      onChange={(e) => setFormData({ ...formData, hidden: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--warning-color)' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: formData.hidden ? 'var(--warning-color)' : 'var(--text-primary)' }}>
                        {formData.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                        Sembunyikan proyek ini (Takedown / Draft)
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formData.hidden
                          ? 'Proyek ini tidak akan tampil di website publik dan hanya dapat diakses oleh admin di CMS.'
                          : 'Proyek aktif tayang dan dapat dilihat oleh seluruh pengunjung website publik.'}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProject ? 'Simpan Perubahan' : 'Tambah Proyek Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
