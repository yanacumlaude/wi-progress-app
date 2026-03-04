import React from "react";
import { 
  LayoutDashboard, 
  Library, 
  History, 
  LogOut, 
  User as UserIcon,
  ChevronRight
} from "lucide-react";

const Sidebar = ({ role, menu, setMenu, userSession }) => {
  
  // Fungsi helper untuk styling menu yang aktif
  const getMenuItemStyle = (itemMenu) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    margin: "4px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textDecoration: "none",
    backgroundColor: menu === itemMenu ? "#ECFDF5" : "transparent",
    color: menu === itemMenu ? "#10B981" : "#64748B",
    fontWeight: menu === itemMenu ? "700" : "500",
  });

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      window.location.href = "/"; // Refresh ke halaman login
    }
  };

  return (
    <div style={sidebarContainer}>
      {/* HEADER LAMA DIHAPUS KARENA SUDAH ADA DI APP.JSX */}

      {/* NAVIGASI MENU */}
      <nav style={{ flex: 1, marginTop: "10px" }}>
        <div 
          style={getMenuItemStyle("dashboard")} 
          onClick={() => setMenu("dashboard")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          {menu === "dashboard" && <ChevronRight size={14} />}
        </div>

        <div 
          style={getMenuItemStyle("library")} 
          onClick={() => setMenu("library")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Library size={20} />
            <span>WI Library</span>
          </div>
          {menu === "library" && <ChevronRight size={14} />}
        </div>

        {role === "admin" && (
          <div 
            style={getMenuItemStyle("logs")} 
            onClick={() => setMenu("logs")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <History size={20} />
              <span>Activity Logs</span>
            </div>
            {menu === "logs" && <ChevronRight size={14} />}
          </div>
        )}
      </nav>

      {/* FOOTER SIDEBAR: INFO USER & LOGOUT */}
      <div style={sidebarFooter}>
        <div style={userCard}>
          <div style={avatarBox}>
            <UserIcon size={18} color="#10B981" />
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={userName}>{userSession || "Guest"}</p>
            <p style={userRole}>{role?.toUpperCase()}</p>
          </div>
        </div>
        
        <button onClick={handleLogout} style={logoutBtn}>
          <LogOut size={18} />
          <span>Logout System</span>
        </button>
      </div>
    </div>
  );
};

// --- STYLES ---
const sidebarContainer = {
  display: "flex",
  flexDirection: "column",
  height: "calc(100% - 90px)", // Mengurangi tinggi header di App.jsx
  backgroundColor: "#ffffff",
};

const sidebarFooter = {
  padding: "20px",
  borderTop: "1px solid #F1F5F9",
  marginTop: "auto",
};

const userCard = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  backgroundColor: "#F8FAFC",
  borderRadius: "14px",
  marginBottom: "15px",
};

const avatarBox = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  backgroundColor: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

const userName = {
  margin: 0,
  fontSize: "13px",
  fontWeight: "700",
  color: "#1E293B",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const userRole = {
  margin: 0,
  fontSize: "10px",
  fontWeight: "600",
  color: "#94A3B8",
};

const logoutBtn = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #FEE2E2",
  backgroundColor: "#FFF1F1",
  color: "#EF4444",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "0.2s",
};

export default Sidebar;