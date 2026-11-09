import React, { useState, useRef } from 'react';
import { Download, Briefcase, Award, MapPin, Mail, Phone, Code2, Eye, Printer, X, FileText, FileDown } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
import { AtsResumeDocument } from '../components/AtsResumeTemplate';

const AboutPage = () => {
  const { profile, cvData, experiences, skills, showToast, t, language, trackEvent } = usePortfolio();
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const resumePrintRef = useRef(null);

  const handleDownloadResume = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const { downloadResume } = await import('../lib/resumePdf');
      await downloadResume(profile, {...cvData, experiences, skills}, language);
      trackEvent({ type: 'cv_download', profileId: cvData?.id });
      showToast(language === 'EN' ? 'CV downloaded.' : 'CV berhasil diunduh.');
    } catch (error) { showToast(error.message || 'Ekspor PDF gagal.', 'error'); }
    finally { setIsGeneratingPdf(false); }
  };

  const handlePrintResume = () => {
    window.print();
  };

  // Group skills by category
  const categories = Array.from(new Set(skills.map(s => s.category)));

  return (
    <div className="page-wrapper container">
      {/* Page Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div className="section-tag">
          <Award size={14} /> {t('aboutTag')}
        </div>
        <h1 className="section-title">{t('aboutTitle')}</h1>
        <p className="section-subtitle">
          {t('aboutSubtitle')}
        </p>
      </div>

      {/* Bio Grid */}
      <div className="contact-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <img
            src={profile.avatar}
            alt={profile.name}
            style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}
          />

          <div className="contact-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              {language === 'EN' ? 'Contact Information' : 'Informasi Kontak'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <MapPin size={16} className="text-accent" />
                <span>{profile.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <Mail size={16} className="text-accent" />
                <span>{profile.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <Phone size={16} className="text-accent" />
                <span>{profile.phone}</span>
              </div>
            </div>

            {/* CV Actions Group */}
            {profile.resumeUrl && <a className="btn btn-secondary" href={profile.resumeUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent({ type: 'cv_download', profileId: cvData?.id })}>{language === 'EN' ? 'Open uploaded PDF' : 'Buka PDF unggahan'}</a>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleDownloadResume}
                disabled={isGeneratingPdf}
                className="btn btn-primary"
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Download size={18} />
                <span>{isGeneratingPdf ? (language === 'EN' ? 'Building PDF...' : 'Membuat PDF...') : `${t('btnDownloadCV')} (${language})`}</span>
              </button>

              <button
                onClick={() => setShowResumeModal(true)}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
              >
                <Eye size={16} />
                <span>{t('btnViewCV')}</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {language === 'EN' ? (profile.roleEn || profile.role) : profile.role}
          </h2>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>
            {language === 'EN' && profile.bioEn ? profile.bioEn : profile.bio}
          </p>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {language === 'EN'
              ? "I believe that reliable IT infrastructure operations and fast problem-solving are essential foundations for any successful enterprise."
              : "Saya berkomitmen pada kelancaran operasional harian, keamanan data, dan efisiensi penyelesaian masalah teknologi di lingkungan perusahaan."}
          </p>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={18} className="text-accent" /> {language === 'EN' ? 'Engineering Philosophy & Core Principles' : 'Filosofi & Prinsip Kerja'}
            </h3>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
              <li><strong>High Mobility & Responsiveness:</strong> {language === 'EN' ? 'Agile on-site technical resolution of operational incidents.' : 'Tanggap cepat dalam mengatasi insiden teknis operasional.'}</li>
              <li><strong>Security & Data Integrity:</strong> {language === 'EN' ? 'Adherence to backup protocols, system security audits, and business continuity.' : 'Menjaga kepatuhan backup, audit keamanan sistem, dan kontinuitas bisnis.'}</li>
              <li><strong>Continuous Learning:</strong> {language === 'EN' ? 'Continuously adapting to modern networking, cloud services, and enterprise ERP systems.' : 'Selalu beradaptasi dengan perkembangan jaringan, cloud, dan sistem ERP enterprise.'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Full Skill Matrix Breakdown */}
      <section className="skills-section-wrapper">
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="section-tag">
            <Code2 size={14} /> {t('skillsTitle')}
          </div>
          <h2 className="section-title">{language === 'EN' ? 'Skill Matrix & Technical Proficiency' : 'Kualifikasi & Tingkat Kemahiran'}</h2>
          <p className="section-subtitle">
            {language === 'EN' ? 'Proficiency levels across networking, hardware, cloud systems, and enterprise toolsets.' : 'Tingkat penguasaan teknologi, bahasa pemrograman, framework, dan perangkat desain yang digunakan dalam proyek.'}
          </p>
        </div>

        <div className="skills-category-group">
          {categories.map(cat => {
            const catSkills = skills.filter(s => s.category === cat);
            if (catSkills.length === 0) return null;

            return (
              <div key={cat} className="skill-category-card">
                <div className="skill-category-header">
                  <h3 className="skill-category-title">
                    <Code2 size={18} className="text-accent" />
                    <span>{cat}</span>
                  </h3>
                  <span className="badge" style={{ fontSize: '0.75rem' }}>
                    {catSkills.length} {language === 'EN' ? 'Skills' : 'Keahlian'}
                  </span>
                </div>

                <div className="skills-list">
                  {catSkills.map(sk => {
                    const skillName = language === 'EN' ? (sk.nameEn || sk.name) : sk.name;

                    return (
                      <div key={sk.id} className="skill-item">
                        <div className="skill-item-header">
                          <span className="skill-item-name">{skillName}</span>
                          <span className="skill-item-level">{sk.level}%</span>
                        </div>
                        <div className="skill-progress-track">
                          <div
                            className="skill-progress-bar"
                            style={{ width: `${sk.level}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="section-block">
        <div className="section-tag">
          <Briefcase size={14} /> {t('expTitle')}
        </div>
        <h2 className="section-title">{language === 'EN' ? 'Professional Experience Timeline' : 'Riwayat Profesional & Pengalaman Industri'}</h2>
        <p className="section-subtitle">
          {language === 'EN' ? 'Track record in designing and maintaining enterprise technology solutions.' : 'Jejak pengalaman dalam merancang dan membangun solusi teknologi perangkat lunak.'}
        </p>

        <div className="timeline">
          {experiences
            .filter(exp => exp.isActive !== false)
            .map(exp => {
              const expRole = language === 'EN' ? (exp.roleEn || exp.role) : exp.role;
              const expPeriod = language === 'EN' ? (exp.periodEn || exp.period) : exp.period;
              const expDesc = language === 'EN' ? (exp.descriptionEn || exp.description) : exp.description;

              return (
                <div key={exp.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div>
                        <h3 className="timeline-role">{expRole}</h3>
                        <span className="timeline-company">{exp.company}</span>
                      </div>
                      <span className="timeline-period">{expPeriod}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: '0.75rem 0', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {expDesc}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {exp.skills?.map((sk, i) => (
                        <span key={i} className="badge">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* ATS DIGITAL RESUME PREVIEW & PRINT MODAL */}
      {showResumeModal && (
        <div className="modal-overlay" onClick={() => setShowResumeModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '860px', maxHeight: '92vh', overflowY: 'auto', background: 'var(--bg-secondary)' }}
          >
            <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} className="text-accent" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {language === 'EN' ? 'Digital ATS Resume Preview (Selectable Text)' : 'Pratinjau CV Digital (Teks yang Dapat Dibaca)'}
                </h3>
                <span className="badge" style={{ fontSize: '0.75rem', background: 'var(--accent-light)', color: 'var(--accent-color)' }}>
                  {language === 'EN' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={handleDownloadResume} disabled={isGeneratingPdf}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FileDown size={14} /> {language === 'EN' ? 'Download PDF' : 'Unduh PDF'}
                </button>

                <button
                  onClick={handlePrintResume}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Printer size={14} /> {language === 'EN' ? 'Print' : 'Cetak'}
                </button>

                <button className="modal-close" onClick={() => setShowResumeModal(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Document Paper Container */}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  background: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  borderRadius: '4px',
                  width: '100%',
                  maxWidth: '780px'
                }}
              >
                <AtsResumeDocument
                  forwardedRef={resumePrintRef}
                  profile={profile}
                  cvData={cvData}
                  experiences={cvData?.experiences || experiences}
                  skills={cvData?.skills || skills}
                  language={language}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPage;
