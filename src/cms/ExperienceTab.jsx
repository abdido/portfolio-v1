import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Award, Briefcase, Search, Code2, SlidersHorizontal, MapPin, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const ExperienceTab = () => {
  const { experiences, skills, addExperience, updateExperience, deleteExperience, addSkill, updateSkill, deleteSkill } = usePortfolio();

  // Experience modal state
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [expData, setExpData] = useState({
    role: '',
    company: '',
    location: '',
    period: '',
    description: '',
    skills: '',
    isActive: true
  });

  // Skill modal state
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('all');

  const [skillData, setSkillData] = useState({
    name: '',
    category: 'Jaringan & Fisik',
    description: '',
    level: 90
  });

  // Dynamic Skill Categories
  const existingSkillCategories = useMemo(() => {
    const defaults = ['Jaringan & Fisik', 'Hardware & Helpdesk', 'Sistem & ERP', 'Web & Cloud', 'Soft Skills', 'Manajemen', 'Frontend', 'Backend'];
    const fromSkills = skills.map(s => s.category).filter(Boolean);
    return Array.from(new Set([...defaults, ...fromSkills]));
  }, [skills]);

  // Handle Experience Modals
  const handleOpenAddExp = () => {
    setEditingExp(null);
    setExpData({
      role: '',
      company: '',
      location: 'Balikpapan, Indonesia',
      period: '2024 - Sekarang',
      description: '',
      skills: 'IT Support, Network',
      isActive: true
    });
    setExpModalOpen(true);
  };

  const handleOpenEditExp = (exp) => {
    setEditingExp(exp);
    setExpData({
      role: exp.role || '',
      company: exp.company || '',
      location: exp.location || 'Balikpapan, Indonesia',
      period: exp.period || '',
      description: exp.description || '',
      skills: exp.skills ? exp.skills.join(', ') : '',
      isActive: exp.isActive !== false
    });
    setExpModalOpen(true);
  };

  const handleToggleExperienceStatus = (exp) => {
    const newStatus = exp.isActive === false ? true : false;
    updateExperience(exp.id, {
      ...exp,
      isActive: newStatus
    });
  };

  const handleExpSubmit = (e) => {
    e.preventDefault();
    const skillList = expData.skills.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { ...expData, skills: skillList };

    if (editingExp) {
      updateExperience(editingExp.id, payload);
    } else {
      addExperience(payload);
    }
    setExpModalOpen(false);
  };

  // Handle Skill Modals
  const handleOpenAddSkill = () => {
    setEditingSkill(null);
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setSkillData({
      name: '',
      category: existingSkillCategories[0] || 'Jaringan & Fisik',
      description: '',
      level: 90
    });
    setSkillModalOpen(true);
  };

  const handleOpenEditSkill = (sk) => {
    setEditingSkill(sk);
    const isCustom = !existingSkillCategories.includes(sk.category);
    setIsCustomCategory(isCustom);
    setCustomCategoryInput(isCustom ? sk.category : '');
    setSkillData({
      name: sk.name || '',
      category: sk.category || 'Jaringan & Fisik',
      description: sk.description || '',
      level: sk.level || 90
    });
    setSkillModalOpen(true);
  };

  const handleSkillCategorySelectChange = (e) => {
    const val = e.target.value;
    if (val === '__NEW_CATEGORY__') {
      setIsCustomCategory(true);
      setSkillData(prev => ({ ...prev, category: '' }));
    } else {
      setIsCustomCategory(false);
      setSkillData(prev => ({ ...prev, category: val }));
    }
  };

  const handleSkillSubmit = (e) => {
    e.preventDefault();
    const finalCategory = isCustomCategory ? customCategoryInput.trim() : skillData.category;

    if (!finalCategory) {
      alert("Silakan masukkan nama kategori keahlian!");
      return;
    }

    const payload = {
      name: skillData.name.trim(),
      category: finalCategory,
      description: skillData.description.trim(),
      level: Number(skillData.level)
    };

    if (editingSkill) {
      updateSkill(editingSkill.id, payload);
    } else {
      addSkill(payload);
    }

    setSkillModalOpen(false);
  };

  // Filter skills
  const filteredSkills = skills.filter(sk => {
    const matchCat = selectedSkillCategory === 'all' || sk.category === selectedSkillCategory;
    const matchSearch = sk.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
                        sk.category.toLowerCase().includes(skillSearch.toLowerCase()) ||
                        (sk.description && sk.description.toLowerCase().includes(skillSearch.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* Experience Section */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} className="text-accent" /> Kelola Linimasa Pengalaman Kerja
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Riwayat perusahaan, posisi pekerjaan, dan rincian tanggung jawab. Anda dapat mengaktifkan / menonaktifkan tampilan tanpa menghapusnya.
            </p>
          </div>

          <button onClick={handleOpenAddExp} className="btn btn-primary">
            <Plus size={18} /> Tambah Pengalaman
          </button>
        </div>

        <div className="table-wrapper">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Status Tampil</th>
                <th>Perusahaan & Posisi</th>
                <th>Lokasi & Periode</th>
                <th>Tanggung Jawab (CV Bullets)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map(exp => {
                const isActive = exp.isActive !== false;
                return (
                  <tr
                    key={exp.id}
                    style={{
                      opacity: isActive ? 1 : 0.6,
                      background: isActive ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    {/* Active Toggle Column */}
                    <td style={{ minWidth: '130px' }}>
                      <button
                        onClick={() => handleToggleExperienceStatus(exp)}
                        className={`badge ${isActive ? 'badge-active-toggle' : 'badge-inactive-toggle'}`}
                        style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          border: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                          background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                          color: isActive ? 'var(--success-color)' : 'var(--text-muted)'
                        }}
                        title={isActive ? "Klik untuk sembunyikan dari website & CV" : "Klik untuk tampilkan di website & CV"}
                      >
                        {isActive ? (
                          <>
                            <Eye size={13} style={{ color: 'var(--success-color)' }} />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td>
                      <strong>{exp.company}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600 }}>{exp.role}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{exp.location || 'Balikpapan, Indonesia'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.period}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-line' }}>
                        {exp.description}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleToggleExperienceStatus(exp)}
                          className="btn-icon btn-secondary"
                          title={isActive ? "Nonaktifkan (Sembunyikan)" : "Aktifkan (Tampilkan)"}
                        >
                          {isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => handleOpenEditExp(exp)} className="btn-icon btn-secondary" title="Edit Pengalaman">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { if (window.confirm("Hapus pengalaman ini secara permanen?")) deleteExperience(exp.id); }} className="btn-icon btn-danger" title="Hapus Permanen">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skill Matrix Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} className="text-accent" /> Kelola Matrix Kemampuan & Keahlian CV
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Daftar keahlian teknis, kategori, deskripsi rincian, dan persentase penguasaan untuk CV & Halaman Tentang.
            </p>
          </div>

          <button onClick={handleOpenAddSkill} className="btn btn-primary">
            <Plus size={18} /> Tambah Skill Baru
          </button>
        </div>

        {/* Filter & Search Bar for Skills */}
        <div className="filter-bar" style={{ marginBottom: '1rem' }}>
          <div className="filter-pills">
            <button
              className={`filter-btn ${selectedSkillCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSkillCategory('all')}
            >
              Semua ({skills.length})
            </button>
            {existingSkillCategories.map(cat => {
              const count = skills.filter(s => s.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  className={`filter-btn ${selectedSkillCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedSkillCategory(cat)}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Cari nama skill / deskripsi..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Kategori & Judul Kemampuan</th>
                <th>Deskripsi Rincian (Tampil di CV)</th>
                <th>Kemahiran (%)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.length > 0 ? (
                filteredSkills.map(sk => (
                  <tr key={sk.id}>
                    <td style={{ minWidth: '180px' }}>
                      <span className="badge" style={{ marginBottom: '4px' }}>{sk.category}</span>
                      <div><strong>{sk.name}</strong></div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {sk.description || '-'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-color)' }}>{sk.level}%</td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => handleOpenEditSkill(sk)} className="btn-icon btn-secondary" title="Edit Skill">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { if (window.confirm(`Hapus skill "${sk.name}"?`)) deleteSkill(sk.id); }} className="btn-icon btn-danger" title="Hapus Skill">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Tidak ada keahlian yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Experience Form Modal */}
      {expModalOpen && (
        <div className="modal-overlay" onClick={() => setExpModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {editingExp ? 'Edit Pengalaman Kerja' : 'Tambah Pengalaman Kerja'}
              </h3>
              <button className="modal-close" onClick={() => setExpModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExpSubmit} className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama Perusahaan *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: PT. CATUR PILAR SEJATI"
                    value={expData.company}
                    onChange={(e) => setExpData({ ...expData, company: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Lokasi Perusahaan</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Balikpapan, Indonesia"
                    value={expData.location}
                    onChange={(e) => setExpData({ ...expData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Posisi / Jabatan *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="IT Support"
                    value={expData.role}
                    onChange={(e) => setExpData({ ...expData, role: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Periode Kerja *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Oktober 2022 – Februari 2024"
                    value={expData.period}
                    onChange={(e) => setExpData({ ...expData, period: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Poin-poin Tanggung Jawab (Gunakan • atau baris baru per poin) *</label>
                <textarea
                  rows="6"
                  className="form-control"
                  placeholder="• Memberikan dukungan teknis perangkat keras dan lunak...&#10;• Mengelola infrastruktur jaringan perusahaan..."
                  value={expData.description}
                  onChange={(e) => setExpData({ ...expData, description: e.target.value })}
                  required
                ></textarea>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  💡 Format ini otomatis dicetak menjadi bullet point rapi di dokumen CV PDF.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Tag Skill Terkait (pisahkan dengan koma)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="IT Helpdesk, MikroTik, SAP, ERP"
                  value={expData.skills}
                  onChange={(e) => setExpData({ ...expData, skills: e.target.value })}
                />
              </div>

              {/* Toggle Status Checkbox in Modal */}
              <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label className="checkbox-label" style={{ cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={expData.isActive}
                    onChange={(e) => setExpData({ ...expData, isActive: e.target.checked })}
                  />
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Tampilkan Pengalaman Ini (Status: Aktif)</span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Jika tidak dicentang, pengalaman ini akan disembunyikan dari Website & CV tanpa dihapus dari database.
                    </div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setExpModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Pengalaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skill Form Modal */}
      {skillModalOpen && (
        <div className="modal-overlay" onClick={() => setSkillModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} className="text-accent" />
                {editingSkill ? 'Edit Kemampuan' : 'Tambah Kemampuan Baru'}
              </h3>
              <button className="modal-close" onClick={() => setSkillModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSkillSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Nama / Judul Kemampuan *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Infrastruktur & Jaringan Fisik"
                  value={skillData.name}
                  onChange={(e) => setSkillData({ ...skillData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori *</label>
                <select
                  className="form-control"
                  value={isCustomCategory ? '__NEW_CATEGORY__' : skillData.category}
                  onChange={handleSkillCategorySelectChange}
                >
                  {existingSkillCategories.map(cat => (
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
                <label className="form-label">Deskripsi Rincian (Dicetak di Dokumen CV) *</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Penarikan jalur kabel (UTP/LAN), cable management, terminasi kabel (crimping RJ45), pengujian LAN tester..."
                  value={skillData.description}
                  onChange={(e) => setSkillData({ ...skillData, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Tingkat Penguasaan</label>
                  <span style={{ fontWeight: 800, color: 'var(--accent-color)', fontSize: '1.1rem' }}>{skillData.level}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                  value={skillData.level}
                  onChange={(e) => setSkillData({ ...skillData, level: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSkillModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSkill ? 'Simpan Perubahan' : 'Tambah Kemampuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceTab;
