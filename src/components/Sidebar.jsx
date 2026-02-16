import React from "react";
import { LayoutDashboard, Edit3, Shield, Search, FileWarning, MessageSquare } from "lucide-react";

const Sidebar = ({ menu, setMenu }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'revisi', label: 'Revisi WI', icon: Edit3 },
    { id: 'logo', label: 'Logo Progress', icon: Search },
    { id: 'findings', label: 'Findings', icon: FileWarning },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
  ];

  return (
    <div style={sideStyles.sidebar}>
      {/* Header Logo */}
      <div style={sideStyles.logoSection}>
        <div style={sideStyles.logoIconBox}>
          <Shield size={22} color="#4318FF" fill="#4318FF" />
        </div>
        <h2 style={sideStyles.logoText}>WI MANAGER</h2>
      </div>

      <div style={sideStyles.divider} />

      {/* Menu List */}
      <div style={sideStyles.menuList}>
        {menuItems.map((item) => {
          const isActive = menu === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => setMenu(item.id)}
              style={{
                ...sideStyles.menuItem,
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              }}
            >
              {/* Indikator Garis Biru saat Aktif */}
              {isActive && <div style={sideStyles.activeLine} />}
              
              <item.icon 
                size={20} 
                style={{ 
                  color: isActive ? '#FFFFFF' : '#A3AED0',
                  marginRight: '12px'
                }} 
              />
              <span style={{
                ...sideStyles.menuLabel,
                color: isActive ? '#FFFFFF' : '#A3AED0',
                fontWeight: isActive ? '700' : '500'
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const sideStyles = {
  sidebar: { 
    height: '100vh', 
    width: '260px', 
    backgroundColor: '#111C44', // BIRU NAVY GELAP (PASTI KELIHATAN)
    position: 'fixed', 
    top: 0, 
    left: 0, 
    padding: '30px 0', 
    display: 'flex', 
    flexDirection: 'column',
    boxShadow: '4px 0px 20px rgba(0, 0, 0, 0.1)',
    zIndex: 1000
  },
  logoSection: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '0 30px', 
    gap: '12px',
    marginBottom: '20px'
  },
  logoIconBox: {
    width: '35px',
    height: '35px',
    backgroundColor: 'white',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: { 
    color: 'white', 
    fontSize: '16px', 
    fontWeight: '800', 
    margin: 0,
    letterSpacing: '0.5px'
  },
  divider: {
    height: '1px',
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '10px auto 25px auto'
  },
  menuList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  menuItem: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '16px 30px', 
    cursor: 'pointer', 
    position: 'relative',
    transition: 'all 0.2s ease'
  },
  menuLabel: { fontSize: '14px' },
  activeLine: {
    position: 'absolute',
    right: 0,
    top: '20%',
    height: '60%',
    width: '4px',
    backgroundColor: '#4318FF',
    borderRadius: '4px 0 0 4px'
  }
};

export default Sidebar;