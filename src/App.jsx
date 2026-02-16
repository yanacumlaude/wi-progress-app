import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FileText, CheckCircle, AlertCircle, Upload, Search, Menu, RefreshCw } from "lucide-react";
import { supabase } from "./supabaseClient";

// Pastikan import ini ada!
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";

function App() {
  const [wiList, setWiList] = useState([]);
  const [menu, setMenu] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wi_data')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      if (data) setWiList(data);
    } catch (error) {
      console.error("Gagal tarik data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (id, field, currentValue) => {
    let newValue;
    if (field === 'status') newValue = currentValue === 'Open' ? 'Closed' : 'Open';
    if (field === 'condition') newValue = currentValue === 'Bagus' ? 'Rusak' : 'Bagus';

    const { error } = await supabase
      .from('wi_data')
      .update({ [field]: newValue })
      .eq('id', id);

    if (error) alert("Gagal update: " + error.message);
    else fetchData();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bin = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(bin, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const formatted = json.map((row) => ({
          customer: String(row["CUSTOMER"] || "-"),
          part_number: String(row["PART NUMBER"] || "-"),
          model: String(row["MODEL"] || "-"),
          location: String(row["WI LOCATION"] || "-"),
          is_logo_updated: String(row["GANTI LOGO"] || "").toLowerCase() === 'y',
          condition: String(row["COND"] || "").toLowerCase() === 'b' ? "Bagus" : "Rusak",
          status: String(row["O/C"] || "").toLowerCase() === 'c' ? "Closed" : "Open"
        }));

        const { error } = await supabase.from('wi_data').insert(formatted);
        if (error) alert(error.message);
        else {
          alert("Data Berhasil Diimport!");
          fetchData();
        }
      } catch (err) {
        alert("Error membaca Excel");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredData = wiList.filter(item => 
    (item.part_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* SIDEBAR DENGAN WIDTH TETAP */}
      <div style={styles.sidebarWrapper}>
        <Sidebar menu={menu} setMenu={setMenu} />
      </div>

      {/* AREA UTAMA YANG BISA DI-SCROLL */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.title}>WI MANAGER PRO</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchData} style={styles.btnRefresh}>
              <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <label style={styles.btnImport}>
              <Upload size={18} /> <span>Import</span>
              <input type="file" hidden onChange={handleFileUpload} />
            </label>
          </div>
        </header>

        <div style={styles.statsGrid}>
          <StatCard title="Total WI" value={filteredData.length} color="#4318FF" icon={FileText} />
          <StatCard title="Open" value={filteredData.filter(w => w.status === 'Open').length} color="#EE5D50" icon={AlertCircle} />
          <StatCard title="Bagus" value={filteredData.filter(w => w.condition === 'Bagus').length} color="#05CD99" icon={CheckCircle} />
        </div>

        <div style={styles.whiteBox}>
          <div style={styles.searchBar}>
            <Search size={18} color="#A3AED0" />
            <input 
              placeholder="Cari Part Number..." 
              style={styles.inputSearch} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>PART NUMBER</th>
                  <th>MODEL</th>
                  <th>CONDITION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: '600' }}>{w.part_number}</td>
                    <td>{w.model}</td>
                    <td>
                      <button 
                        onClick={() => handleUpdate(w.id, 'condition', w.condition)}
                        style={{ ...styles.badge, backgroundColor: w.condition === 'Bagus' ? '#E6F9F4' : '#FFF1F0', color: w.condition === 'Bagus' ? '#05CD99' : '#EE5D50' }}
                      >
                        {w.condition}
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleUpdate(w.id, 'status', w.status)}
                        style={{ ...styles.badge, backgroundColor: w.status === 'Open' ? '#FFF1F0' : '#E6F9F4', color: w.status === 'Open' ? '#EE5D50' : '#05CD99' }}
                      >
                        {w.status}
                      </button>
                    </td>
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
  sidebarWrapper: { 
    width: '260px', 
    minWidth: '260px', 
    backgroundColor: '#fff', 
    borderRight: '1px solid #e0e5f2',
    height: '100vh',
    position: 'sticky',
    top: 0
  },
  mainContent: { flex: 1, padding: '30px', overflowX: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '24px', color: '#1b2559', fontWeight: '800', margin: 0 },
  btnImport: { background: '#4318FF', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', fontWeight: '700' },
  btnRefresh: { background: 'white', border: '1px solid #E0E5F2', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#4318FF' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  whiteBox: { background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '10px', background: '#F4F7FE', padding: '10px 15px', borderRadius: '30px', marginBottom: '20px', width: '300px' },
  inputSearch: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  badge: { border: 'none', padding: '6px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }
};

export default App;