import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';
const blank={name:'',email:'',subject:'',service:'Web App',message:'',website:''};
export default function ContactPage() {
  const {profile,addMessage,language}=usePortfolio();
  const [form,setForm]=useState(blank);
  const [sending,setSending]=useState(false);
  const en=language==='EN';
  const text=(id,english)=>en?english:id;
  const mapLocation=(profile.mapLocation || profile.location || '').trim();
  const mapZoom=Math.min(20,Math.max(1,Number(profile.mapZoom) || 13));
  const showMap=profile.mapEnabled !== false && Boolean(mapLocation);
  const mapSrc=`https://www.google.com/maps?q=${encodeURIComponent(mapLocation)}&z=${mapZoom}&output=embed`;
  const submit=async e=>{
    e.preventDefault();if(sending)return;setSending(true);
    try {if(await addMessage(form))setForm(blank);} finally {setSending(false);}
  };
  const field=(key,label,type='text')=><div className="form-group"><label className="form-label" htmlFor={`contact-${key}`}>{label}</label><input id={`contact-${key}`} type={type} className="form-control" value={form[key]} required={['name','email'].includes(key)} maxLength={key==='email'?254:500} autoComplete={key==='name'?'name':key==='email'?'email':'off'} onChange={e=>setForm({...form,[key]:e.target.value})} /></div>;
  const faqs=[
    [text('Berapa lama estimasi pengerjaan website?','How long does a website project take?'),text('Landing page biasanya 1–2 minggu; aplikasi yang lebih kompleks membutuhkan waktu sesuai fitur dan cakupan yang disepakati.','A landing page usually takes 1–2 weeks; complex applications depend on the agreed features and scope.')],
    [text('Apakah tersedia CMS?','Can a CMS be included?'),text('Ya. Pengelolaan konten dapat disesuaikan dengan kebutuhan proyek.','Yes. Content management can be tailored to your project.')],
    [text('Bagaimana proses kerja sama?','How does collaboration work?'),text('Kirim kebutuhan dan tenggat waktu Anda. Kita akan menyepakati cakupan, jadwal, dan pembayaran sebelum proyek dimulai.','Send your requirements and timeline. We agree on scope, schedule, and payment before starting.')],
    [text('Apakah tersedia pemeliharaan?','Do you offer maintenance?'),text('Ya. Dukungan dan pemeliharaan dapat dibahas sesuai kebutuhan aplikasi Anda.','Yes. Support and maintenance can be arranged to suit your application.')],
  ];
  return <div className="page-wrapper container">
    <div style={{marginBottom:'3rem'}}><div className="section-tag"><Mail size={14}/>{text('Mari Berkomunikasi',"Let's talk")}</div><h1 className="section-title">{text('Hubungi Saya & Diskusikan Proyek Anda','Get in touch & discuss your project')}</h1><p className="section-subtitle">{text('Punya pertanyaan, tawaran pekerjaan, atau kebutuhan proyek? Kirimkan pesan di bawah ini.','Have a question, a job offer, or a project in mind? Send a message below.')}</p></div>
    <div className="contact-grid" style={{marginBottom:'4rem'}}>
      <div className="contact-card contact-info-card">
        <h2>{text('Informasi Kontak Langsung','Contact information')}</h2>
        <div className="contact-info-list">
          <div className="contact-info-item"><span className="contact-info-icon"><Mail size={19}/></span><a href={`mailto:${profile.email}`}>{profile.email}</a></div>
          <div className="contact-info-item"><span className="contact-info-icon"><Phone size={19}/></span><a href={`tel:${profile.phone?.replace(/[^+0-9]/g,'')}`}>{profile.phone}</a></div>
          <div className="contact-info-item"><span className="contact-info-icon"><MapPin size={19}/></span><span>{profile.location}</span></div>
        </div>
        <div className="contact-availability"><span className="contact-availability-dot"/><p>{text('Terbuka untuk kerja sama jarak jauh dan di lokasi.','Available for remote and on-site collaboration.')}</p></div>
        {showMap && <div className="contact-inline-map">
          <div className="contact-inline-map-header"><span className="contact-map-kicker"><MapPin size={14}/>{text('Temukan Saya','Find me')}</span><span title={mapLocation}>{mapLocation}</span></div>
          <iframe
            className="contact-map-frame"
            src={mapSrc}
            title={`${text('Peta lokasi','Location map')}: ${mapLocation}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>}
      </div>
      <div className="contact-card"><h2 style={{marginBottom:'1.5rem'}}><MessageSquare size={20}/> {text('Kirim Pesan','Send a message')}</h2>
        <form onSubmit={submit}><fieldset disabled={sending}>
          {field('name',text('Nama lengkap *','Full name *'))}{field('email',text('Alamat email *','Email address *'),'email')}
          <div className="form-group"><label className="form-label" htmlFor="contact-service">{text('Jenis layanan','Service')}</label><select id="contact-service" className="form-control" value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option>Web App</option><option>Mobile App</option><option>IT Support</option><option>UI/UX</option><option>{text('Konsultasi','Consultation')}</option><option>{text('Lainnya','Other')}</option></select></div>
          {field('subject',text('Subjek pesan','Subject'))}
          <div className="form-group"><label className="form-label" htmlFor="contact-message">{text('Pesan lengkap *','Message *')}</label><textarea id="contact-message" rows={6} className="form-control" required maxLength={10000} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></div>
          <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>setForm({...form,website:e.target.value})}/></div>
          <button className="btn btn-primary" type="submit" style={{width:'100%'}}><Send size={18}/>{sending?text('Mengirim…','Sending…'):text('Kirim Pesan Sekarang','Send message')}</button>
        </fieldset></form>
      </div>
    </div>
    <section><h2 className="section-title">{text('Pertanyaan yang Sering Diajukan','Frequently asked questions')}</h2><div className="faq-list">{faqs.map(([q,a])=><details className="faq-item" key={q}><summary className="faq-question">{q}</summary><p className="faq-answer">{a}</p></details>)}</div></section>
  </div>;
}
