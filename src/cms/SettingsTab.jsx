import React, { useState, useRef } from 'react';
import { Save, Key, Download, Upload, RotateCcw, User, ShieldCheck, FileText, CheckCircle2, GraduationCap, MapPin } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';

const SettingsTab = () => {
  const { profile, updateProfile, updatePassword, resetToDefaults, exportDataJSON, importDataJSON, showToast } = usePortfolio();

  const [profileForm, setProfileForm] = useState({ ...profile });
  const [educationForm, setEducationForm] = useState(
    profile.education?.[0] || {
      institution: "INSTITUT TEKNOLOGI KALIMANTAN",
      degree: "S1 Informatika – IPK 3.43"
    }
  );
  const [socialsForm, setSocialsForm] = useState({ ...profile.socials });
  const [passcodeForm, setPasscodeForm] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [uploadingCV, setUploadingCV] = useState(false);

  const cvInputRef = useRef(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      ...profileForm,
      education: [educationForm],
      socials: socialsForm
    });
  };

  const handleSavePasscode = async (e) => {
    e.preventDefault();
    if (await updatePassword(currentPassword, passcodeForm)) { setCurrentPassword(''); setPasscodeForm(''); }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (window.confirm('Ganti konten dengan cadangan ini? Media dan password tidak berubah.')) await importDataJSON(event.target.result);
      e.target.value = '';
      if (cvInputRef.current) cvInputRef.current.value = '';
    };
    if (file.size > 5 * 1024 * 1024) { showToast('Cadangan maksimal 5 MB.', 'error'); return; }
    reader.readAsText(file);
  };

  // Upload CV PDF Directly to Media Backend
  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('files', file);

    try {
      setUploadingCV(true);
      const result = await api('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (result) {
        const data = result;
        const uploadedFile = data.media?.[0];
        if (uploadedFile) {
          const newResumeUrl = uploadedFile.url;
          setProfileForm(prev => ({ ...prev, resumeUrl: newResumeUrl }));
          const saved = await updateProfile({
            ...profile,
            ...profileForm,
            education: [educationForm],
            resumeUrl: newResumeUrl,
            socials: socialsForm
          });
          if (saved) showToast("Berkas CV / Resume PDF berhasil diunggah dan disimpan!");
        }
      } else {
        showToast("Gagal mengunggah berkas CV.", "error");
      }
    } catch (err) {
      console.error('CV upload error:', err);
      showToast("Terjadi kesalahan saat mengunggah CV.", "error");
    } finally {
      setUploadingCV(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Pengaturan Profil, CV & Basis Data CMS</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Kelola identitas publik, riwayat pendidikan, berkas Resume/CV PDF, keamanan PIN admin, dan cadangan data portofolio.
        </p>
      </div>

      {/* Profile Settings Box */}
      <div className="contact-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} className="text-accent" /> Profil Biografi & Dokumen CV
        </h3>

        <form onSubmit={handleSaveProfile}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Nama Lengkap (Sesuai CV) *</label>
              <input
                type="text"
                className="form-control"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jabatan / Profesi Utama *</label>
              <input
                type="text"
                className="form-control"
                placeholder="IT SUPPORT"
                value={profileForm.role}
                onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ringkasan Profil CV (Bahasa Indonesia) *</label>
            <textarea
              rows="4"
              className="form-control"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--accent-color)' }}>Ringkasan Profil (English Translation)</label>
            <textarea
              rows="3"
              className="form-control"
              placeholder="English professional summary..."
              value={profileForm.bioEn || ''}
              onChange={(e) => setProfileForm({ ...profileForm, bioEn: e.target.value })}
            ></textarea>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Lokasi Domisili</label>
              <input
                type="text"
                className="form-control"
                placeholder="Balikpapan, Indonesia"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Kontak Resmi</label>
              <input
                type="email"
                className="form-control"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Nomor WhatsApp / Telepon</label>
              <input
                type="text"
                className="form-control"
                placeholder="+62 8131 3165 8141"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL Foto Avatar / Profil</label>
              <input
                type="url"
                className="form-control"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
              />
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', margin: '1.5rem 0' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} className="text-accent" /> Peta Halaman Kontak
            </h4>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profileForm.mapEnabled !== false}
                  onChange={(e) => setProfileForm({ ...profileForm, mapEnabled: e.target.checked })}
                />
                <span>Tampilkan peta pada halaman kontak</span>
              </label>
            </div>

            <div className="form-grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Alamat atau koordinat peta</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Balikpapan, Indonesia atau -1.2379, 116.8529"
                  value={profileForm.mapLocation || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, mapLocation: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Zoom peta (1–20)</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="20"
                  value={profileForm.mapZoom ?? 13}
                  onChange={(e) => setProfileForm({ ...profileForm, mapZoom: Number(e.target.value) })}
                />
              </div>
            </div>

            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.75rem' }}>
              Gunakan alamat yang spesifik atau koordinat latitude dan longitude agar penanda peta lebih akurat.
            </small>
          </div>

          {/* Education Box */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', margin: '1.5rem 0' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <GraduationCap size={18} className="text-accent" /> Riwayat Pendidikan (Tampil di Bagian Pendidikan CV)
            </h4>

            <div className="form-grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Universitas / Institusi *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="INSTITUT TEKNOLOGI KALIMANTAN"
                  value={educationForm.institution}
                  onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Jenjang & Jurusan / IPK *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="S1 Informatika – IPK 3.43"
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Dedicated CV / Resume Section */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', margin: '1.5rem 0' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={18} className="text-accent" /> Berkas CV PDF Khusus (Opsional)
            </h4>

            <div className="form-group">
              <label className="form-label">Tautan / URL File PDF Khusus</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: /uploads/documents/cv.pdf atau link Google Drive"
                  value={profileForm.resumeUrl || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, resumeUrl: e.target.value })}
                />

                <button
                  type="button"
                  onClick={() => cvInputRef.current?.click()}
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                  disabled={uploadingCV}
                >
                  <Upload size={16} /> {uploadingCV ? 'Mengunggah...' : 'Upload PDF'}
                </button>
                <input
                  type="file"
                  ref={cvInputRef}
                  onChange={handleCVUpload}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                {profileForm.resumeUrl && profileForm.resumeUrl !== '#' ? (
                  <span style={{ color: 'var(--success-color)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={14} /> Berkas PDF tersimpan: <a href={profileForm.resumeUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>Lihat Berkas</a>
                  </span>
                ) : (
                  'Sistem otomatis menyusun dokumen PDF berformat ATS dari data yang Anda isi di atas.'
                )}
              </small>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileForm.availableForHire}
                onChange={(e) => setProfileForm({ ...profileForm, availableForHire: e.target.checked })}
              />
              <span>Tampilkan Status "Available for Work" di Beranda Utama</span>
            </label>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            Tautan Media Sosial
          </h4>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                className="form-control"
                value={socialsForm.github || ''}
                onChange={(e) => setSocialsForm({ ...socialsForm, github: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                type="url"
                className="form-control"
                value={socialsForm.linkedin || ''}
                onChange={(e) => setSocialsForm({ ...socialsForm, linkedin: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <Save size={18} /> Simpan Perubahan Profil, Pendidikan & CV
          </button>
        </form>
      </div>

      {/* Security Passcode Box */}
      <div className="contact-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={20} className="text-accent" /> Keamanan Passcode CMS Admin
        </h3>

        <form onSubmit={handleSavePasscode} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group"><label className="form-label" htmlFor="current-password">Password saat ini</label><input id="current-password" type="password" autoComplete="current-password" required className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></div>
          <div className="form-group" style={{ flexGrow: 1, marginBottom: 0 }}>
            <label className="form-label">Password (minimal 12 karakter) Baru</label>
            <input
              type="text"
              className="form-control"
              autoComplete="new-password" minLength={12} value={passcodeForm}
              onChange={(e) => setPasscodeForm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-secondary">
            <ShieldCheck size={18} /> Perbarui PIN
          </button>
        </form>
      </div>

      {/* Backup JSON & Reset Box */}
      <div className="contact-card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RotateCcw size={20} className="text-accent" /> Cadangan Basis Data JSON & Reset
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Ekspor/impor JSON mencakup konten dan inbox. File media serta password tidak termasuk; cadangkan folder uploads dan .data secara terpisah. Pemulihan konten memakai penyimpanan media yang sama.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={exportDataJSON} className="btn btn-secondary">
            <Download size={18} /> Ekspor Data JSON
          </button>

          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            <Upload size={18} /> Impor Data JSON
            <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
          </label>

          <button onClick={resetToDefaults} className="btn btn-danger" style={{ marginLeft: 'auto' }}>
            <RotateCcw size={18} /> Reset Data ke Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
