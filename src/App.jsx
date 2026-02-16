import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { FileText, CheckCircle, AlertCircle, Upload, Search, Menu, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "./supabaseClient";

import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";

function App() {
  const [wiList, setWiList] = useState([]);
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

  // FUNGSI UPDATE STATUS / KONDISI
  const handleUpdate = async (id, field, currentValue) => {
    let newValue;
    if (field === 'status') newValue = currentValue === 'Open' ? 'Closed' : 'Open';
    if (field === 'condition') newValue = currentValue === 'Bagus' ? 'Rusak' : 'Bagus';

    const { error } = await supabase
      .from('wi_data')
      .update({ [field]: newValue })
      .eq('id', id);

    if (error) {
      alert("Gagal update: " + error.message);
    } else {
      fetchData(); // Refresh data setelah update
    }
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
      <main className="main-content" style={{ width: '100%', padding: '20px' }}>
        <header style={styles.header}>
          <h1 style={styles.title}>WI MANAGER PRO</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchData} style={styles.btnRefresh}>
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
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
          <input 
            placeholder="Cari Part Number..." 
            style={styles.inputSearch} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
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
  container: { display: 'flex', background: '#f4f7fe', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '20px', color: '#1b2559', fontWeight: '800' },
  btnImport: { background: '#4318FF', color: 'white', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' },
  btnRefresh: { background: 'white', border: '1px solid #ddd', padding: '10px', borderRadius: '12px', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '20px' },
  whiteBox: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  inputSearch: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E0E5F2', marginBottom: '15px', outline: 'none' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  badge: { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' }
};

export default App;