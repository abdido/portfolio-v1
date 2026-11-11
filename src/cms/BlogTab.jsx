import React, { useState, useMemo, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, X, FileText, Globe, Eye, EyeOff } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import { renderRichContent } from '../utils/richText';

const BlogTab = () => {
  const { articles, addArticle, updateArticle, deleteArticle, toggleArticleHidden } = usePortfolio();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const contentIdRef = useRef(null);
  const contentEnRef = useRef(null);
  const [previewId, setPreviewId] = useState(false);
  const [previewEn, setPreviewEn] = useState(false);

  const insertTag = (fieldName, textareaRef, openTag, closeTag = '', placeholder = '') => {
    const el = textareaRef.current;
    if (!el) {
      setFormData(prev => ({ ...prev, [fieldName]: (prev[fieldName] || '') + openTag + placeholder + closeTag }));
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentVal = formData[fieldName] || '';
    const selectedText = currentVal.substring(start, end);
    const insertText = selectedText ? `${openTag}${selectedText}${closeTag}` : `${openTag}${placeholder}${closeTag}`;

    const newVal = currentVal.substring(0, start) + insertText + currentVal.substring(end);
    setFormData(prev => ({ ...prev, [fieldName]: newVal }));

    setTimeout(() => {
      el.focus();
      const newCursorPos = selectedText ? start + insertText.length : start + openTag.length + placeholder.length;
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

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
    setPreviewId(false);
    setPreviewEn(false);
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
    setPreviewId(false);
    setPreviewEn(false);
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
                    <strong>{art.title}</strong>
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
                    {(() => {
                      const hasTitle = Boolean(art.titleEn && art.titleEn.trim());
                      const hasContent = Boolean(art.contentEn && art.contentEn.trim());

                      let label = 'ID Only';
                      let color = 'var(--text-muted)';
                      let bg = 'var(--bg-secondary)';
                      let tooltip = 'Hanya Bahasa Indonesia (pengunjung mode EN akan menggunakan teks ID)';

                      if (hasTitle && hasContent) {
                        label = 'ID + EN Ready';
                        color = 'var(--success-color)';
                        bg = 'rgba(16, 185, 129, 0.15)';
                        tooltip = 'Judul dan isi artikel Bahasa Inggris sudah lengkap';
                      } else if (hasTitle || hasContent) {
                        label = 'EN Sebagian';
                        color = 'var(--warning-color)';
                        bg = 'rgba(245, 158, 11, 0.15)';
                        tooltip = hasTitle
                          ? 'Judul EN terisi, namun isi konten EN masih kosong'
                          : 'Isi konten EN terisi, namun judul EN masih kosong';
                      }

                      return (
                        <span
                          className="badge"
                          style={{
                            background: bg,
                            color: color,
                            border: 'none',
                            cursor: 'help'
                          }}
                          title={tooltip}
                        >
                          <Globe size={12} style={{ marginRight: '4px' }} />
                          {label}
                        </span>
                      );
                    })()}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Isi Artikel Lengkap (Bahasa Indonesia) *</label>
                  <button
                    type="button"
                    onClick={() => setPreviewId(p => !p)}
                    className="btn-tag-preview"
                  >
                    {previewId ? '✏️ Kembali Menulis' : '👁️ Pratinjau Tampilan'}
                  </button>
                </div>

                {/* HTML Quick Tag Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem', padding: '0.35rem 0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.2rem' }}>
                    Tag HTML:
                  </span>
                  <button type="button" onClick={() => insertTag('content', contentIdRef, '<h3>', '</h3>\n', 'Subjudul')} className="btn-tag" title="Subjudul H3">
                    &lt;h3&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('content', contentIdRef, '<p>', '</p>\n', 'Teks paragraf...')} className="btn-tag" title="Paragraf">
                    &lt;p&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('content', contentIdRef, '<strong>', '</strong>', 'teks tebal')} className="btn-tag" title="Teks Tebal (Bold)">
                    &lt;strong&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('content', contentIdRef, '<em>', '</em>', 'teks miring')} className="btn-tag" title="Teks Miring (Italic)">
                    &lt;em&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('content', contentIdRef, '<ul>\n  <li>', '</li>\n  <li>Poin berikutnya</li>\n</ul>\n', 'Poin 1')} className="btn-tag" title="Daftar Poin">
                    &lt;ul&gt; &lt;li&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('content', contentIdRef, '<ol>\n  <li>', '</li>\n  <li>Langkah berikutnya</li>\n</ol>\n', 'Langkah 1')} className="btn-tag" title="Daftar Nomor">
                    &lt;ol&gt; &lt;li&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('content', contentIdRef, '<blockquote>', '</blockquote>\n', 'Catatan penting atau kutipan...')} className="btn-tag" title="Kutipan">
                    &lt;quote&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('content', contentIdRef, '<code>', '</code>', 'kode')} className="btn-tag" title="Kode Inline">
                    &lt;code&gt;
                  </button>
                </div>

                {previewId ? (
                  <div
                    className="article-preview-box article-content-body"
                    dangerouslySetInnerHTML={{ __html: renderRichContent(formData.content) || '<p style="color:var(--text-muted);font-style:italic;">Belum ada konten untuk dipratinjau.</p>' }}
                  />
                ) : (
                  <textarea
                    ref={contentIdRef}
                    rows="8"
                    className="form-control"
                    placeholder="Tulis pembahasan artikel. Anda dapat menggunakan tag HTML seperti <h3>, <p>, <strong>, <ul>, <li>, dll..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    style={{ lineHeight: 1.6, minHeight: '160px' }}
                  ></textarea>
                )}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0, color: 'var(--accent-color)' }}>Full Article Content (English Version)</label>
                  <button
                    type="button"
                    onClick={() => setPreviewEn(p => !p)}
                    className="btn-tag-preview"
                  >
                    {previewEn ? '✏️ Back to Edit' : '👁️ Preview HTML'}
                  </button>
                </div>

                {/* HTML Quick Tag Toolbar EN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem', padding: '0.35rem 0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.2rem' }}>
                    Quick Tags:
                  </span>
                  <button type="button" onClick={() => insertTag('contentEn', contentEnRef, '<h3>', '</h3>\n', 'Heading')} className="btn-tag" title="Heading H3">
                    &lt;h3&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('contentEn', contentEnRef, '<p>', '</p>\n', 'Paragraph text...')} className="btn-tag" title="Paragraph">
                    &lt;p&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('contentEn', contentEnRef, '<strong>', '</strong>', 'bold text')} className="btn-tag" title="Bold">
                    &lt;strong&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('contentEn', contentEnRef, '<em>', '</em>', 'italic text')} className="btn-tag" title="Italic">
                    &lt;em&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('contentEn', contentEnRef, '<ul>\n  <li>', '</li>\n  <li>Next point</li>\n</ul>\n', 'Point 1')} className="btn-tag" title="Bullet List">
                    &lt;ul&gt; &lt;li&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('contentEn', contentEnRef, '<ol>\n  <li>', '</li>\n  <li>Next step</li>\n</ol>\n', 'Step 1')} className="btn-tag" title="Numbered List">
                    &lt;ol&gt; &lt;li&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('contentEn', contentEnRef, '<blockquote>', '</blockquote>\n', 'Important note or quote...')} className="btn-tag" title="Blockquote">
                    &lt;quote&gt;
                  </button>
                  <button type="button" onClick={() => insertTag('contentEn', contentEnRef, '<code>', '</code>', 'code')} className="btn-tag" title="Inline Code">
                    &lt;code&gt;
                  </button>
                </div>

                {previewEn ? (
                  <div
                    className="article-preview-box article-content-body"
                    dangerouslySetInnerHTML={{ __html: renderRichContent(formData.contentEn) || '<p style="color:var(--text-muted);font-style:italic;">No English content to preview yet.</p>' }}
                  />
                ) : (
                  <textarea
                    ref={contentEnRef}
                    rows="8"
                    className="form-control"
                    placeholder="Write English article content. You can structure it using HTML tags like <h3>, <p>, <strong>, <ul>, <li>, etc..."
                    value={formData.contentEn}
                    onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                    style={{ lineHeight: 1.6, minHeight: '160px' }}
                  ></textarea>
                )}
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
