import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import WICenterLibrary from "./components/WICenterLibrary";
import UserRequests from "./components/UserRequests";
import { Plus, Database, LayoutDashboard, Library, MessageSquare } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [wiStatusList, setWiStatusList] = useState([]); // Untuk Dashboard Progres
  const [wiMasterList, setWiMasterList] = useState([]); // Untuk Database Pusat WI
  const [loading, setLoading] = useState(true);

  // State Form Input Master WI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWI, setNewWI] = useState({
    customer: "",
    part_number: "",
    mold_number: "",
    model: "",
    process_name: "",
    file_url: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil Data Master (Untuk Library)
      const { data: masterData } = await supabase
        .from("wi_master")
        .select("*")
        .order("created_at", { ascending: false });
      
      setWiMasterList(masterData || []);

      // 2. Ambil Data Progres (Untuk Dashboard)
      // Kita asumsikan wi_status punya foreign key ke wi_master
      const { data: statusData } = await supabase
        .from("wi_status")
        .select(`
          *,
          wi_master (part_number, model, customer, process_name, mold_number)
        `);
      
      setWiStatusList(statusData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaster = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("wi_master").insert([newWI]);
      if (error) throw error;
      
      alert("Data Master Berhasil Disimpan!");
      setNewWI({ customer: "", part_number: "", mold_number: "", model: "", process_name: "", file_url: "" });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Gagal menyimpan: " + error.message);
    }
  };

  return (
    <div style={styles.appContainer}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={styles.mainContent}>
        {/* HEADER DYNAMIC */}
        <header style={styles.topHeader}>
          <div>
            <h2 style={styles.welcomeText}>Halo, Sepuh! 👋</h2>
            <p style={styles.dateText}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <button onClick={() => setIsModalOpen(true)} style={styles.btnAdd}>
            <Plus size={20} /> Tambah Master WI
          </button>
        </header>

        {/* CONTENT BERDASARKAN TAB */}
        <div style={styles.tabContent}>
          {activeTab === "dashboard" && (
            <Dashboard data={wiStatusList} refreshData={fetchData} />
          )}
          
          {activeTab === "library" && (
            <WICenterLibrary wiList={wiMasterList} />
          )}

          {activeTab === "requests" && (
            <UserRequests />
          )}
        </div>
      </main>

      {/* MODAL INPUT MASTER WI */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Registrasi Master WI Baru</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.btnClose}><Plus style={{transform: 'rotate(45deg)'}} /></button>
            </div>
            
            <form onSubmit={handleSaveMaster} style={styles.form}>
              <div style={styles.inputGroup}>
                <label>Customer</label>
                <input type="text" placeholder="Contoh: PT. ABC" required
                  value={newWI.customer} onChange={(e) => setNewWI({...newWI, customer: e.target.value})} />
              </div>

              <div style={styles.gridInput}>
                <div style={styles.inputGroup}>
                  <label>Part Number</label>
                  <input type="text" placeholder="PN-12345" required
                    value={newWI.part_number} onChange={(e) => setNewWI({...newWI, part_number: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label>Mold Number</label>
                  <input type="text" placeholder="MOLD-001" required
                    value={newWI.mold_number} onChange={(e) => setNewWI({...newWI, mold_number: e.target.value})} />
                </div>
              </div>

              <div style={styles.gridInput}>
                <div style={styles.inputGroup}>
                  <label>Model</label>
                  <input type="text" placeholder="Model Name" required
                    value={newWI.model} onChange={(e) => setNewWI({...newWI, model: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label>Nama Proses</label>
                  <input type="text" placeholder="Injeksi / Assy / Paint" required
                    value={newWI.process_name} onChange={(e) => setNewWI({...newWI, process_name: e.target.value})} />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label>URL File WI (Google Drive/PDF)</label>
                <input type="url" placeholder="https://drive.google.com/..." required
                  value={newWI.file_url} onChange={(e) => setNewWI({...newWI, file_url: e.target.value})} />
              </div>

              <button type="submit" style={styles.btnSubmit}>Simpan ke Database</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
  mainContent: { flex: 1, padding: "30px", overflowY: "auto" },
  topHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  welcomeText: { margin: 0, fontSize: "24px", fontWeight: "bold", color: "#1E293B" },
  dateText: { margin: "5px 0 0 0", color: "#64748B", fontSize: "14px" },
  btnAdd: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#3B82F6", color: "white", border: "none", padding: "12px 20px", borderRadius: "12px", fontWeight: "600", cursor: "pointer", transition: "0.3s" },
  tabContent: { marginTop: "20px" },
  
  // Modal Styles
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modal: { backgroundColor: "white", padding: "30px", borderRadius: "20px", width: "500px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  btnClose: { background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#64748B" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  gridInput: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  btnSubmit: { marginTop: "10px", padding: "14px", backgroundColor: "#10B981", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }
};

export default App;