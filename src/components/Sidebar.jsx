import React from "react";
import { LayoutDashboard, BookOpen, ShieldCheck, LogOut, UserCircle } from "lucide-react";

export default function Sidebar({ role, menu, setMenu, userSession }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "library", label: "WI Library", icon: <BookOpen size={20} /> },
  ];

  return (
    <div style={styles.sidebar}>
      {/* BRAND SECTION */}
      <div style={styles.brand}>
        <div style={styles.logoBox}>
          <ShieldCheck size={24} color="#10B981" />
        </div>
        <div style={styles.brandText}>
          <span style={styles.mainTitle}>WI HUB</span>
          <span style={styles.subTitle}>{role?.toUpperCase()} MODE</span>
        </div>
      </div>

      {/* USER INFO SECTION (Fitur Baru) */}
      <div style={styles.userProfile}>
        <div style={styles.avatarBox}>
          <UserCircle size={32} color="#64748B" />
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{userSession || "Guest User"}</span>
          <span style={styles.userStatus}>Online</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setMenu(item.id)}
            style={{
              ...styles.navBtn,
              backgroundColor: menu === item.id ? "#F1F5F9" : "transparent",
              color: menu === item.id ? "#10B981" : "#64748B",
              borderRight: menu === item.id ? "4px solid #10B981" : "none",
            }}
            className="sidebar-nav-item"
          >
            {item.icon}
            <span style={{ fontWeight: menu === item.id ? "bold" : "500" }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* FOOTER & LOGOUT */}
      <div style={styles.footer}>
        <button 
          onClick={() => {
            if(window.confirm("Yakin ingin keluar sistem?")) {
              window.location.reload();
            }
          }} 
          style={styles.logoutBtn}
        >
          <LogOut size={18} /> Keluar Sistem
        </button>
      </div>

      {/* CSS IN JS UNTUK HOVER */}
      <style>{`
        .sidebar-nav-item:hover {
          background-color: #F8FAFC !important;
          color: #10B981 !important;
          padding-left: 25px !important;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}

const styles = {
  sidebar: { 
    display: "flex", 
    flexDirection: "column", 
    height: "100%", 
    padding: "20px 0",
    background: "white" 
  },
  brand: { 
    padding: "0 20px 20px 20px", 
    display: "flex", 
    alignItems: "center", 
    gap: "12px" 
  },
  logoBox: { 
    background: "#ECFDF5", 
    padding: "8px", 
    borderRadius: "10px" 
  },
  brandText: { 
    display: "flex", 
    flexDirection: "column" 
  },
  mainTitle: { 
    fontWeight: "900", 
    fontSize: "18px", 
    color: "#1E293B", 
    letterSpacing: "1px" 
  },
  subTitle: { 
    fontSize: "10px", 
    color: "#94A3B8", 
    fontWeight: "bold" 
  },
  // STYLE BARU UNTUK PROFILE
  userProfile: {
    margin: "0 20px 20px 20px",
    padding: "15px",
    background: "#F8FAFC",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #F1F5F9"
  },
  avatarBox: { display: "flex", alignItems: "center" },
  userInfo: { display: "flex", flexDirection: "column", overflow: "hidden" },
  userName: { 
    fontSize: "13px", 
    fontWeight: "bold", 
    color: "#334155",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  userStatus: { fontSize: "10px", color: "#10B981", fontWeight: "bold" },
  
  nav: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    gap: "5px" 
  },
  navBtn: { 
    display: "flex", 
    alignItems: "center", 
    gap: "12px", 
    padding: "15px 20px", 
    border: "none", 
    cursor: "pointer", 
    transition: "all 0.3s", 
    textAlign: "left", 
    width: "100%", 
    fontSize: "14px",
    background: "transparent"
  },
  footer: { 
    padding: "20px", 
    borderTop: "1px solid #F1F5F9" 
  },
  logoutBtn: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    width: "100%", 
    padding: "12px", 
    borderRadius: "10px", 
    border: "1px solid #FEE2E2", 
    background: "white", 
    color: "#EF4444", 
    fontWeight: "bold", 
    cursor: "pointer", 
    fontSize: "13px",
    transition: "0.2s"
  }
};