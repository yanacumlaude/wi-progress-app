import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Library, 
  History, 
  LogOut, 
  User as UserIcon,
  ChevronRight
} from "lucide-react";

const Sidebar = ({ role, menu, setMenu, userSession, onLogout }) => {
  
  const NavItem = ({ id, label, icon: Icon }) => {
    const isActive = menu === id;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div 
        onClick={() => setMenu(id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...styles.navItem,
          backgroundColor: isActive ? "#ECFDF5" : isHovered ? "#F8FAFC" : "transparent",
          color: isActive ? "#10B981" : "#64748B",
          fontWeight: isActive ? "700" : "500",
        }}
      >
        <div style={styles.navContent}>
          <Icon size={20} style={{ opacity: isActive || isHovered ? 1 : 0.7 }} />
          <span>{label}</span>
        </div>
        {isActive && <ChevronRight size={14} />}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Bagian Menu */}
      <nav style={styles.navBody}>
        <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
        <NavItem id="library" label="WI Library" icon={Library} />

        {role === "admin" && (
          <NavItem id="logs" label="Activity Logs" icon={History} />
        )}
      </nav>

      {/* Bagian Bawah: User Card & Logout */}
      <div style={styles.sidebarFooter}>
        <div style={styles.userCard}>
          <div style={styles.avatarBox}>
            <UserIcon size={18} color="#10B981" />
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={styles.userName}>{userSession || "Guest"}</p>
            <div style={styles.roleBadge}>
              <div style={styles.statusDot} />
              {role?.toUpperCase()}
            </div>
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault();
            onLogout();
          }}
          style={styles.btnLogout}
        >
          <LogOut size={16} />
          <span>Logout Account</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%", // Mengisi space yang disediakan App.jsx
  },
  navBody: {
    flex: 1,
    paddingTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 18px",
    margin: "2px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  navContent: {
    display: "flex", 
    alignItems: "center", 
    gap: "12px"
  },
  sidebarFooter: {
    padding: "16px",
    borderTop: "1px solid #F1F5F9",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    backgroundColor: "#F8FAFC",
    borderRadius: "12px",
  },
  avatarBox: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  userName: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "700",
    color: "#1E293B",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  roleBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "9px",
    fontWeight: "700",
    color: "#64748B",
  },
  statusDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "#10B981",
  },
  btnLogout: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "12px",
    background: "#FFF1F2",
    color: "#E11D48",
    border: "none",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "0.2s",
  }
};

export default Sidebar;