import React from 'react';
import { 
  LayoutDashboard, 
  FileCheck, 
  ClipboardList, 
  AlertCircle, 
  History,
  LogOut,
  User,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ menu, setMenu, role }) {
  
  // Fungsi Helper untuk Styling Menu Aktif
  const activeStyle = (name) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    borderRadius: '12px',
    transition: '0.3s',
    background: menu === name ? '#10B981' : 'transparent',
    color: menu === name ? 'white' : '#64748B',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontWeight: menu === name ? '700' : '500',
    marginBottom: '5px'
  });

  return (
    <div style={styles.sidebar}>
      {/* HEADER LOGO */}
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>WI</div>
        <h2 style={styles.logoText}>CENTER HUB</h2>
      </div>

      {/* USER INFO CARD */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>
          <User size={16} color="#10B981" />
        </div>
        <div>
          <div style={{fontSize: '11px', fontWeight: 'bold', color: '#1E293B', textTransform: 'uppercase'}}>
            {role === 'admin' ? 'Engineering' : 'Operator'}
          </div>
          <div style={{fontSize: '10px', color: '#10B981', fontWeight: '600'}}>● Online</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 15px', overflowY: 'auto' }}>
        <p style={styles.menuLabel}>UTAMA</p>
        
        <button onClick={() => setMenu('dashboard')} style={activeStyle('dashboard')}>
          <LayoutDashboard size={20} /> Dashboard
        </button>

        {/* MENU LIBRARY (Admin & Operator Bisa Lihat) */}
        <button onClick={() => setMenu('library')} style={activeStyle('library')}>
          <BookOpen size={20} /> WI Library
        </button>

        {/* --- MENU KHUSUS ADMIN SAJA --- */}
        {role === 'admin' && (
          <>
            <p style={styles.menuLabel}>ADMIN MANAGEMENT</p>
            
            {/* Menu Master WI (Logo Progress) */}
            <button onClick={() => setMenu('logo')} style={activeStyle('logo')}>
              <FileCheck size={20} /> Master WI
            </button>

            {/* Menu Revisi & Distribusi dipindah ke sini agar aman dari Operator */}
            <button onClick={() => setMenu('revisi')} style={activeStyle('revisi')}>
              <History size={20} /> Revisi & Distribusi
            </button>
            
            <button onClick={() => setMenu('requests')} style={activeStyle('requests')}>
              <ClipboardList size={20} /> User Requests
            </button>
            
            <button onClick={() => setMenu('findings')} style={activeStyle('findings')}>
              <AlertCircle size={20} /> Findings
            </button>
          </>
        )}
      </nav>

      {/* FOOTER LOGOUT */}
      <div style={{ padding: '20px', borderTop: '1px solid #F1F5F9' }}>
        <button 
          onClick={() => window.location.reload()} 
          style={styles.btnLogout}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    background: 'white',
    borderRight: '1px solid #F1F5F9',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative', // Ubah ke relative karena pembungkus di App.jsx sudah fixed
  },
  logoSection: {
    padding: '30px 25px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoIcon: {
    background: '#10B981',
    color: 'white',
    width: '35px',
    height: '35px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '14px'
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1E293B',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  userCard: {
    margin: '0 20px 25px 20px',
    padding: '12px',
    background: '#F8FAFC',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #F1F5F9'
  },
  avatar: {
    width: '32px',
    height: '32px',
    background: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  menuLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#CBD5E1',
    paddingLeft: '20px',
    margin: '15px 0 10px 0',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  btnLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    width: '100%',
    border: 'none',
    background: '#FFF1F2',
    color: '#E11D48',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  }
};