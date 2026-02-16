import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FileText, CheckCircle, AlertCircle, Upload, Search, Menu } from "lucide-react";

import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import PieChartWI from "./components/PieChartWI";

function App() {
  const [wiList, setWiList] = useState([]);
  const [menu, setMenu] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedWI = localStorage.getItem("wiData_Final_V1");
    if (savedWI) setWiList(JSON.parse(savedWI));
  }, []);

  useEffect(() => {
    localStorage.setItem("wiData_Final_V1", JSON.stringify(wiList));
  }, [wiList]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const formatted = XLSX.utils.sheet_to_json(sheet).map((row, i) => ({
        id: Date.now() + i,
        customer: row["CUSTOMER"] || "-",
        partNumber: row["PART NUMBER"] || "-",
        model: row["MODEL"] || "-",
        isLogoUpdated: String(row["GANTI LOGO"] || "").toLowerCase() === 'y',
        condition: String(row["COND"] || "").toLowerCase() === 'b' ? "Bagus" : "Rusak",
        status: String(row["O/C"] || "").toLowerCase() === 'c' ? "Closed" : "Open",
        location: row["WI LOCATION"] || "Unset"
      }));
      setWiList([...wiList, ...formatted]);
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredData = wiList.filter(item => 
    item.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Sidebar - Menggunakan class untuk kontrol media query */}
      <div className={`sidebar-nav ${isSidebarOpen ? 'open' : ''}`} style={styles.sidebarWrapper}>
        <Sidebar menu={menu} setMenu={(m) => { setMenu(m); setIsSidebarOpen(false); }} />
      </div>

      {/* Overlay: Klik area gelap untuk tutup menu di HP */}
      {isSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} style={styles.overlay} />
      )}

      <main className="main-content">
        <header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="menu-toggle" style={styles.menuBtn} onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 style={styles.title}>
              {menu === "dashboard" ? "Main Dashboard" : menu.toUpperCase()}
            </h1>
          </div>
          <label style={styles.btnImport}>
            <Upload size={18} /> <span className="hide-mobile">Import</span>
            <input type="file" hidden onChange={handleFileUpload} />
          </label>
        </header>

        {menu === "dashboard" || menu === "updated" ? (
          <>
            <div style={styles.statsGrid}>
              <StatCard title="Total WI" value={filteredData.length} color="#4318FF" icon={FileText} />
              <StatCard title="Bagus" value={filteredData.filter(w => w.condition === 'Bagus').length} color="#05CD99" icon={CheckCircle} />
              <StatCard title="Open" value={filteredData.filter(w => w.status === 'Open').length} color="#EE5D50" icon={AlertCircle} />
            </div>

            <div style={styles.chartsGrid}>
              <PieChartWI title="Condition" data={[
                {name: 'Bagus', value: filteredData.filter(d => d.condition === "Bagus").length},
                {name: 'Rusak', value: filteredData.filter(d => d.condition === "Rusak").length}
              ]} />
              <PieChartWI title="Status" data={[
                {name: 'Open', value: filteredData.filter(d => d.status === "Open").length},
                {name: 'Closed', value: filteredData.filter(d => d.status === "Closed").length}
              ]} />
            </div>

            <div style={styles.whiteBox}>
              <div style={styles.searchBar}><Search size={18} /><input placeholder="Search PN..." style={styles.input} onChange={(e)=>setSearchTerm(e.target.value)} /></div>
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead><tr><th>PN</th><th>MODEL</th><th>LOC</th><th>LOGO</th><th>COND</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {filteredData.map(w => (
                      <tr key={w.id}><td>{w.partNumber}</td><td>{w.model}</td><td>{w.location}</td><td>{w.isLogoUpdated?"✅":"❌"}</td><td>{w.condition[0]}</td><td>{w.status}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div style={styles.whiteBox}><h3>🚧 Under Development</h3><p>Menu {menu} segera hadir.</p></div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', background: '#f4f7fe', minHeight: '100vh', width: '100%' },
  sidebarWrapper: { position: 'fixed', zIndex: 1001, height: '100vh', background: '#6c5ce7', width: '140px', transition: '0.3s' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  menuBtn: { background: 'white', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' },
  title: { margin: 0, color: '#1b2559', fontSize: '20px' },
  btnImport: { background: '#4318FF', color: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', gap: '8px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '20px' },
  whiteBox: { background: 'white', padding: '20px', borderRadius: '20px' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
  searchBar: { display: 'flex', alignItems: 'center', background: '#F4F7FE', padding: '8px', borderRadius: '10px', marginBottom: '15px', width: '180px' },
  input: { border: 'none', background: 'transparent', outline: 'none', marginLeft: '5px', width: '100%' }
};

export default App;