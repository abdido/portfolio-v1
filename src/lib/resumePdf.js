// Loaded only when a visitor requests a PDF. Text is written as text, with an embedded Unicode font.
export async function buildResumePdf(profile, cv, language, fontBase64) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({unit:'mm',format:'a4',compress:true});
  doc.addFileToVFS('NotoSans-Regular.ttf',fontBase64);
  doc.addFont('NotoSans-Regular.ttf','NotoSans','normal');
  doc.setFont('NotoSans');
  const en=language==='EN', margin=16, width=178, bottom=277;
  let y=20;
  const clean=value=>String(value||'').replace(/[\u2010-\u2015]/g,'-');
  const ensure=height=>{if(y+height>bottom){doc.addPage();y=20;}};
  const paragraph=(value,size=10,gap=3,indent=0)=>{
    if(!value)return;
    doc.setFontSize(size);
    const lines=doc.splitTextToSize(clean(value),width-indent);
    const lineHeight=size*0.3528*1.45;
    for(const line of lines){ensure(lineHeight);doc.text(line,margin+indent,y);y+=lineHeight;}
    y+=gap;
  };
  const heading=value=>{ensure(22);y+=3;paragraph(value,11,1);doc.setDrawColor(60);doc.line(margin,y-2,194,y-2);y+=3;};
  const translated=(item,key)=>en?(item[`${key}En`]||item[key]):item[key];
  paragraph((cv.name||profile.name).toUpperCase(),17,1);
  paragraph(en?(cv.roleEn||cv.roleId||profile.role):(cv.roleId||profile.role),11,1);
  paragraph([en?(cv.locationEn||cv.locationId||profile.location):(cv.locationId||profile.location),cv.email||profile.email,cv.phone||profile.phone].filter(Boolean).join(' | '),9,2);
  paragraph([profile.socials?.github,profile.socials?.linkedin].filter(Boolean).join(' | '),8.5,3);
  const summary=en?(cv.summaryEn||cv.summaryId||profile.bioEn||profile.bio):(cv.summaryId||profile.bio);
  if(summary){heading(en?'SUMMARY':'RINGKASAN');paragraph(summary);}
  const experiences=(cv.experiences||[]).filter(e=>e.isActive!==false);
  if(experiences.length){heading(en?'WORK EXPERIENCE':'PENGALAMAN KERJA');for(const exp of experiences){
    ensure(25);paragraph([exp.company,exp.location].filter(Boolean).join(' - '),11,0);
    paragraph([translated(exp,'role'),translated(exp,'period')].filter(Boolean).join(' | '),10,2);
    for(const line of (translated(exp,'description')||'').split('\n').filter(Boolean))paragraph(line.replace(/^[•*]\s*/,'- '),10,2,2);
    y+=2;
  }}
  if(cv.education?.length){heading(en?'EDUCATION':'PENDIDIKAN');for(const edu of cv.education){ensure(17);paragraph(translated(edu,'institution'),11,0);paragraph(translated(edu,'degree'));}}
  if(cv.skills?.length){heading(en?'SKILLS':'KEMAMPUAN');for(const skill of cv.skills){ensure(18);paragraph(translated(skill,'name'),10.5,0);paragraph(translated(skill,'description')||skill.category,10,3,2);}}
  const count=doc.getNumberOfPages();
  for(let page=1;page<=count;page++){doc.setPage(page);doc.setFontSize(8);doc.text(`${page} / ${count}`,194,288,{align:'right'});}
  doc.setProperties({title:`${cv.name||profile.name} - CV (${language})`,author:cv.name||profile.name,subject:'Professional resume'});
  return doc;
}
let fontPromise;
async function loadFont(){
  fontPromise ||= fetch('/fonts/NotoSans-Regular.ttf').then(async res=>{
    if(!res.ok)throw new Error('Font PDF tidak dapat dimuat. Coba kembali.');
    const bytes=new Uint8Array(await res.arrayBuffer());let binary='';
    for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
    return btoa(binary);
  }).catch(error=>{fontPromise=null;throw error;});
  return fontPromise;
}
export async function downloadResume(profile,cv,language){
  const pdf=await buildResumePdf(profile,cv,language,await loadFont());
  const name=(cv.name||profile.name||'Resume').replace(/[^a-zA-Z0-9]+/g,'_');
  await pdf.save(`${name}_CV_${language}.pdf`,{returnPromise:true});
}
