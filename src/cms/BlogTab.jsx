import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, X, FileText, Globe } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const BlogTab = () => {
  const { articles, addArticle, updateArticle, deleteArticle } = usePortfolio();

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
    readTime: '5 min'
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
      readTime: '5 min'
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
      readTime: art.readTime || '5 min'
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

  const handleSubmit = (e) => {
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
      updateArticle(editingArticle.id, payload);
    } else {
      addArticle(payload);
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
              <th>Status Dual-Lang</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(art => (
                <tr key={art.id}>
                  <td>
                    <strong>{art.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      EN: {art.titleEn || '(Menggunakan fallback ID)'}
                    </div>
                  </td>
                  <td><span className="badge">{art.category}</span></td>
                  <td>
                    <span className="badge" style={{ background: art.titleEn ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)', color: art.titleEn ? 'var(--success-color)' : 'var(--text-muted)', border: 'none' }}>
                      <Globe size={12} style={{ marginRight: '4px' }} />
                      {art.titleEn ? 'ID + EN Ready' : 'ID Only'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{art.date}</td>
                  <td>
                    <div className="table-actions">
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
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
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
