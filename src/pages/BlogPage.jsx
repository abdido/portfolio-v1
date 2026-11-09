import React, { useState, useMemo } from 'react';
import { BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { getLocalizedArticle } from '../utils/langHelper';
import { usePortfolio } from '../context/usePortfolio';
import BlogCard from '../components/BlogCard';

const BlogPage = () => {
  const { articles, t, language } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories from visible articles
  const categories = useMemo(() => {
    const visible = articles.filter(a => !a.hidden);
    const set = new Set(visible.map(a => a.category));
    return ['Semua', ...Array.from(set)];
  }, [articles]);

  // Filter Articles
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      if (a.hidden) return false;
      const localized = getLocalizedArticle(a, language);
      const matchCat = selectedCategory === 'Semua' || a.category === selectedCategory;
      const matchSearch = (localized.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (localized.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery, language]);

  return (
    <div className="page-wrapper container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="section-tag">
          <BookOpen size={13} /> {t('blogTag')}
        </div>
        <h1 className="section-title">{t('blogTitle')}</h1>
        <p className="section-subtitle">
          {t('blogSubtitle')}
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="filter-bar">
        {/* Category Pills */}
        <div className="filter-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'Semua' ? t('catAll') : cat}
            </button>
          ))}
        </div>

        {/* Right Search Input */}
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder={t('searchPlaceholderBlog')}
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="blog-grid">
          {filteredArticles.map(art => (
            <BlogCard key={art.id} article={art} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <SlidersHorizontal size={36} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>{language === 'EN' ? 'No articles found' : 'Tidak ada artikel ditemukan'}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {language === 'EN' ? 'Try another search term.' : 'Coba gunakan kata kunci pencarian yang berbeda.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
