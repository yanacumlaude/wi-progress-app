import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FileText, CheckCircle, AlertCircle, Upload, Search, Menu } from "lucide-react";
import { supabase } from "./supabaseClient";

import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import PieChartWI from "./components/PieChartWI";

function App() {
  const [wiList, setWiList] = useState([]);
  const [menu, setMenu] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. FUNGSI AMBIL DATA (FETCH)
  const fetchData = async () => {
    console.log("Memulai tarik data dari Supabase...");
    try {
      const { data, error } = await supabase
        .from('wi_data')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      if (data) {
        console.log("Data berhasil ditarik:", data.length, "baris");
        setWiList(data);
      }
    } catch (error) {
      console.error("Gagal tarik data:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. FUNGSI UPLOAD (DENGAN TRACKING)
  const handleFileUpload = (e) => {
    console.log("--- PROSES UPLOAD DIMULAI ---");
    const file = e.target.files[0];
    if (!file) {
      console.log("File tidak dipilih.");
      return;
    }

    console.log("Membaca file:", file.name);
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        console.log("File terbaca, mulai konversi ke JSON...");
        const bin = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(bin, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        console.log("Total baris dari Excel:", json.length);

        const formatted = json.map((row) => ({
          customer: row["CUSTOMER"] || "-",
          part_number: row["PART NUMBER"] || "-", // Harus sesuai kolom di image_531023.png
          model: row["MODEL"] || "-",
          location: row["WI LOCATION"] || "Unset",
          is_logo_updated: String(row["GANTI LOGO"] || "").toLowerCase() === 'y',
          condition: String(row["COND"] || "").toLowerCase() === 'b' ? "Bagus" : "Rusak",
          status: String(row["O/C"] || "").toLowerCase() === 'c' ? "Closed" : "Open"
        }));

        console.log("Mencoba kirim ke Supabase...");

        const { data, error } = await supabase
          .from('wi_data')
          .insert(formatted)
          .select();

        if (error) {
          console.error("❌ ERROR DARI SUPABASE:", error.message);
          alert("Gagal kirim ke Database! Error: " + error.message);
        } else {
          console.log("✅ BERHASIL MASUK DB:", data);
          alert(`Berhasil! ${formatted.length} data sudah mendarat di Supabase.`);
          fetchData(); 
        }
      } catch (err) {
        console.error("❌ ERROR KODINGAN:", err);
        alert("Ada kesalahan saat memproses data.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredData = wiList.filter(item => 
    (item.part_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div className={`sidebar-nav ${isSidebarOpen ? 'open' : ''}`} style={styles.sidebarWrapper}>
        <Sidebar menu={menu} setMenu={(m) => { setMenu(m); setIsSidebarOpen(false); }} />
      </div>

      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} style={styles.overlay} />
      )}

      <main className="main-content">
        <header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button style={styles.menuBtn} onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 style={styles.title}>WI DATABASE ONLINE</h1>
          </div>
          
          {/* TOMBOL IMPORT DENGAN ID AGAR KLIKNYA AKURAT */}
          <label style={styles.btnImport} htmlFor="excel-upload">
            <Upload size={18} /> <span>Import ke DB</span>
            <input 
              id="excel-upload"
              type="file" 
              hidden 
              onChange={handleFileUpload} 
              accept=".xlsx, .xls"
            />
          </label>
        </header>

        <div style={styles.statsGrid}>
          <StatCard title="Database" value={filteredData.length} color="#4318FF" icon={FileText} />
          <StatCard title="Bagus" value={filteredData.filter(w => w.condition === 'Bagus').length} color="#05CD99" icon={CheckCircle} />
          <StatCard title="Open" value={filteredData.filter(w => w.status === 'Open').length} color="#EE5D50" icon={AlertCircle} />
        </div>

        <div style={styles.whiteBox}>
          <div style={styles.searchBar}>
            <Search size={18} />
            <input 
              placeholder="Cari Part Number..." 
              style={styles.input} 
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)} 
            />
          </div>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr><th>PN</th><th>MODEL</th><th>LOC</th><th>LOGO</th><th>COND</th><th>STATUS</th></tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((w) => (
                    <tr key={w.id}>
                      <td>{w.part_number}</td>
                      <td>{w.model}</td>
                      <td>{w.location}</td>
                      <td>{w.is_logo_updated ? "✅" : "❌"}</td>
                      <td>{w.condition}</td>
                      <td style={{ color: w.status === 'Open' ? '#EE5D50' : '#05CD99', fontWeight: 'bold' }}>{w.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Database Kosong / Belum Ada Data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', background: '#f4f7fe', minHeight: '100vh', width: '100%' },
  sidebarWrapper: { position: 'fixed', zIndex: 1001, height: '100vh', background: '#6c5ce7', width: '140px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px' },
  menuBtn: { background: 'white', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
  title: { margin: 0, color: '#1b2559', fontSize: '18px', fontWeight: '800' },
  btnImport: { background: '#4318FF', color: 'white', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' },
  whiteBox: { background: 'white', padding: '20px', borderRadius: '20px', margin: '0 10px' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
  searchBar: { display: 'flex', alignItems: 'center', background: '#F4F7FE', padding: '8px', borderRadius: '10px', marginBottom: '15px', width: '220px' },
  input: { border: 'none', background: 'transparent', outline: 'none', marginLeft: '5px', width: '100%' }
};

export default App;