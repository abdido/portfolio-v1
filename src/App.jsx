import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import ProjectModal from './components/ProjectModal';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import BlogPage from './pages/BlogPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';

import './styles/main.css';
import './styles/navbar.css';
import './styles/pages.css';
import './styles/cms.css';

const MainContent = () => {
  const { activePage } = usePortfolio();

  // Standalone full-page view for CMS Admin
  if (activePage === 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <AdminPage />
        <NotificationToast />
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'blog':
        return <BlogPage />;
      case 'article-detail':
        return <ArticleDetailPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {renderPage()}
      </main>
      <Footer />
      <ProjectModal />
      <NotificationToast />
    </div>
  );
};

function App() {
  return (
    <PortfolioProvider>
      <MainContent />
    </PortfolioProvider>
  );
}

export default App;
