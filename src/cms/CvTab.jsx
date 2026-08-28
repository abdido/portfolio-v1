import React, { useState, useRef } from 'react';
import {
  FileText,
  Save,
  Download,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  Sparkles,
  Printer
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { AtsResumeDocument, downloadAtsPdf } from '../components/AtsResumeTemplate';

const CvTab = () => {
  const { cvData, updateCvData, profile, showToast } = usePortfolio();

  // Local Form State clone of cvData
  const [formCv, setFormCv] = useState(() => ({
    name: cvData?.name || profile?.name || 'SULISTYAWAN ABDILLAH ROSYID',
    roleId: cvData?.roleId || 'IT SUPPORT',
    roleEn: cvData?.roleEn || 'IT SUPPORT SPECIALIST',
    locationId: cvData?.locationId || 'Balikpapan, Indonesia',
    locationEn: cvData?.locationEn || 'Balikpapan, Indonesia',
    phone: cvData?.phone || profile?.phone || '+62 8131 3165 8141',
    email: cvData?.email || profile?.email || 'sulistyawanar@gmail.com',
    summaryId: cvData?.summaryId || '',
    summaryEn: cvData?.summaryEn || '',
    education: cvData?.education || [
      {
        institution: 'INSTITUT TEKNOLOGI KALIMANTAN',
        institutionEn: 'INSTITUTE OF TECHNOLOGY KALIMANTAN',
        degree: 'S1 Informatika – IPK 3.43',
        degreeEn: 'Bachelor of Computer Science – GPA 3.43'
      }
    ],
    experiences: cvData?.experiences || [],
    skills: cvData?.skills || []
  }));

  const [activeEditLang, setActiveEditLang] = useState('ID'); // 'ID' | 'EN'
  const [previewLang, setPreviewLang] = useState('ID'); // 'ID' | 'EN'
  const [isGenerating, setIsGenerating] = useState(false);

  const previewRef = useRef(null);

  // Save changes to database API
  const handleSaveAll = (e) => {
    if (e) e.preventDefault();
    updateCvData(formCv);
  };

  // Download PDF
  const handleDownload = async (langToDownload) => {
    try {
      setIsGenerating(true);
      showToast(`Menyusun berkas PDF CV (${langToDownload === 'EN' ? 'English' : 'Indonesia'})...`, 'info');
      setPreviewLang(langToDownload);

      setTimeout(async () => {
        if (previewRef.current) {
          await downloadAtsPdf(previewRef.current, formCv.name, langToDownload);
          showToast(`CV PDF (${langToDownload}) berhasil diunduh!`, 'success');
        }
        setIsGenerating(false);
      }, 350);
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Gagal mengunduh PDF', 'error');
      setIsGenerating(false);
    }
  };

  // Add / Remove Education
  const handleAddEducation = () => {
    setFormCv(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', institutionEn: '', degree: '', degreeEn: '' }
      ]
    }));
  };

  const handleRemoveEducation = (index) => {
    setFormCv(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Add / Remove Experience
  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: '',
      location: 'Balikpapan, Indonesia',
      role: '',
      roleEn: '',
      period: '2024 - Sekarang',
      periodEn: '2024 - Present',
      description: '• ',
      descriptionEn: '• ',
      isActive: true,
      skills: ['IT Support']
    };
    setFormCv(prev => ({
      ...prev,
      experiences: [newExp, ...prev.experiences]
    }));
  };

  const handleRemoveExperience = (id) => {
    if (window.confirm('Hapus riwayat pengalaman ini dari CV?')) {
      setFormCv(prev => ({
        ...prev,
        experiences: prev.experiences.filter(e => e.id !== id)
      }));
    }
  };

  // Add / Remove Skill
  const handleAddSkill = () => {
    const newSk = {
      id: `sk-${Date.now()}`,
      category: 'Jaringan & Fisik',
      categoryEn: 'Infrastructure & Network',
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      level: 90
    };
    setFormCv(prev => ({
      ...prev,
      skills: [...prev.skills, newSk]
    }));
  };

  const handleRemoveSkill = (id) => {
    if (window.confirm('Hapus kemampuan ini dari CV?')) {
      setFormCv(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s.id !== id)
      }));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} className="text-accent" />
            Kelola Dokumen CV & Resume ATS
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Kelola ringkasan profesional, riwayat pendidikan, pengalaman, dan keahlian dalam <strong>Bahasa Indonesia & English</strong> tanpa mengganggu bio ringkas website utama.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => handleDownload('ID')}
            className="btn btn-secondary btn-sm"
            disabled={isGenerating}
          >
            <Download size={14} /> Unduh PDF (ID)
          </button>

          <button
            onClick={() => handleDownload('EN')}
            className="btn btn-secondary btn-sm"
            disabled={isGenerating}
          >
            <Globe size={14} /> Unduh PDF (EN)
          </button>

          <button
            onClick={handleSaveAll}
            className="btn btn-primary"
          >
            <Save size={16} /> Simpan Seluruh Perubahan CV
          </button>
        </div>
      </div>

      {/* Editor Language Switcher Pill */}
      <div style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mode Bahasa Form Editor:</span>
          <div className="filter-pills">
            <button
              className={`filter-btn ${activeEditLang === 'ID' ? 'active' : ''}`}
              onClick={() => setActiveEditLang('ID')}
            >
              🇮🇩 Bahasa Indonesia
            </button>
            <button
              className={`filter-btn ${activeEditLang === 'EN' ? 'active' : ''}`}
              onClick={() => setActiveEditLang('EN')}
            >
              🇬🇧 English (International)
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          💡 Saat pengunjung website mengklik toggle [ID / EN], CV otomatis beradaptasi dengan bahasa yang aktif.
        </div>
      </div>

      {/* 2-Column Full-Width Workspace Grid: Left Editor, Right Live A4 Preview */}
      <div className="cv-workspace-grid">
        {/* LEFT COLUMN: EDIT FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* SECTION 1: HEADER & IDENTITAS CV */}
          <div className="contact-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={18} className="text-accent" /> Header & Kontak CV
            </h3>

            <div className="form-group">
              <label className="form-label">Nama Lengkap (Dicetak di Bagian Atas CV) *</label>
              <input
                type="text"
                className="form-control"
                value={formCv.name}
                onChange={(e) => setFormCv({ ...formCv, name: e.target.value })}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  {activeEditLang === 'EN' ? 'Professional Title (English) *' : 'Jabatan / Profesi (Bahasa Indonesia) *'}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={activeEditLang === 'EN' ? 'IT SUPPORT SPECIALIST' : 'IT SUPPORT'}
                  value={activeEditLang === 'EN' ? formCv.roleEn : formCv.roleId}
                  onChange={(e) => setFormCv(prev => ({
                    ...prev,
                    [activeEditLang === 'EN' ? 'roleEn' : 'roleId']: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lokasi Domisili</label>
                <input
                  type="text"
                  className="form-control"
                  value={activeEditLang === 'EN' ? formCv.locationEn : formCv.locationId}
                  onChange={(e) => setFormCv(prev => ({
                    ...prev,
                    [activeEditLang === 'EN' ? 'locationEn' : 'locationId']: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nomor Telepon</label>
                <input
                  type="text"
                  className="form-control"
                  value={formCv.phone}
                  onChange={(e) => setFormCv({ ...formCv, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Kontak Resmi</label>
                <input
                  type="email"
                  className="form-control"
                  value={formCv.email}
                  onChange={(e) => setFormCv({ ...formCv, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DEDICATED CV SUMMARY */}
          <div className="contact-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={18} className="text-accent" />
              {activeEditLang === 'EN' ? 'CV Professional Summary (English)' : 'Ringkasan Profesional CV (Bahasa Indonesia)'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Paragraf komprehensif ATS yang dicetak di bawah nama pada dokumen CV.
            </p>

            <textarea
              rows="6"
              className="form-control"
              placeholder={activeEditLang === 'EN' ? 'Write detailed English summary for CV...' : 'Tuliskan ringkasan komprehensif untuk dokumen CV...'}
              value={activeEditLang === 'EN' ? formCv.summaryEn : formCv.summaryId}
              onChange={(e) => setFormCv(prev => ({
                ...prev,
                [activeEditLang === 'EN' ? 'summaryEn' : 'summaryId']: e.target.value
              }))}
            ></textarea>
          </div>

          {/* SECTION 3: EDUCATION (PENDIDIKAN) */}
          <div className="contact-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GraduationCap size={18} className="text-accent" /> Riwayat Pendidikan CV
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} /> Tambah Pendidikan
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formCv.education.map((edu, idx) => (
                <div
                  key={idx}
                  style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  <div className="form-group">
                    <label className="form-label">
                      {activeEditLang === 'EN' ? 'Institution Name (English) *' : 'Nama Universitas / Institusi *'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="INSTITUT TEKNOLOGI KALIMANTAN"
                      value={activeEditLang === 'EN' ? (edu.institutionEn || edu.institution) : edu.institution}
                      onChange={(e) => {
                        const updated = [...formCv.education];
                        updated[idx] = {
                          ...updated[idx],
                          [activeEditLang === 'EN' ? 'institutionEn' : 'institution']: e.target.value
                        };
                        setFormCv({ ...formCv, education: updated });
                      }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label">
                      {activeEditLang === 'EN' ? 'Degree & GPA (English) *' : 'Jenjang, Program Studi & IPK *'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={activeEditLang === 'EN' ? 'Bachelor of Computer Science – GPA 3.43' : 'S1 Informatika – IPK 3.43'}
                      value={activeEditLang === 'EN' ? (edu.degreeEn || edu.degree) : edu.degree}
                      onChange={(e) => {
                        const updated = [...formCv.education];
                        updated[idx] = {
                          ...updated[idx],
                          [activeEditLang === 'EN' ? 'degreeEn' : 'degree']: e.target.value
                        };
                        setFormCv({ ...formCv, education: updated });
                      }}
                      required
                    />
                  </div>

                  {formCv.education.length > 1 && (
                    <div style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Trash2 size={12} /> Hapus Pendidikan
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: EXPERIENCES (PENGALAMAN KERJA CV) */}
          <div className="contact-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={18} className="text-accent" /> Riwayat Pengalaman Kerja CV
              </h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} /> Tambah Posisi
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {formCv.experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge" style={{ fontSize: '0.75rem' }}>Posisi #{idx + 1}</span>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <input
                        type="checkbox"
                        checked={exp.isActive !== false}
                        onChange={(e) => {
                          const updated = [...formCv.experiences];
                          updated[idx] = { ...updated[idx], isActive: e.target.checked };
                          setFormCv({ ...formCv, experiences: updated });
                        }}
                      />
                      <span style={{ fontWeight: 600 }}>Tampilkan di CV (Aktif)</span>
                    </label>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Nama Perusahaan *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="PT. CATUR PILAR SEJATI"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...formCv.experiences];
                          updated[idx] = { ...updated[idx], company: e.target.value };
                          setFormCv({ ...formCv, experiences: updated });
                        }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Lokasi Perusahaan</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Balikpapan, Indonesia"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = [...formCv.experiences];
                          updated[idx] = { ...updated[idx], location: e.target.value };
                          setFormCv({ ...formCv, experiences: updated });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">
                        {activeEditLang === 'EN' ? 'Role / Position (English) *' : 'Posisi / Jabatan (Bahasa Indonesia) *'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={activeEditLang === 'EN' ? 'IT Support Specialist' : 'IT Support'}
                        value={activeEditLang === 'EN' ? (exp.roleEn || exp.role) : exp.role}
                        onChange={(e) => {
                          const updated = [...formCv.experiences];
                          updated[idx] = {
                            ...updated[idx],
                            [activeEditLang === 'EN' ? 'roleEn' : 'role']: e.target.value
                          };
                          setFormCv({ ...formCv, experiences: updated });
                        }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {activeEditLang === 'EN' ? 'Period (English) *' : 'Periode Kerja (Bahasa Indonesia) *'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={activeEditLang === 'EN' ? 'October 2022 – February 2024' : 'Oktober 2022 – Februari 2024'}
                        value={activeEditLang === 'EN' ? (exp.periodEn || exp.period) : exp.period}
                        onChange={(e) => {
                          const updated = [...formCv.experiences];
                          updated[idx] = {
                            ...updated[idx],
                            [activeEditLang === 'EN' ? 'periodEn' : 'period']: e.target.value
                          };
                          setFormCv({ ...formCv, experiences: updated });
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {activeEditLang === 'EN' ? 'Bullet Points Responsibilities (English) *' : 'Poin-poin Tanggung Jawab (Bahasa Indonesia) *'}
                    </label>
                    <textarea
                      rows="5"
                      className="form-control"
                      placeholder={activeEditLang === 'EN' ? '• Proactively provided IT helpdesk...\n• Managed corporate network...' : '• Memberikan dukungan teknis perangkat...\n• Mengelola infrastruktur jaringan...'}
                      value={activeEditLang === 'EN' ? (exp.descriptionEn || exp.description) : exp.description}
                      onChange={(e) => {
                        const updated = [...formCv.experiences];
                        updated[idx] = {
                          ...updated[idx],
                          [activeEditLang === 'EN' ? 'descriptionEn' : 'description']: e.target.value
                        };
                        setFormCv({ ...formCv, experiences: updated });
                      }}
                      required
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="btn btn-danger btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Trash2 size={12} /> Hapus Posisi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: SKILLS & COMPETENCIES (KEMAMPUAN CV) */}
          <div className="contact-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={18} className="text-accent" /> Kemampuan & Rincian Deskripsi CV
              </h3>
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} /> Tambah Kemampuan
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formCv.skills.map((sk, idx) => (
                <div
                  key={sk.id}
                  style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                >
                  <div className="form-group">
                    <label className="form-label">
                      {activeEditLang === 'EN' ? 'Skill Title (English) *' : 'Judul Kemampuan (Bahasa Indonesia) *'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={activeEditLang === 'EN' ? 'Physical Infrastructure & Cabling' : 'Infrastruktur & Jaringan Fisik'}
                      value={activeEditLang === 'EN' ? (sk.nameEn || sk.name) : sk.name}
                      onChange={(e) => {
                        const updated = [...formCv.skills];
                        updated[idx] = {
                          ...updated[idx],
                          [activeEditLang === 'EN' ? 'nameEn' : 'name']: e.target.value
                        };
                        setFormCv({ ...formCv, skills: updated });
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {activeEditLang === 'EN' ? 'Detailed Description (English) *' : 'Rincian Deskripsi Kemampuan (Bahasa Indonesia) *'}
                    </label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder={activeEditLang === 'EN' ? 'UTP/LAN cable routing, rack cable management, RJ45 crimping termination...' : 'Penarikan jalur kabel (UTP/LAN), cable management, terminasi kabel...'}
                      value={activeEditLang === 'EN' ? (sk.descriptionEn || sk.description) : sk.description}
                      onChange={(e) => {
                        const updated = [...formCv.skills];
                        updated[idx] = {
                          ...updated[idx],
                          [activeEditLang === 'EN' ? 'descriptionEn' : 'description']: e.target.value
                        };
                        setFormCv({ ...formCv, skills: updated });
                      }}
                      required
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk.id)}
                      className="btn btn-danger btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Trash2 size={12} /> Hapus Kemampuan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Button */}
          <button
            type="button"
            onClick={handleSaveAll}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
          >
            <Save size={18} /> Simpan Seluruh Perubahan CV
          </button>
        </div>

        {/* RIGHT COLUMN: LIVE A4 ATS PREVIEW CONTAINER */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={18} className="text-accent" />
                <strong style={{ fontSize: '0.95rem' }}>Pratinjau Lembar A4 Real-Time</strong>
              </div>

              {/* Preview Language Pills */}
              <div className="filter-pills">
                <button
                  className={`filter-btn btn-sm ${previewLang === 'ID' ? 'active' : ''}`}
                  onClick={() => setPreviewLang('ID')}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                >
                  🇮🇩 ID
                </button>
                <button
                  className={`filter-btn btn-sm ${previewLang === 'EN' ? 'active' : ''}`}
                  onClick={() => setPreviewLang('EN')}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                >
                  🇬🇧 EN
                </button>
              </div>
            </div>

            {/* A4 Paper Scaled Down Container */}
            <div
              style={{
                background: '#525659',
                padding: '12px',
                borderRadius: '6px',
                maxHeight: '75vh',
                overflowY: 'auto'
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  borderRadius: '2px',
                  margin: '0 auto'
                }}
              >
                <AtsResumeDocument
                  forwardedRef={previewRef}
                  profile={profile}
                  cvData={formCv}
                  experiences={formCv.experiences}
                  skills={formCv.skills}
                  language={previewLang}
                />
              </div>
            </div>

            {/* Download Footer for Preview */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => handleDownload(previewLang)}
                className="btn btn-primary btn-sm"
                style={{ flexGrow: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                disabled={isGenerating}
              >
                <Download size={14} /> Unduh PDF ({previewLang})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CvTab;
