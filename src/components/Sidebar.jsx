// src/components/Sidebar.jsx
import { LayoutDashboard, AlertTriangle, MessageSquare, ShieldCheck } from 'lucide-react';

export default function Sidebar({ menu, setMenu }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'updated', label: 'Logo Progress', icon: ShieldCheck }, // MENU BARU DISINI
    { id: 'issue', label: 'Findings', icon: AlertTriangle },
    { id: 'request', label: 'Requests', icon: MessageSquare },
  ];

  return (
    <div style={{ 
      width: '140px', 
      background: '#6c5ce7', 
      height: '100vh', 
      position: 'fixed', 
      left: 0, 
      top: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '20px 0', 
      color: 'white',
      zIndex: 1000 
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <ShieldCheck size={40} />
        <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '5px' }}>WI MANAGER</div>
      </div>

      {menuItems.map((item) => {
        const Icon = item.icon; // Pastikan pakai Huruf Kapital agar React mengenalinya sebagai komponen
        return (
          <div
            key={item.id}
            onClick={() => setMenu(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '15px 0',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: menu === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
              borderRight: menu === item.id ? '4px solid white' : 'none',
              marginBottom: '5px'
            }}
          >
            <Icon size={22} color={menu === item.id ? "white" : "rgba(255,255,255,0.6)"} />
            <span style={{ 
              fontSize: '11px', 
              marginTop: '8px',
              fontWeight: menu === item.id ? 'bold' : 'normal',
              color: menu === item.id ? "white" : "rgba(255,255,255,0.6)" 
            }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}