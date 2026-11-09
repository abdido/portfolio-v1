import React, { lazy, Suspense, Component } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { usePortfolio } from './context/usePortfolio';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import ProjectModal from './components/ProjectModal';
import Accessibility from './components/Accessibility';
import './styles/main.css';
import './styles/navbar.css';
import './styles/pages.css';
import './styles/cms.css';
const HomePage=lazy(()=>import('./pages/HomePage'));
const AboutPage=lazy(()=>import('./pages/AboutPage'));
const ProjectsPage=lazy(()=>import('./pages/ProjectsPage'));
const BlogPage=lazy(()=>import('./pages/BlogPage'));
const ArticleDetailPage=lazy(()=>import('./pages/ArticleDetailPage'));
const ContactPage=lazy(()=>import('./pages/ContactPage'));
const AdminPage=lazy(()=>import('./pages/AdminPage'));
class ErrorBoundary extends Component {
  state={error:false};
  static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?<div className="page-wrapper container" role="alert"><h1>Halaman tidak dapat ditampilkan / Unable to display page</h1><button className="btn btn-primary" onClick={()=>window.location.reload()}>Muat ulang / Reload</button></div>:this.props.children;}
}
function MainContent(){
  const {activePage,adminSessionChecked,loadError,refreshData,language,navigateTo,saving}=usePortfolio();
  const en=language==='EN';
  if(loadError)return <div className="page-wrapper container" role="alert"><h1>{en?'Unable to load portfolio':'Portofolio belum dapat dimuat'}</h1><p>{loadError}</p><button className="btn btn-primary" onClick={refreshData}>{en?'Retry':'Coba lagi'}</button></div>;
  const pages={home:HomePage,about:AboutPage,projects:ProjectsPage,blog:BlogPage,'article-detail':ArticleDetailPage,contact:ContactPage,admin:AdminPage};
  const Page=pages[activePage];
  return <><Accessibility/><ErrorBoundary key={activePage}><Suspense fallback={null}>
    {activePage==='admin'?(adminSessionChecked?<fieldset className="admin-workspace" disabled={saving}><AdminPage/></fieldset>:null):<div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}><a className="skip-link" href="#main-content">{en?'Skip to content':'Ke konten utama'}</a><Navbar/><main id="main-content" style={{flexGrow:1}}>{Page?<Page/>:<div className="page-wrapper container"><h1>404</h1><p>{en?'Page not found.':'Halaman tidak ditemukan.'}</p><button className="btn btn-primary" onClick={()=>navigateTo('home')}>{en?'Back to home':'Kembali ke beranda'}</button></div>}</main><Footer/><ProjectModal/></div>}
  </Suspense></ErrorBoundary><NotificationToast/></>;
}
export default function App(){return <PortfolioProvider><MainContent/></PortfolioProvider>;}
