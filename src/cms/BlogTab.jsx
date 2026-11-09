import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, X, FileText, Globe, Eye, EyeOff } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';

const BlogTab = () => {
  const { articles, addArticle, updateArticle, deleteArticle, toggleArticleHidden } = usePortfolio();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  // Extract unique categories dynamically from current articles list
  const existingCategories = useMemo(() => {
    const defaults = ['Web Development', 'Performance', 'Backend', 'UI/UX Design', 'Career & Life'];
    const customFromArticles = articles.map(a => a.category).filter(Boolean);
    return Array.from(new Set([...defaults, ...customFromArticles]));
  }, [articles]);

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    category: 'Web Development',
    excerpt: '',
    excerptEn: '',
    content: '',
    contentEn: '',
    tags: '',
    readTime: '5 min',
    hidden: false
  });

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setFormData({
      title: '',
      titleEn: '',
      category: existingCategories[0] || 'Web Development',
      excerpt: '',
      excerptEn: '',
      content: '',
      contentEn: '',
      tags: 'React, Web, Tutorial',
      readTime: '5 min',
      hidden: false
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (art) => {
    setEditingArticle(art);
    const isCustom = !existingCategories.includes(art.category);
    setIsCustomCategory(isCustom);
    setCustomCategoryInput(isCustom ? art.category : '');
    setFormData({
      title: art.title || '',
      titleEn: art.titleEn || '',
      category: art.category || 'Web Development',
      excerpt: art.excerpt || '',
      excerptEn: art.excerptEn || '',
      content: art.content || '',
      contentEn: art.contentEn || '',
      tags: art.tags ? art.tags.join(', ') : '',
      readTime: art.readTime || '5 min',
      hidden: Boolean(art.hidden)
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

    if (editingArticle) {
      if (!await updateArticle(editingArticle.id, payload)) return;
    } else {
      if (!await addArticle(payload)) return;
    }

    setModalOpen(false);
  };

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Top Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manajemen Artikel & Blog Dual-Language</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tulis, edit, dan kelola artikel wawasan dalam Bahasa Indonesia & Bahasa Inggris.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Tulis Artikel Baru
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="search-box" style={{ maxWidth: '360px' }}>
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari judul atau kategori artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Articles Table */}
      <div className="table-wrapper">
        <table className="cms-table">
          <thead>
            <tr>
              <th>Judul Artikel</th>
              <th>Kategori</th>
              <th>Status Publikasi</th>
              <th>Status Dual-Lang</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(art => (
                <tr key={art.id} style={{ opacity: art.hidden ? 0.78 : 1, transition: 'opacity 0.2s ease' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong>{art.title}</strong>
                      {art.hidden && (
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--warning-color)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.45rem',
                            gap: '3px'
                          }}
                        >
                          <EyeOff size={11} /> Takedown
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      EN: {art.titleEn || '(Menggunakan fallback ID)'}
                    </div>
                  </td>
                  <td><span className="badge">{art.category}</span></td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleArticleHidden(art.id)}
                      className="badge"
                      style={{
                        cursor: 'pointer',
                        background: art.hidden ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: art.hidden ? 'var(--warning-color)' : 'var(--success-color)',
                        border: art.hidden ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '0.25rem 0.65rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                      }}
                      title={art.hidden ? 'Artikel sedang disembunyikan. Klik untuk publikasikan kembali.' : 'Artikel aktif tayang. Klik untuk sembunyikan (takedown).'}
                    >
                      {art.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{art.hidden ? 'Disembunyikan' : 'Tayang'}</span>
                    </button>
                  </td>
                  <td>
                    <span className="badge" style={{ background: art.titleEn ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)', color: art.titleEn ? 'var(--success-color)' : 'var(--text-muted)', border: 'none' }}>
                      <Globe size={12} style={{ marginRight: '4px' }} />
                      {art.titleEn ? 'ID + EN Ready' : 'ID Only'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{art.date}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        onClick={() => toggleArticleHidden(art.id)}
                        className={`btn-icon ${art.hidden ? 'btn-warning' : 'btn-secondary'}`}
                        title={art.hidden ? 'Tampilkan Kembali Artikel' : 'Sembunyikan / Takedown Artikel'}
                      >
                        {art.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => handleOpenEdit(art)} className="btn-icon btn-secondary" title="Edit Artikel">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { if (window.confirm("Hapus artikel ini?")) deleteArticle(art.id); }} className="btn-icon btn-danger" title="Hapus Artikel">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Tidak ada artikel ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Article Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} className="text-accent" />
                {editingArticle ? 'Edit Artikel Dual-Language' : 'Tulis Artikel Baru (ID & EN)'}
              </h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Judul Artikel (Bahasa Indonesia) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Panduan Menguasai State Management di React 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--accent-color)' }}>Title (English Translation)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Master Guide to React State Management in 2026"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
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
                  <label className="form-label">Estimasi Waktu Baca</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: 5 min"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kutipan Singkat (Indonesian Excerpt) *</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="Ringkasan 1-2 kalimat..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--accent-color)' }}>English Excerpt</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="1-2 sentences summary in English..."
                  value={formData.excerptEn}
                  onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Isi Artikel Lengkap (Bahasa Indonesia) *</label>
                <textarea
                  rows="6"
                  className="form-control"
                  placeholder="Tulis seluruh pembahasan artikel Bahasa Indonesia..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--accent-color)' }}>Full Article Content (English Version)</label>
                <textarea
                  rows="6"
                  className="form-control"
                  placeholder="Write complete English article body content here..."
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (pisahkan dengan koma)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="React, Frontend, Web Design"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              {/* Takedown / Hide Article Toggle */}
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
                      Sembunyikan artikel ini (Takedown / Draft)
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formData.hidden
                        ? 'Artikel ini tidak akan tampil di website publik dan hanya dapat diakses oleh admin di CMS.'
                        : 'Artikel aktif tayang dan dapat dibaca oleh seluruh pengunjung website publik.'}
                    </div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingArticle ? 'Simpan Perubahan' : 'Terbitkan Artikel Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogTab;
