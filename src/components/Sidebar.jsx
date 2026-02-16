import React from "react";
import { LayoutDashboard, Edit3, Shield, Search, FileWarning, MessageSquare } from "lucide-react";

const Sidebar = ({ menu, setMenu }) => {
  // Sesuaikan ID dengan logika di App.jsx
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'revisi', label: 'Revisi WI', icon: Edit3 },
    { id: 'logo', label: 'Logo Progress', icon: Search },
    { id: 'findings', label: 'Findings', icon: FileWarning },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
  ];

  return (
    <div style={sideStyles.sidebar}>
      <div style={sideStyles.logoSection}>
        <Shield size={32} color="white" />
        <h2 style={sideStyles.logoText}>WI MANAGER</h2>
      </div>

      <div style={sideStyles.menuList}>
        {menuItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => setMenu(item.id)} // INI KUNCINYA: Mengubah state di App.jsx
            style={{
              ...sideStyles.menuItem,
              backgroundColor: menu === item.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              borderRight: menu === item.id ? '4px solid white' : 'none'
            }}
          >
            <item.icon size={20} color="white" />
            <span style={sideStyles.menuLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const sideStyles = {
  sidebar: { height: '100%', padding: '20px 0', display: 'flex', flexDirection: 'column' },
  logoSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '40px', padding: '0 20px' },
  logoText: { color: 'white', fontSize: '14px', fontWeight: 'bold', margin: 0, textAlign: 'center' },
  menuList: { display: 'flex', flexDirection: 'column', gap: '5px' },
  menuItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    padding: '15px 25px', 
    cursor: 'pointer', 
    transition: '0.3s' 
  },
  menuLabel: { color: 'white', fontSize: '14px', fontWeight: '500' }
};

export default Sidebar;