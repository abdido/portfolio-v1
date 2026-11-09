import React, { useState, useEffect, useCallback, useRef } from 'react';
import { translations } from '../data/translations';
import { api, resolveApiUrl, setCsrfToken } from '../lib/api';
import { resolveRoute } from '../lib/routing';
import { PortfolioContext } from './usePortfolio';
import {
  initialArticles,
  initialCv,
  initialExperiences,
  initialMessages,
  initialProfile,
  initialProjects,
  initialSettings,
  initialSkills
} from '../data/seedData';
const empty = {profile:{socials:{}},cv:{},cvProfiles:[],activeCvProfileId:'',projects:[],articles:[],experiences:[],skills:[],messages:[],settings:{}};
const initialData = {
  profile: initialProfile,
  cv: initialCv,
  cvProfiles: [],
  activeCvProfileId: '',
  projects: initialProjects,
  articles: initialArticles,
  experiences: initialExperiences,
  skills: initialSkills,
  messages: initialMessages,
  settings: initialSettings
};
export const PortfolioProvider = ({ children }) => {
  const [data,setData]=useState(initialData);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState('');
  const [saving,setSaving]=useState(0);
  const [language,setLanguage]=useState(()=>localStorage.getItem('portfolio_language')==='EN'?'EN':'ID');
  const [theme,setTheme]=useState(()=>localStorage.getItem('portfolio_theme')==='light'?'light':'dark');
  const [pathname,setPathname]=useState(window.location.pathname);
  const [isAdminAuthenticated,setAuthenticated]=useState(false);
  const [adminSessionChecked,setAdminSessionChecked]=useState(false);
  const [selectedProject,setSelectedProject]=useState(null);
  const [toast,setToast]=useState(null);
  const timer=useRef();
  const route=resolveRoute(pathname,data.articles);
  const activePage=route.page;
  const selectedArticle=route.article||null;
  const t=useCallback(key=>translations[language]?.[key]||translations.ID?.[key]||key,[language]);
  const trackEvent=useCallback(event=>{
    const body=JSON.stringify(event);
    if(typeof navigator!=='undefined'&&navigator.sendBeacon){
      const sent=navigator.sendBeacon(resolveApiUrl('/api/analytics/events'),new Blob([body],{type:'application/json'}));
      if(sent)return;
    }
    const target=resolveApiUrl('/api/analytics/events');
    const crossOrigin=/^https?:\/\//i.test(target)&&new URL(target,window.location.origin).origin!==window.location.origin;
    void fetch(target,{method:'POST',credentials:crossOrigin?'include':'same-origin',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{});
  },[]);
  const lastTrackedPath=useRef('');
  const showToast=useCallback((message,type='success')=>{
    clearTimeout(timer.current);setToast({message,type});
    timer.current=setTimeout(()=>setToast(null),5000);
  },[]);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const refreshData=useCallback(async()=>{
    setLoading(true);setLoadError('');
    try {
      setData({...empty,...await api('/api/data')});
    } catch(error) {setLoadError(error.message);}
    finally {setLoading(false);}
  },[]);
  useEffect(()=>{refreshData();},[refreshData]);
  useEffect(()=>{
    if(activePage!=='admin'){
      setAdminSessionChecked(false);
      return;
    }
    let mounted=true;
    setAdminSessionChecked(false);
    const checkSession=async()=>{
      try{
        const session=await api('/api/auth/session');
        if(!mounted)return;
        setCsrfToken(session.csrfToken);setAuthenticated(session.authenticated);
        if(session.authenticated){
          const adminData=await api('/api/admin/data');
          if(mounted)setData({...empty,...adminData});
        }
      }catch{
        if(mounted){setCsrfToken('');setAuthenticated(false);}
      }finally{
        if(mounted)setAdminSessionChecked(true);
      }
    };
    void checkSession();
    return()=>{mounted=false;};
  },[activePage]);
  useEffect(()=>{
    const expire=()=>{setAuthenticated(false);setAdminSessionChecked(true);setCsrfToken('');setData(prev=>({...prev,messages:[]}));};
    window.addEventListener('portfolio-session-expired',expire);
    return()=>window.removeEventListener('portfolio-session-expired',expire);
  },[]);
  useEffect(()=>{localStorage.setItem('portfolio_language',language);document.documentElement.lang=language==='EN'?'en':'id';},[language]);
  useEffect(()=>{localStorage.setItem('portfolio_theme',theme);document.documentElement.dataset.theme=theme;},[theme]);
  const navigateTo=useCallback((page,article)=>{
    const target=page==='article-detail'&&article?`/blog/${article.slug||article.id}`:page==='home'?'/':`/${page}`;
    if(window.location.pathname!==target) window.history.pushState({},'',target);
    setPathname(target);setSelectedProject(null);window.scrollTo({top:0});
  },[]);
  useEffect(()=>{
    const changed=()=>setPathname(window.location.pathname);
    const shortcut=e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='a'){e.preventDefault();navigateTo(window.location.pathname==='/admin'?'home':'admin');}};
    window.addEventListener('popstate',changed);window.addEventListener('keydown',shortcut);
    return()=>{window.removeEventListener('popstate',changed);window.removeEventListener('keydown',shortcut);};
  },[navigateTo]);
  useEffect(()=>{
    const labels={home:language==='EN'?'Home':'Beranda',about:t('navAbout'),contact:t('navContact'),projects:t('navProjects'),blog:t('navBlog'),'not-found':'404',admin:'Admin'};
    const articleTitle=language==='EN'?(selectedArticle?.titleEn||selectedArticle?.title):selectedArticle?.title;
    document.title=`${articleTitle||labels[activePage]||''} | ${data.profile.name||'Portfolio'}`;
    const description=document.querySelector('meta[name="description"]');
    if(description) description.content=selectedArticle?(language==='EN'?(selectedArticle.excerptEn||selectedArticle.excerpt):selectedArticle.excerpt):(language==='EN'?data.profile.bioEn:data.profile.bio)||'';
    let canonical=document.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}
    canonical.href=window.location.origin+pathname;
  },[pathname,selectedArticle,activePage,data.profile,language,t]);
  useEffect(()=>{
    if(!pathname)return;
    if(activePage==='admin'){lastTrackedPath.current=pathname;return;}
    if(lastTrackedPath.current===pathname)return;
    lastTrackedPath.current=pathname;
    trackEvent({type:'page_view',page:pathname});
  },[pathname,activePage,trackEvent]);
  const run=async(work,message)=>{
    setSaving(n=>n+1);
    try {const result=await work();if(message) showToast(message);return result??true;}
    catch(error){showToast(error.message,'error');return null;}
    finally{setSaving(n=>n-1);}
  };
  const saved=language==='EN'?'Changes saved.':'Perubahan berhasil disimpan.';
  const mutateList=(name,method,id,body)=>run(async()=>{
    const result=await api(`/api/${name}${id?'/'+encodeURIComponent(id):''}`,{method,body});
    setData(prev=>{
      const list=method==='POST'?[result,...prev[name]]:method==='DELETE'?prev[name].filter(i=>i.id!==id):prev[name].map(i=>i.id===id?result:i);
      const careerUpdate = ['skills','experiences'].includes(name) ? {
        cv: {...prev.cv,[name]:list},
        cvProfiles: prev.cvProfiles.map(profile => profile.id === prev.activeCvProfileId ? {...profile,[name]:list} : profile)
      } : {};
      return {...prev,[name]:list,...careerUpdate};
    });return result;
  },saved);
  const updateObject=(name,body)=>run(async()=>{
    const result=await api(`/api/${name}`,{method:'PUT',body});
    setData(prev=>({...prev,[name]:result[name],...(name==='cv'?{skills:result.cv.skills,experiences:result.cv.experiences,cvProfiles:result.cvProfiles || prev.cvProfiles,activeCvProfileId:result.activeCvProfileId || prev.activeCvProfileId}:{})}));
    return result;
  },saved);
  const updateCvProfile=(id,body)=>run(async()=>{
    const item=await api(`/api/cv-profiles/${encodeURIComponent(id)}`,{method:'PUT',body});
    setData(prev=>({...prev,cvProfiles:prev.cvProfiles.map(profile=>profile.id===id?item:profile),...(id===prev.activeCvProfileId?{cv:item,experiences:item.experiences||[],skills:item.skills||[]}:{})}));
    return item;
  },saved);
  const createCvProfile=body=>run(async()=>{
    const item=await api('/api/cv-profiles',{method:'POST',body});
    setData(prev=>({...prev,cvProfiles:[...prev.cvProfiles,item]}));
    return item;
  },language==='EN'?'CV profile created.':'Profil CV berhasil dibuat.');
  const activateCvProfile=id=>run(async()=>{
    const result=await api(`/api/cv-profiles/${encodeURIComponent(id)}/activate`,{method:'POST'});
    setData(prev=>({...prev,cv:result.cv,cvProfiles:result.cvProfiles,activeCvProfileId:result.activeCvProfileId,experiences:result.cv.experiences||[],skills:result.cv.skills||[]}));
    return result;
  },language==='EN'?'Public CV profile changed.':'Profil CV publik berhasil diganti.');
  const deleteCvProfile=id=>run(async()=>{
    const result=await api(`/api/cv-profiles/${encodeURIComponent(id)}`,{method:'DELETE'});
    setData(prev=>({...prev,cv:result.cv,cvProfiles:result.cvProfiles,activeCvProfileId:result.activeCvProfileId,experiences:result.cv.experiences||[],skills:result.cv.skills||[]}));
    return result;
  },language==='EN'?'CV profile deleted.':'Profil CV berhasil dihapus.');
  const loginAdmin=password=>run(async()=>{
    const result=await api('/api/auth/login',{method:'POST',body:{password}});
    setCsrfToken(result.csrfToken);setAuthenticated(true);setAdminSessionChecked(true);setData({...empty,...result.data});return true;
  });
  const logoutAdmin=()=>run(async()=>{
    await api('/api/auth/logout',{method:'POST'});setCsrfToken('');setAuthenticated(false);setAdminSessionChecked(true);
    setData({...empty,...await api('/api/data')});return true;
  });
  const updatePassword=(currentPassword,newPassword)=>run(async()=>{
    const result=await api('/api/auth/password',{method:'PUT',body:{currentPassword,newPassword}});
    setCsrfToken(result.csrfToken);return true;
  },saved);
  const getAnalytics=useCallback(days=>api(`/api/analytics?days=${encodeURIComponent(days||30)}`),[]);
  const addMessage=body=>run(()=>api('/api/messages',{method:'POST',body}),language==='EN'?'Message sent. Thank you!':'Pesan berhasil dikirim. Terima kasih!');
  const markMessageAsRead=id=>run(async()=>{
    const item=await api(`/api/messages/${id}/read`,{method:'PUT'});
    setData(prev=>({...prev,messages:prev.messages.map(m=>m.id===id?item:m)}));return true;
  });
  const exportDataJSON=()=>run(async()=>{
    const backup=await api('/api/backup');
    const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='portfolio-backup.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
  });
  const importDataJSON=raw=>run(async()=>{
    const body=JSON.parse(raw);
    const result=await api('/api/backup/restore',{method:'POST',body});setData({...empty,...result.data});return true;
  },saved);
  const resetToDefaults=async()=>{
    if(!window.confirm('Kembalikan konten ke data awal? Media dan password tetap tersimpan.')) return null;
    return run(async()=>{const result=await api('/api/reset',{method:'POST'});setData({...empty,...result.data});return true;},saved);
  };
  const openArticleDetail=article=>{const item=typeof article==='string'?data.articles.find(a=>a.id===article):article;if(item) navigateTo('article-detail',item);};
  return <PortfolioContext.Provider value={{...data,cvData:data.cv,loading,loadError,refreshData,saving:!!saving,
    language,setLanguage,t,toggleLanguage:()=>setLanguage(v=>v==='ID'?'EN':'ID'),theme,toggleTheme:()=>setTheme(v=>v==='dark'?'light':'dark'),
    activePage,navigateTo,selectedProject,setSelectedProject,selectedArticle,openArticleDetail,
    isAdminAuthenticated,adminSessionChecked,loginAdmin,logoutAdmin,updatePassword,toast,showToast,trackEvent,getAnalytics,
    addProject:body=>mutateList('projects','POST',null,body),updateProject:(id,body)=>mutateList('projects','PUT',id,body),deleteProject:id=>mutateList('projects','DELETE',id),
    toggleProjectFeatured:id=>{const item=data.projects.find(p=>p.id===id);return item&&mutateList('projects','PUT',id,{featured:!item.featured});},
    addArticle:body=>mutateList('articles','POST',null,body),updateArticle:(id,body)=>mutateList('articles','PUT',id,body),deleteArticle:id=>mutateList('articles','DELETE',id),
    toggleArticleHidden:id=>{const item=data.articles.find(a=>a.id===id);return item&&mutateList('articles','PUT',id,{hidden:!item.hidden});},
    addExperience:body=>mutateList('experiences','POST',null,body),updateExperience:(id,body)=>mutateList('experiences','PUT',id,body),deleteExperience:id=>mutateList('experiences','DELETE',id),
    addSkill:body=>mutateList('skills','POST',null,body),updateSkill:(id,body)=>mutateList('skills','PUT',id,body),deleteSkill:id=>mutateList('skills','DELETE',id),
    updateProfile:body=>updateObject('profile',body),updateSettings:body=>updateObject('settings',body),updateCvData:body=>updateObject('cv',body),
    updateCvProfile,createCvProfile,activateCvProfile,deleteCvProfile,
    addMessage,markMessageAsRead,deleteMessage:id=>mutateList('messages','DELETE',id),exportDataJSON,importDataJSON,resetToDefaults,
  }}>{children}</PortfolioContext.Provider>;
};
