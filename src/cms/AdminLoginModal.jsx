import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const AdminLoginModal = () => {
  const { settings, setIsAdminAuthenticated, showToast } = usePortfolio();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPin = settings.adminPasscode || 'admin123';

    if (passcode.trim() === correctPin) {
      setIsAdminAuthenticated(true);
      showToast("Autentikasi Berhasil! Selamat datang di Admin CMS.", "success");
    } else {
      setError(true);
      showToast("PIN Passcode Salah!", "error");
    }
  };

  return (
    <div className="pin-login-box">
      <div className="pin-icon">
        <Lock size={28} />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        CMS Admin Portal
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
        Masukkan PIN Akses Admin untuk mengelola data portofolio.
      </p>

      <form onSubmit={handleLogin}>
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">PIN Passcode</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(false); }}
              style={{ borderColor: error ? 'var(--danger-color)' : undefined }}
              autoFocus
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
          Masuk ke CMS Admin <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
};

export default AdminLoginModal;
