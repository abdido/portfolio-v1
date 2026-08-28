import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialProfile,
  initialCv,
  initialProjects,
  initialArticles,
  initialExperiences,
  initialSkills,
  initialMessages,
  initialSettings
} from '../data/seedData';
import { translations } from '../data/translations';

const PortfolioContext = createContext();

// Pure Clean SEO Slug Generator (Title-only, NO random suffix, NO 'art-' prefix)
export const createSeoSlug = (title) => {
  if (!title) return `post-${Date.now()}`;
  const clean = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return clean || `post-${Date.now()}`;
};

export const PortfolioProvider = ({ children }) => {
  // Main Data States initialized from seed data
  const [profile, setProfile] = useState(initialProfile);
  const [cvData, setCvData] = useState(initialCv);
  const [projects, setProjects] = useState(initialProjects);
  const [articles, setArticles] = useState(initialArticles);
  const [experiences, setExperiences] = useState(initialExperiences);
  const [skills, setSkills] = useState(initialSkills);
  const [messages, setMessages] = useState(initialMessages);
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);

  // Language State ('ID' | 'EN')
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('portfolio_language') || 'ID';
  });

  const [activePage, setActivePage] = useState('home');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('portfolio_theme') || 'dark';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Toast System State
  const [toast, setToast] = useState(null);

  // Translation Helper
  const t = (key) => {
    return translations[language]?.[key] || translations['ID']?.[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ID' ? 'EN' : 'ID'));
  };

  useEffect(() => {
    localStorage.setItem('portfolio_language', language);
  }, [language]);

  // Fetch Dataset from Express REST API Database Server on mount
  const fetchDatabaseData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (data.cv) setCvData(data.cv);
        if (data.projects) setProjects(data.projects);
        if (data.articles) setArticles(data.articles);
        if (data.experiences) setExperiences(data.experiences);
        if (data.skills) setSkills(data.skills);
        if (data.messages) setMessages(data.messages);
        if (data.settings) setSettings(data.settings);
        console.log('✅ Loaded data from Database Backend API');
      }
    } catch (e) {
      console.warn('⚠️ Could not connect to API server, using initial state fallback', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  // Helper to parse clean URL path (e.g. /blog/membangun-architecture-micro-frontend-yang-scalable-di-tahun-2026)
  const parseRouteFromUrl = (articlesList) => {
    const rawPath = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    const hash = window.location.hash.replace('#', '');
    const search = window.location.search;

    const currentRoute = rawPath || hash;

    if (currentRoute === 'admin' || search.includes('admin')) {
      return { page: 'admin' };
    }

    if (currentRoute.startsWith('blog/')) {
      const slug = currentRoute.replace('blog/', '');
      const foundArt = articlesList.find(a => a.id === slug || createSeoSlug(a.title) === slug);
      if (foundArt) {
        return { page: 'article-detail', article: foundArt };
      }
      return { page: 'blog' };
    }

    if (currentRoute === 'blog') return { page: 'blog' };
    if (currentRoute === 'projects') return { page: 'projects' };
    if (currentRoute === 'about') return { page: 'about' };
    if (currentRoute === 'contact') return { page: 'contact' };
    if (currentRoute === 'home') return { page: 'home' };

    return { page: 'home' };
  };

  // Initial Route Resolution on Mount
  useEffect(() => {
    const route = parseRouteFromUrl(articles);
    setActivePage(route.page);
    if (route.article) {
      setSelectedArticle(route.article);
    }
  }, [articles]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  // Handle Browser Back / Forward & Secret Shortcut Ctrl + Shift + A
  useEffect(() => {
    const handleUrlChange = () => {
      const route = parseRouteFromUrl(articles);
      setActivePage(route.page);
      if (route.article) {
        setSelectedArticle(route.article);
      }
    };

    const handleKeyDown = (e) => {
      // Secret Shortcut: Ctrl + Shift + A to open Admin CMS
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (activePage === 'admin') {
          navigateTo('home');
        } else {
          navigateTo('admin');
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [articles, activePage]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navigateTo = (pageName, paramObj = null) => {
    let targetPath = '/';

    if (pageName === 'article-detail' && (paramObj || selectedArticle)) {
      const art = paramObj || selectedArticle;
      targetPath = `/blog/${art.id}`;
      setSelectedArticle(art);
      setActivePage('article-detail');
    } else if (pageName === 'admin') {
      targetPath = '/admin';
      setActivePage('admin');
    } else if (pageName === 'blog') {
      targetPath = '/blog';
      setActivePage('blog');
    } else if (pageName === 'projects') {
      targetPath = '/projects';
      setActivePage('projects');
    } else if (pageName === 'about') {
      targetPath = '/about';
      setActivePage('about');
    } else if (pageName === 'contact') {
      targetPath = '/contact';
      setActivePage('contact');
    } else {
      targetPath = '/';
      setActivePage('home');
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: pageName }, '', targetPath);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openArticleDetail = (articleOrId) => {
    const artObj = typeof articleOrId === 'string'
      ? articles.find(a => a.id === articleOrId)
      : articleOrId;

    if (artObj) {
      setSelectedArticle(artObj);
      navigateTo('article-detail', artObj);
    }
  };

  // --- CRUD Project Operations with API Database Sync ---
  const addProject = async (newProj) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj)
      });
      if (res.ok) {
        const savedProj = await res.json();
        setProjects(prev => [savedProj, ...prev]);
        showToast(language === 'EN' ? "New project added successfully!" : "Proyek baru berhasil ditambahkan!");
        return savedProj;
      }
    } catch (e) {
      const seoSlug = createSeoSlug(newProj.title || 'proyek-baru');
      const projWithId = { ...newProj, id: seoSlug };
      setProjects(prev => [projWithId, ...prev]);
    }
  };

  const updateProject = async (id, updatedData) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updatedData } : p)));
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (e) {
      console.error('API updateProject error', e);
    }
    showToast(language === 'EN' ? "Project updated successfully!" : "Proyek berhasil diperbarui!");
  };

  const deleteProject = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('API deleteProject error', e);
    }
    showToast(language === 'EN' ? "Project deleted!" : "Proyek berhasil dihapus!", "error");
  };

  const toggleProjectFeatured = (id) => {
    const target = projects.find(p => p.id === id);
    if (target) {
      updateProject(id, { featured: !target.featured });
    }
  };

  // --- CRUD Article Operations with API Database Sync ---
  const addArticle = async (newArt) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArt)
      });
      if (res.ok) {
        const savedArt = await res.json();
        setArticles(prev => [savedArt, ...prev]);
        showToast(language === 'EN' ? "New article published!" : "Artikel baru berhasil diterbitkan!");
        return savedArt;
      }
    } catch (e) {
      const seoSlug = createSeoSlug(newArt.title || 'artikel-baru');
      const artWithId = { ...newArt, id: seoSlug };
      setArticles(prev => [artWithId, ...prev]);
    }
  };

  const updateArticle = async (id, updatedData) => {
    setArticles(prev => prev.map(a => (a.id === id ? { ...a, ...updatedData } : a)));
    try {
      await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (e) {
      console.error('API updateArticle error', e);
    }
    showToast(language === 'EN' ? "Article updated!" : "Artikel berhasil diperbarui!");
  };

  const deleteArticle = async (id) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('API deleteArticle error', e);
    }
    showToast(language === 'EN' ? "Article deleted!" : "Artikel berhasil dihapus!", "error");
  };

  // --- CRUD Experience & Skill Operations ---
  const addExperience = async (exp) => {
    try {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp)
      });
      if (res.ok) {
        const item = await res.json();
        setExperiences(prev => [item, ...prev]);
      }
    } catch (e) {
      const item = { ...exp, id: `exp-${Date.now()}` };
      setExperiences(prev => [item, ...prev]);
    }
    showToast("Pengalaman kerja ditambahkan!");
  };

  const updateExperience = async (id, updatedData) => {
    setExperiences(prev => prev.map(e => (e.id === id ? { ...e, ...updatedData } : e)));
    try {
      await fetch(`/api/experiences/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (e) {}
    showToast("Pengalaman kerja diperbarui!");
  };

  const deleteExperience = async (id) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
    try {
      await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
    } catch (e) {}
    showToast("Pengalaman kerja dihapus!", "error");
  };

  const addSkill = async (sk) => {
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sk)
      });
      if (res.ok) {
        const item = await res.json();
        setSkills(prev => [...prev, item]);
      }
    } catch (e) {
      const item = { ...sk, id: `sk-${Date.now()}` };
      setSkills(prev => [...prev, item]);
    }
    showToast("Keahlian ditambahkan!");
  };

  const updateSkill = async (id, updatedData) => {
    setSkills(prev => prev.map(s => (s.id === id ? { ...s, ...updatedData } : s)));
    try {
      await fetch(`/api/skills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (e) {
      console.error('API updateSkill error', e);
    }
    showToast("Keahlian diperbarui!");
  };

  const deleteSkill = async (id) => {
    setSkills(prev => prev.filter(s => s.id !== id));
    try {
      await fetch(`/api/skills/${id}`, { method: 'DELETE' });
    } catch (e) {}
    showToast("Keahlian dihapus!", "error");
  };

  // --- Message Inbox Operations ---
  const addMessage = async (msgData) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [newMsg, ...prev]);
      }
    } catch (e) {
      const newMsg = {
        ...msgData,
        id: `msg-${Date.now()}`,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        read: false
      };
      setMessages(prev => [newMsg, ...prev]);
    }
    showToast(language === 'EN' ? "Message sent! Thank you for reaching out." : "Pesan Anda telah terkirim! Terima kasih telah menghubungi.");
  };

  const markMessageAsRead = async (id) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, read: true } : m)));
    try {
      await fetch(`/api/messages/${id}/read`, { method: 'PUT' });
    } catch (e) {}
  };

  const deleteMessage = async (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    } catch (e) {}
    showToast("Pesan dihapus dari Inbox", "error");
  };

  // --- Dedicated CV Operations ---
  const updateCvData = async (newCv) => {
    setCvData(newCv);
    try {
      await fetch('/api/cv', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCv)
      });
    } catch (e) {
      console.error('API updateCv error', e);
    }
    showToast(language === 'EN' ? "CV data successfully updated!" : "Data CV berhasil disimpan!");
  };

  // --- Profile & Settings Operations ---
  const updateProfile = async (newProfile) => {
    setProfile(newProfile);
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
    } catch (e) {}
    showToast("Profil berhasil diperbarui!");
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (e) {}
    showToast("Pengaturan berhasil disimpan!");
  };

  // Reset to default seed dataset in API database
  const resetToDefaults = async () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan seluruh data portofolio & CMS ke data awal?")) {
      try {
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          const resData = await res.json();
          setProfile(resData.data.profile);
          setCvData(resData.data.cv);
          setProjects(resData.data.projects);
          setArticles(resData.data.articles);
          setExperiences(resData.data.experiences);
          setSkills(resData.data.skills);
          setMessages(resData.data.messages);
          setSettings(resData.data.settings);
        }
      } catch (e) {
        setProfile(initialProfile);
        setCvData(initialCv);
        setProjects(initialProjects);
        setArticles(initialArticles);
        setExperiences(initialExperiences);
        setSkills(initialSkills);
        setMessages(initialMessages);
        setSettings(initialSettings);
      }
      showToast("Seluruh data telah di-reset ke versi awal!", "info");
    }
  };

  return (
    <PortfolioContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      t,
      profile,
      cvData,
      projects,
      articles,
      experiences,
      skills,
      messages,
      settings,
      loading,
      activePage,
      navigateTo,
      openArticleDetail,
      theme,
      toggleTheme,
      isAdminAuthenticated,
      setIsAdminAuthenticated,
      selectedProject,
      setSelectedProject,
      selectedArticle,
      setSelectedArticle,
      toast,
      showToast,
      // CRUD Sync
      addProject,
      updateProject,
      deleteProject,
      toggleProjectFeatured,
      addArticle,
      updateArticle,
      deleteArticle,
      addExperience,
      updateExperience,
      deleteExperience,
      addSkill,
      updateSkill,
      deleteSkill,
      addMessage,
      markMessageAsRead,
      deleteMessage,
      updateProfile,
      updateCvData,
      updateSettings,
      resetToDefaults
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
