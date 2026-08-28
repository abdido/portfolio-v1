import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const ContactPage = () => {
  const { profile, addMessage } = usePortfolio();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    service: 'Web App',
    message: ''
  });

  const [faqOpen, setFaqOpen] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Harap isi Nama, Email, dan Pesan Anda.");
      return;
    }

    addMessage(formData);
    setFormData({
      name: '',
      email: '',
      subject: '',
      service: 'Web App',
      message: ''
    });
  };

  const faqs = [
    {
      q: "Berapa lama estimasi pengerjaan proyek website?",
      a: "Waktu pengerjaan bervariasi tergantung kompleksitas fitur. Untuk landing page atau portofolio biasanya 1–2 minggu, sedangkan sistem SaaS/Web App enterprise memakan waktu 2–4 bulan (tergantung skala & cakupan modul)."
    },
    {
      q: "Apakah proyek yang dibuat dilengkapi dengan sistem CMS?",
      a: "Ya! Setiap proyek yang saya kerjakan dapat dilengkapi dengan CMS custom yang memungkinkan Anda menambah, mengedit, atau menghapus konten tanpa perlu menyentuh kode."
    },
    {
      q: "Bagaimana proses pembayaran dan sistem kontraknya?",
      a: "Pembayaran umumnya dibagi menjadi 2 tahap: Down Payment (DP 50%) pada saat kesepakatan awal dan pelunasan (50%) saat proyek lolos pengujian akhir (*User Acceptance Testing*)."
    },
    {
      q: "Apakah Anda juga melayani pemeliharaan (maintenance) rutin?",
      a: "Tentu. Setiap proyek sudah mencakup garansi perbaikan bug gratis selama 30 hari. Setelah itu, tersedia paket pemeliharaan bulanan untuk pembaruan fitur & keamanan."
    }
  ];

  return (
    <div className="page-wrapper container">
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div className="section-tag">
          <Mail size={14} /> Mari Berkomunikasi
        </div>
        <h1 className="section-title">Hubungi Saya & Diskusikan Proyek Anda</h1>
        <p className="section-subtitle">
          Punya pertanyaan, tawaran pekerjaan, atau ingin memulai konsultasi proyek? Kirimkan pesan di bawah ini!
        </p>
      </div>

      {/* Grid Layout */}
      <div className="contact-grid" style={{ marginBottom: '4rem' }}>
        {/* Direct Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="contact-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Informasi Kontak Langsung
            </h3>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-icon-box">
                  <Mail size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Resmi</span>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{profile.email}</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-box">
                  <Phone size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Telepon / WhatsApp</span>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{profile.phone}</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-box">
                  <MapPin size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lokasi Utama</span>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{profile.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map Preview Card */}
          <div className="contact-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Lokasi Domisili</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {profile.location || 'Balikpapan, Kalimantan Timur'} (WITA UTC+8) — Terbuka untuk Remote & On-site Project.
            </p>
            <div style={{ width: '100%', height: '140px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <MapPin size={28} style={{ marginRight: '8px', color: 'var(--accent-color)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{profile.location || 'Balikpapan, Kalimantan Timur'}</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-card">
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} className="text-accent" /> Kirim Pesan / Inquiry
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Budi Santoso"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="budi@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jenis Layanan / Proyek</label>
              <select
                className="form-control"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              >
                <option value="Web App">Web Application / SaaS Development</option>
                <option value="Mobile App">Mobile App Development (iOS & Android)</option>
                <option value="UI/UX">UI/UX Design & Prototyping</option>
                <option value="Consultation">Konsultasi Arsitektur Software</option>
                <option value="Other">Lainnya</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subjek Pesan</label>
              <input
                type="text"
                className="form-control"
                placeholder="Penawaran Proyek / Pertanyaan"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pesan Lengkap *</label>
              <textarea
                rows="5"
                className="form-control"
                placeholder="Jelaskan kebutuhan proyek, tenggat waktu, atau pertanyaan Anda..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              <Send size={18} /> Kirim Pesan Sekarang
            </button>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="section-block">
        <h2 className="section-title">Pertanyaan Sering Diajukan (FAQ)</h2>
        <p className="section-subtitle">
          Jawaban singkat mengenai mekanisme kerja sama dan proses konsultasi.
        </p>

        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <div className="faq-question" onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}>
                <span>{faq.q}</span>
                {faqOpen === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {faqOpen === idx && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
