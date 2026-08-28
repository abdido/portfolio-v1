import React from 'react';
import html2pdf from 'html2pdf.js';

/**
 * Clean, Standard ATS-Compliant Resume Template & PDF Generator
 * Matches standard ATS formatting with full Dual-Language (ID / EN) support.
 */
export const AtsResumeDocument = ({
  profile = {},
  cvData = {},
  experiences = [],
  skills = [],
  language = 'ID',
  isPrint = false,
  forwardedRef
}) => {
  const isEn = language === 'EN';

  // Merge CV Data with profile fallbacks
  const name = cvData?.name || profile?.name || "SULISTYAWAN ABDILLAH ROSYID";
  const role = isEn
    ? (cvData?.roleEn || profile?.roleEn || cvData?.roleId || profile?.role || "IT SUPPORT SPECIALIST")
    : (cvData?.roleId || profile?.role || "IT SUPPORT");
  const location = isEn
    ? (cvData?.locationEn || profile?.location || "Balikpapan, Indonesia")
    : (cvData?.locationId || profile?.location || "Balikpapan, Indonesia");
  const phone = cvData?.phone || profile?.phone || "+62 8131 3165 8141";
  const email = cvData?.email || profile?.email || "sulistyawanar@gmail.com";

  // Dedicated CV Summary (separated from punchy website bio)
  const summary = isEn
    ? (cvData?.summaryEn || profile?.bioEn || cvData?.summaryId || profile?.bio)
    : (cvData?.summaryId || profile?.bio);

  // Education list with language adaptation
  const rawEducation = cvData?.education || profile?.education || [];
  const educationList = rawEducation.length > 0
    ? rawEducation.map(edu => ({
        institution: isEn ? (edu.institutionEn || edu.institution) : edu.institution,
        degree: isEn ? (edu.degreeEn || edu.degree) : edu.degree
      }))
    : [
        {
          institution: isEn ? "INSTITUTE OF TECHNOLOGY KALIMANTAN" : "INSTITUT TEKNOLOGI KALIMANTAN",
          degree: isEn ? "Bachelor of Computer Science – GPA 3.43" : "S1 Informatika – IPK 3.43"
        }
      ];

  // Experiences list (from cvData or fallback)
  const rawExperiences = (cvData?.experiences && cvData.experiences.length > 0)
    ? cvData.experiences
    : experiences;

  const activeExperiences = (rawExperiences || []).filter(exp => exp.isActive !== false);

  // Skills list (from cvData or fallback)
  const rawSkills = (cvData?.skills && cvData.skills.length > 0)
    ? cvData.skills
    : skills;

  // Helper to parse description lines/bullet points
  const renderDescription = (desc) => {
    if (!desc) return null;
    const lines = desc
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 1 && !lines[0].startsWith('•') && !lines[0].startsWith('-')) {
      return (
        <p style={{ margin: '4px 0', lineHeight: 1.5, textAlign: 'justify' }}>
          {lines[0]}
        </p>
      );
    }

    return (
      <ul style={{ margin: '4px 0 8px 0', paddingLeft: '1.25rem', listStyleType: 'disc' }}>
        {lines.map((line, idx) => {
          const cleanText = line.replace(/^[•\-*]\s*/, '');
          return (
            <li key={idx} style={{ margin: '3px 0', lineHeight: 1.45, textAlign: 'justify' }}>
              {cleanText}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div
      ref={forwardedRef}
      id="ats-resume-print-area"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#000000',
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: isPrint ? '0' : '24px 28px',
        fontSize: '10.5pt',
        lineHeight: 1.45,
        boxSizing: 'border-box'
      }}
    >
      {/* HEADER: NAME, TITLE, CONTACT */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h1
          style={{
            fontSize: '17pt',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            margin: '0 0 4px 0',
            color: '#000000'
          }}
        >
          {name}
        </h1>

        <h2
          style={{
            fontSize: '12pt',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: '0 0 6px 0',
            color: '#000000'
          }}
        >
          {role}
        </h2>

        <div
          style={{
            fontSize: '10pt',
            color: '#222222',
            margin: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px'
          }}
        >
          <span>{location}</span>
          <span>|</span>
          <span>{phone}</span>
          <span>|</span>
          <span style={{ color: '#000000', textDecoration: 'none' }}>
            {email}
          </span>
          {profile.socials?.github && (
            <>
              <span>|</span>
              <span>{profile.socials.github.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </>
          )}
          {profile.socials?.linkedin && (
            <>
              <span>|</span>
              <span>{profile.socials.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
            </>
          )}
        </div>
      </div>

      {/* SECTION 1: RINGKASAN / SUMMARY */}
      {summary && (
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '11pt',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1.5px solid #000000',
              paddingBottom: '2px',
              marginBottom: '6px'
            }}
          >
            {isEn ? "SUMMARY" : "RINGKASAN"}
          </div>
          <p
            style={{
              margin: '0',
              textAlign: 'justify',
              lineHeight: 1.5,
              fontSize: '10pt'
            }}
          >
            {summary}
          </p>
        </div>
      )}

      {/* SECTION 2: PENGALAMAN / WORK EXPERIENCE */}
      {activeExperiences && activeExperiences.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '11pt',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1.5px solid #000000',
              paddingBottom: '2px',
              marginBottom: '8px'
            }}
          >
            {isEn ? "WORK EXPERIENCE" : "PENGALAMAN"}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeExperiences.map(exp => {
              const expRole = isEn ? (exp.roleEn || exp.role) : exp.role;
              const expPeriod = isEn ? (exp.periodEn || exp.period) : exp.period;
              const expDesc = isEn ? (exp.descriptionEn || exp.description) : exp.description;

              return (
                <div key={exp.id} style={{ pageBreakInside: 'avoid' }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '10.5pt',
                      color: '#000000'
                    }}
                  >
                    {exp.company} {exp.location ? `– ${exp.location}` : '– Balikpapan, Indonesia'}
                  </div>

                  <div
                    style={{
                      fontSize: '10pt',
                      color: '#111111',
                      marginBottom: '4px'
                    }}
                  >
                    {expRole} {expPeriod ? `( ${expPeriod} )` : ''}
                  </div>

                  {renderDescription(expDesc)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: PENDIDIKAN / EDUCATION */}
      <div style={{ marginBottom: '18px', pageBreakInside: 'avoid' }}>
        <div
          style={{
            fontSize: '11pt',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: '1.5px solid #000000',
            paddingBottom: '2px',
            marginBottom: '8px'
          }}
        >
          {isEn ? "EDUCATION" : "PENDIDIKAN"}
        </div>

        {educationList.map((edu, i) => (
          <div key={i} style={{ marginBottom: '4px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>
              {edu.institution}
            </div>
            <div style={{ fontSize: '10pt' }}>
              {edu.degree}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 4: KEMAMPUAN / SKILLS & COMPETENCIES */}
      {rawSkills && rawSkills.length > 0 && (
        <div style={{ pageBreakInside: 'avoid' }}>
          <div
            style={{
              fontSize: '11pt',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1.5px solid #000000',
              paddingBottom: '2px',
              marginBottom: '8px'
            }}
          >
            {isEn ? "SKILLS & COMPETENCIES" : "KEMAMPUAN"}
          </div>

          <ul style={{ margin: '0', paddingLeft: '1.25rem', listStyleType: 'disc' }}>
            {rawSkills.map(sk => {
              const skillName = isEn ? (sk.nameEn || sk.name) : sk.name;
              const skillDesc = isEn ? (sk.descriptionEn || sk.description) : (sk.description || `${sk.category || 'Teknologi'} (${sk.level || 85}% Kemahiran)`);

              return (
                <li
                  key={sk.id}
                  style={{
                    margin: '4px 0',
                    lineHeight: 1.45,
                    textAlign: 'justify',
                    fontSize: '10pt'
                  }}
                >
                  <strong>{skillName}:</strong>{' '}
                  <span>{skillDesc}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Utility to download the ATS Resume as high-resolution PDF with Language tag
 */
export const downloadAtsPdf = (element, profileName = 'Sulistyawan_Abdillah_Rosyid', language = 'ID') => {
  if (!element) return;

  const cleanName = (profileName || 'Resume').toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const langSuffix = language === 'EN' ? '_EN' : '_ID';
  const filename = `${cleanName}_CV${langSuffix}.pdf`;

  const opt = {
    margin: [12, 12, 12, 12], // 12mm margins
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  return html2pdf().set(opt).from(element).save();
};

export default AtsResumeDocument;
