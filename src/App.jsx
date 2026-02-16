import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FileText, CheckCircle, AlertCircle, Upload, Search, Trash2, ShieldCheck, Menu } from "lucide-react";

import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import PieChartWI from "./components/PieChartWI";

function App() {
  const [wiList, setWiList] = useState([]);
  const [menu, setMenu] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedWI = localStorage.getItem("wiData_Enterprise_V4");
    if (savedWI) setWiList(JSON.parse(savedWI));
  }, []);

  useEffect(() => {
    localStorage.setItem("wiData_Enterprise_V4", JSON.stringify(wiList));
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

  const filteredData = wiList.filter(item => {
    const matchesSearch = item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.model.toLowerCase().includes(searchTerm.toLowerCase());
    if (menu === "updated") return matchesSearch && item.isLogoUpdated;
    return matchesSearch;
  });

  const getConditionData = () => [
    { name: 'Bagus', value: filteredData.filter(d => d.condition === "Bagus").length },
    { name: 'Rusak', value: filteredData.filter(d => d.condition === "Rusak").length }
  ];

  const getStatusData = () => [
    { name: 'Open', value: filteredData.filter(d => d.status === "Open").length },
    { name: 'Closed', value: filteredData.filter(d => d.status === "Closed").length }
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar Wrapper dengan Class untuk CSS */}
      <div className={`sidebar-nav ${isSidebarOpen ? 'open' : ''}`} style={styles.sidebarWrapper}>
        <Sidebar menu={menu} setMenu={(m) => { setMenu(m); setIsSidebarOpen(false); }} />
      </div>

      {/* Konten Utama */}
      <main className="main-content">
        <header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="menu-toggle" style={styles.menuBtn} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={24} />
            </button>
            <div>
              <h1 style={styles.title}>{menu === "updated" ? "Logo Progress" : "Main Dashboard"}</h1>
              <p style={styles.subtitle}>Quality Monitoring System</p>
            </div>
          </div>
          <label style={styles.btnImport}>
            <Upload size={18} />
            <span className="hide-mobile">Import Excel</span>
            <input type="file" hidden onChange={handleFileUpload} />
          </label>
        </header>

        <div style={styles.statsGrid}>
          <StatCard title="Total WI" value={filteredData.length} color="#4318FF" icon={FileText} />
          <StatCard title="Kondisi Bagus" value={filteredData.filter(w => w.condition === 'Bagus').length} color="#05CD99" icon={CheckCircle} />
          <StatCard title="Status Open" value={filteredData.filter(w => w.status === 'Open').length} color="#EE5D50" icon={AlertCircle} />
        </div>

        <div style={styles.chartsGrid}>
          <PieChartWI title="Condition" data={getConditionData()} />
          <PieChartWI title="Status O/C" data={getStatusData()} />
        </div>

        <div style={styles.whiteBox}>
          <div style={styles.searchBar}>
            <Search size={18} color="#a3aed0" />
            <input placeholder="Search Part Number..." style={styles.input} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>PART NUMBER</th>
                  <th>MODEL</th>
                  <th>LOCATION</th>
                  <th>LOGO</th>
                  <th>COND</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #F4F7FE' }}>
                    <td style={{ padding: '12px 8px' }}>{w.customer}</td>
                    <td><b>{w.partNumber}</b></td>
                    <td>{w.model}</td>
                    <td>{w.location}</td>
                    <td style={{ textAlign: 'center' }}>{w.isLogoUpdated ? "✅" : "❌"}</td>
                    <td><b style={{ color: w.condition === "Bagus" ? '#05CD99' : '#EE5D50' }}>{w.condition === "Bagus" ? "B" : "R"}</b></td>
                    <td>{w.status}</td>
                  </tr>
                ))}
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
  sidebarWrapper: { position: 'fixed', zIndex: 1000, height: '100vh', background: '#6c5ce7' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' },
  menuBtn: { background: 'white', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'none' },
  title: { margin: 0, color: '#1b2559', fontSize: '22px' },
  subtitle: { color: '#a3aed0', fontSize: '13px', margin: 0 },
  btnImport: { background: '#4318FF', color: 'white', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '25px' },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' },
  whiteBox: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' },
  searchBar: { display: 'flex', alignItems: 'center', background: '#F4F7FE', padding: '10px 15px', borderRadius: '12px', marginBottom: '20px', width: '100%', maxWidth: '350px' },
  input: { border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', width: '100%' },
  statusBadge: { padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '10px' }
};

export default App;