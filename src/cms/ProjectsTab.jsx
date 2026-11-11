import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Star, Search, X, FolderGit2, Globe, Eye, EyeOff } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';

const ProjectsTab = () => {
  const { projects, addProject, updateProject, deleteProject, toggleProjectFeatured, toggleProjectHidden } = usePortfolio();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

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
              <div className="form-group">
                <label className="form-label">Judul Proyek (Bahasa Indonesia) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: NusaCloud Management Dashboard"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--accent-color)' }}>Project Title (English Version)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. NusaCloud Management Platform"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                />
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
                <label className="form-label" style={{ color: 'var(--accent-color)' }}>English Summary</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="1-2 sentences summary in English..."
                  value={formData.summaryEn}
                  onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Lengkap Proyek (Bahasa Indonesia)</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Rincian latar belakang dan arsitektur proyek..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--accent-color)' }}>English Full Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Detailed project background and architecture in English..."
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                ></textarea>
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
              <div className="form-group" style={{ marginTop: '1rem', padding: '0.9rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
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
