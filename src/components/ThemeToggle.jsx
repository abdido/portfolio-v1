import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { usePortfolio } from '../context/usePortfolio';

const ThemeToggle = () => {
  const { theme, toggleTheme } = usePortfolio();

  return (
    <button
      className="btn-icon btn-secondary"
      onClick={toggleTheme}
      title={theme === 'dark' ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
