import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image,
  Video,
  FileText,
  File,
  Trash2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Eye,
  X,
  HardDrive,
  CloudUpload,
  RefreshCw,
  FolderOpen,
  LayoutGrid,
  List
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const MediaTab = () => {
  const { showToast } = usePortfolio();

  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'images' | 'videos' | 'documents'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [previewItem, setPreviewItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch Media Files from Backend API
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
      showToast('Gagal memuat daftar media.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Handle File Uploads
  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploading(true);
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`${data.count || files.length} file berhasil diunggah!`);
        fetchMedia();
      } else {
        showToast('Gagal mengunggah file.', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Terjadi kesalahan saat mengunggah.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e) => {
    handleUploadFiles(e.target.files);
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Delete Media File
  const handleDeleteMedia = async (item) => {
    if (!window.confirm(`Hapus file "${item.originalName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/media/${item.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMediaList(prev => prev.filter(m => m.id !== item.id));
        showToast('File media berhasil dihapus!', 'info');
        if (previewItem?.id === item.id) setPreviewItem(null);
      } else {
        showToast('Gagal menghapus file media.', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Terjadi kesalahan saat menghapus file.', 'error');
    }
  };

  // Copy Full URL to Clipboard
  const handleCopyUrl = (item) => {
    const fullUrl = window.location.origin + item.url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    showToast('Tautan URL disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered Media List
  const filteredMedia = mediaList.filter(item => {
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchSearch =
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Calculate Statistics
  const imageCount = mediaList.filter(m => m.category === 'images').length;
  const videoCount = mediaList.filter(m => m.category === 'videos').length;
  const docCount = mediaList.filter(m => m.category === 'documents').length;

  const renderIconForCategory = (category, size = 18) => {
    switch (category) {
      case 'images':
        return <Image size={size} />;
      case 'videos':
        return <Video size={size} />;
      case 'documents':
        return <FileText size={size} />;
      default:
        return <File size={size} />;
    }
  };

  return (
    <div>
      {/* Top Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderOpen size={24} className="text-accent" />
            Media File Manager & Storage
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Kelola dokumen, foto portofolio, dan video. Disimpan secara lokal di folder <code>uploads/</code> dan siap dimigrasi ke S3 / Cloudflare R2.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => fetchMedia()}
            className="btn btn-secondary btn-sm"
            title="Refresh Media List"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            disabled={uploading}
          >
            <CloudUpload size={18} />
            <span>{uploading ? 'Mengunggah...' : 'Upload Berkas Media'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Stats Mini Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Berkas</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{mediaList.length} File</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Foto & Gambar</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{imageCount} File</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Video</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{videoCount} File</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Dokumen / PDF</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{docCount} File</div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--accent-color)' : 'var(--border-color)'}`,
          background: isDragOver ? 'var(--accent-light)' : 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '1.75rem',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
          <Upload size={22} />
        </div>
        <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
          {isDragOver ? 'Lepaskan file di sini untuk mengunggah...' : 'Tarik & Letakkan Berkas Media di Sini'}
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Mendukung Gambar (PNG, JPG, WebP, SVG, GIF), Video (MP4, WebM), & Dokumen (PDF, DOCX, ZIP). Maksimal 100MB/file.
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
        {/* Category Pills */}
        <div className="filter-pills">
          <button
            className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            Semua ({mediaList.length})
          </button>
          <button
            className={`filter-btn ${categoryFilter === 'images' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('images')}
          >
            Gambar ({imageCount})
          </button>
          <button
            className={`filter-btn ${categoryFilter === 'videos' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('videos')}
          >
            Video ({videoCount})
          </button>
          <button
            className={`filter-btn ${categoryFilter === 'documents' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('documents')}
          >
            Dokumen ({docCount})
          </button>
        </div>

        {/* Right Search & View Mode Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Cari nama berkas media..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.2rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)' }}
              title="Tampilan Grid Galeri"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)' }}
              title="Tampilan Daftar Rinci"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Content Display */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
          <span>Memuat data berkas media...</span>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <FolderOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3>Belum ada berkas media</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Unggah gambar, video, atau dokumen pertama Anda menggunakan tombol di atas.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID GALLERY VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {filteredMedia.map(item => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Media Thumbnail Container */}
              <div
                onClick={() => setPreviewItem(item)}
                style={{
                  height: '140px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                {item.category === 'images' ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : item.category === 'videos' ? (
                  <div style={{ textAlign: 'center', color: '#a855f7' }}>
                    <Video size={36} />
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>Video Clip</div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--accent-color)' }}>
                    <FileText size={36} />
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>Dokumen PDF/Doc</div>
                  </div>
                )}

                {/* Top Category Badge */}
                <span
                  className="badge"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    fontSize: '0.7rem',
                    background: 'rgba(0, 0, 0, 0.65)',
                    color: '#fff',
                    backdropFilter: 'blur(4px)',
                    border: 'none'
                  }}
                >
                  {item.category}
                </span>

                {/* Hover Eye Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    opacity: 0,
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                >
                  <Eye size={22} />
                </div>
              </div>

              {/* Media Card Info */}
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div
                  title={item.originalName}
                  style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '0.25rem'
                  }}
                >
                  {item.originalName}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  <span>{item.formattedSize}</span>
                  <span>{item.formattedDate?.split(',')[0]}</span>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="btn btn-secondary btn-sm"
                    style={{ flexGrow: 1, fontSize: '0.75rem', padding: '0.35rem 0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                    title="Salin Tautan URL"
                  >
                    {copiedId === item.id ? <Check size={13} style={{ color: 'var(--success-color)' }} /> : <Copy size={13} />}
                    <span>{copiedId === item.id ? 'Tersalin' : 'Salin URL'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteMedia(item)}
                    className="btn-icon btn-danger btn-sm"
                    title="Hapus Berkas"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DETAILED TABLE LIST VIEW */
        <div className="table-wrapper">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Berkas</th>
                <th>Nama File Asli</th>
                <th>Kategori</th>
                <th>Ukuran</th>
                <th>Tanggal Upload</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map(item => (
                <tr key={item.id}>
                  <td style={{ width: '60px' }}>
                    <div
                      onClick={() => setPreviewItem(item)}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '4px',
                        background: 'var(--bg-secondary)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {item.category === 'images' ? (
                        <img src={item.url} alt={item.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        renderIconForCategory(item.category, 20)
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{item.originalName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.filename}</div>
                  </td>
                  <td>
                    <span className="badge">{item.category}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{item.formattedSize}</td>
                  <td style={{ fontSize: '0.85rem' }}>{item.formattedDate}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => handleCopyUrl(item)}
                        className="btn-icon btn-secondary"
                        title="Salin Tautan URL"
                      >
                        {copiedId === item.id ? <Check size={16} style={{ color: 'var(--success-color)' }} /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="btn-icon btn-secondary"
                        title="Pratinjau Berkas"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(item)}
                        className="btn-icon btn-danger"
                        title="Hapus Berkas"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MEDIA PREVIEW LIGHTBOX MODAL */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {renderIconForCategory(previewItem.category, 20)}
                {previewItem.originalName}
              </h3>
              <button className="modal-close" onClick={() => setPreviewItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Media Viewer */}
              <div
                style={{
                  background: '#000',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '260px',
                  maxHeight: '440px'
                }}
              >
                {previewItem.category === 'images' ? (
                  <img
                    src={previewItem.url}
                    alt={previewItem.originalName}
                    style={{ maxWidth: '100%', maxHeight: '440px', objectFit: 'contain' }}
                  />
                ) : previewItem.category === 'videos' ? (
                  <video controls style={{ maxWidth: '100%', maxHeight: '440px' }} src={previewItem.url}>
                    Browser Anda tidak mendukung video HTML5.
                  </video>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#fff' }}>
                    <FileText size={64} style={{ color: 'var(--accent-color)', marginBottom: '1rem' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Dokumen / Berkas Lampiran</div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Format: {previewItem.mimetype} ({previewItem.formattedSize})
                    </p>
                  </div>
                )}
              </div>

              {/* Metadata Details Table */}
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Ukuran Berkas</span>
                    <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{previewItem.formattedSize}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Tipe MIME</span>
                    <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{previewItem.mimetype}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Tanggal Unggah</span>
                    <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{previewItem.formattedDate}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Penyimpanan</span>
                    <div style={{ fontWeight: 600, marginTop: '0.15rem', color: 'var(--success-color)' }}>
                      Local Folder (S3 Ready)
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Tautan Langsung (URL)</span>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <input
                      type="text"
                      readOnly
                      value={window.location.origin + previewItem.url}
                      className="form-control"
                      style={{ fontSize: '0.8rem', background: 'var(--bg-secondary)' }}
                    />
                    <button
                      onClick={() => handleCopyUrl(previewItem)}
                      className="btn btn-secondary btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {copiedId === previewItem.id ? <Check size={14} /> : <Copy size={14} />} Salin
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a
                  href={previewItem.url}
                  download={previewItem.originalName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <ExternalLink size={16} /> Unduh Berkas
                </a>

                <button
                  onClick={() => handleDeleteMedia(previewItem)}
                  className="btn btn-danger"
                >
                  <Trash2 size={16} /> Hapus Berkas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaTab;
