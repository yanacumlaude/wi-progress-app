import { useState, useEffect } from "react";
import { 
  FileText, Plus, X, Search, MapPin, 
  CheckCircle2, AlertTriangle, Filter, RefreshCw, 
  LayoutDashboard, ClipboardList, Zap 
} from "lucide-react";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";

function App() {
  const [wiList, setWiList] = useState([]);
  const [revisiList, setRevisiList] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [menu, setMenu] = useState("dashboard"); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State Filter Logo Progress
  const [fCond, setFCond] = useState("All");
  const [fStatus, setFStatus] = useState("All");
  const [f6Sisi, setF6Sisi] = useState("All");

  const [isModalInputWI, setIsModalInputWI] = useState(false);

  // Form State Master WI
  const [newWI, setNewWI] = useState({
    customer: "", date_created: "", part_number: "", mold_number: "",
    model: "", is_logo_updated: "", is_6_sisi: false,
    condition: "Bagus", remarks: "", status_oc: "O", location: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: wi } = await supabase.from('wi_data').select('*').order('id', { ascending: false });
    const { data: rev } = await supabase.from('revisi_wi').select('*').order('id', { ascending: false });
    const { data: tick } = await supabase.from('wi_tickets').select('*').order('id', { ascending: false });
    
    if (wi) setWiList(wi);
    if (rev) setRevisiList(rev);
    if (tick) setTicketList(tick);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveWI = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_data').insert([newWI]);
    if (error) alert(error.message);
    else { alert("Data WI Berhasil Disimpan!"); setIsModalInputWI(false); fetchData(); }
  };

  // --- LOGIKA FILTER LOGO PROGRESS ---
  const filteredWI = wiList.filter(w => {
    const matchSearch = (w.part_number?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                        (w.model?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCond = fCond === "All" || w.condition === fCond;
    const matchStatus = fStatus === "All" || w.status_oc === fStatus;
    const match6Sisi = f6Sisi === "All" || (f6Sisi === "Sudah" ? w.is_6_sisi === true : w.is_6_sisi === false);
    return matchSearch && matchCond && matchStatus && match6Sisi;
  });

  const totalF = filteredWI.length;
  const pctBagus = totalF > 0 ? ((filteredWI.filter(w => w.condition === 'Bagus').length / totalF) * 100).toFixed(0) : 0;
  const pctClosed = totalF > 0 ? ((filteredWI.filter(w => w.status_oc === 'C').length / totalF) * 100).toFixed(0) : 0;
  const pct6Sisi = totalF > 0 ? ((filteredWI.filter(w => w.is_6_sisi === true).length / totalF) * 100).toFixed(0) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.sidebarWrapper}><Sidebar menu={menu} setMenu={setMenu} /></div>
      
      <main style={styles.mainContent}>
        
        {/* 1. DASHBOARD */}
        {menu === "dashboard" && (
          <>
            <header style={styles.header}>
              <h1 style={styles.title}>DASHBOARD OVERVIEW</h1>
              <button onClick={fetchData} style={styles.btnRefresh}><RefreshCw size={18} /></button>
            </header>
            <div style={styles.statsGrid}>
              <StatCard title="Total Master WI" value={wiList.length} color="#4318FF" icon={FileText} />
              <StatCard title="Open Requests" value={ticketList.filter(t => t.ticket_type === 'Request' && t.status === 'Open').length} color="#FFB800" icon={ClipboardList} />
              <StatCard title="Findings" value={ticketList.filter(t => t.ticket_type === 'Finding').length} color="#EE5D50" icon={AlertTriangle} />
              <StatCard title="Pending Distribusi" value={revisiList.filter(r => !r.tgl_distribusi).length} color="#05CD99" icon={RefreshCw} />
            </div>
          </>
        )}

        {/* 2. LOGO PROGRESS */}
        {menu === "logo" && (
          <>
            <header style={styles.header}>
              <div><h1 style={styles.title}>LOGO PROGRESS TRACKER</h1><p style={{color:'#707EAE'}}>{totalF} Items Found</p></div>
              <button onClick={() => setIsModalInputWI(true)} style={styles.btnAdd}><Plus size={18}/> New Master WI</button>
            </header>
            <div style={styles.chartGrid}>
               <div style={styles.whiteBoxChart}><h4>Kondisi Bagus</h4><p style={{...styles.chartValue, color:'#05CD99'}}>{pctBagus}%</p></div>
               <div style={styles.whiteBoxChart}><h4>O/C (Closed)</h4><p style={{...styles.chartValue, color:'#4318FF'}}>{pctClosed}%</p></div>
               <div style={styles.whiteBoxChart}><h4>Standar 6 Sisi</h4><p style={{...styles.chartValue, color:'#FFB800'}}>{pct6Sisi}%</p></div>
            </div>
            <div style={styles.filterBar}>
              <div style={styles.searchBar}><Search size={16} color="#A3AED0" /><input placeholder="Cari Part No..." style={styles.inputPlain} onChange={e=>setSearchTerm(e.target.value)}/></div>
              <select style={styles.selectFilter} onChange={e=>setFCond(e.target.value)}><option value="All">Semua Kondisi</option><option value="Bagus">Bagus</option><option value="Rusak">Rusak</option></select>
              <select style={styles.selectFilter} onChange={e=>setFStatus(e.target.value)}><option value="All">Semua O/C</option><option value="O">Open (O)</option><option value="C">Closed (C)</option></select>
              <select style={styles.selectFilter} onChange={e=>setF6Sisi(e.target.value)}><option value="All">Semua 6 Sisi</option><option value="Sudah">Sudah</option><option value="Belum">Belum</option></select>
            </div>
            <div style={styles.whiteBox}>
              <table style={styles.table}>
                <thead><tr style={{color:'#A3AED0', borderBottom:'2px solid #F4F7FE'}}><th>CUSTOMER</th><th>DATE</th><th>PART NUMBER</th><th>MODEL</th><th>LOGO UPDATED</th><th>LOCATION</th><th>6 SISI</th><th>O/C</th></tr></thead>
                <tbody>
                  {filteredWI.map(w => (
                    <tr key={w.id} style={{borderBottom:'1px solid #F4F7FE'}}>
                      <td style={{padding:'12px 0'}}>{w.customer}</td><td>{w.date_created}</td><td style={{fontWeight:'700'}}>{w.part_number}</td><td>{w.model}</td><td>{w.is_logo_updated || '-'}</td><td>{w.location}</td><td>{w.is_6_sisi ? '✅' : '❌'}</td>
                      <td><span style={{...styles.badge, background: w.status_oc === 'O' ? '#FFF1F0' : '#E6F9F4', color: w.status_oc === 'O' ? '#EE5D50' : '#05CD99'}}>{w.status_oc}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 3. REQUESTS */}
        {menu === "requests" && (
          <>
            <header style={styles.header}><h1 style={styles.title}>USER REQUESTS</h1></header>
            <div style={styles.whiteBox}>
              <table style={styles.table}>
                <thead><tr><th>TGL</th><th>PELAPOR</th><th>PART NUMBER</th><th>URGENSI</th><th>STATUS</th></tr></thead>
                <tbody>
                  {ticketList.filter(t => t.ticket_type === "Request").map(t => (
                    <tr key={t.id} style={{borderBottom:'1px solid #F4F7FE'}}><td style={{padding:'12px 0'}}>{new Date(t.created_at).toLocaleDateString()}</td><td>{t.requester_name}</td><td>{t.part_number}</td><td>{t.urgency}</td><td>{t.status}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 4. FINDINGS */}
        {menu === "findings" && (
          <>
            <header style={styles.header}><h1 style={styles.title}>FIELD FINDINGS</h1></header>
            <div style={styles.whiteBox}>
              <table style={styles.table}>
                <thead><tr><th>TGL</th><th>PELAPOR</th><th>DESKRIPSI</th><th>STATUS</th></tr></thead>
                <tbody>
                  {ticketList.filter(t => t.ticket_type === "Finding").map(t => (
                    <tr key={t.id} style={{borderBottom:'1px solid #F4F7FE'}}><td style={{padding:'12px 0'}}>{new Date(t.created_at).toLocaleDateString()}</td><td>{t.requester_name}</td><td>{t.description}</td><td>{t.status}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 5. REVISI */}
        {menu === "revisi" && (
          <>
            <header style={styles.header}><h1 style={styles.title}>REVISI CONTROL</h1></header>
            <div style={styles.whiteBox}>
              <table style={styles.table}>
                <thead><tr><th>TGL REVISI</th><th>PART NAME</th><th>DEPT</th><th>STATUS</th></tr></thead>
                <tbody>
                  {revisiList.map(r => (
                    <tr key={r.id} style={{borderBottom:'1px solid #F4F7FE'}}><td style={{padding:'12px 0'}}>{r.tgl_revisi}</td><td>{r.part_name}</td><td>{r.departemen}</td><td>{r.tgl_distribusi ? '✅ Distributed' : '⏳ Process'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MODAL INPUT MASTER WI */}
        {isModalInputWI && (
          <div style={styles.modalOverlay}>
            <div style={{...styles.modalContent, width:'600px'}}>
              <div style={styles.modalHeader}><h3>Input Master WI Baru</h3><X size={24} onClick={()=>setIsModalInputWI(false)} style={{cursor:'pointer'}}/></div>
              <form onSubmit={handleSaveWI} style={styles.formGrid}>
                <input style={styles.modalInput} placeholder="Customer" onChange={e=>setNewWI({...newWI, customer: e.target.value})}/>
                <input type="date" style={styles.modalInput} onChange={e=>setNewWI({...newWI, date_created: e.target.value})}/>
                <input style={styles.modalInput} placeholder="Part Number" required onChange={e=>setNewWI({...newWI, part_number: e.target.value})}/>
                <input style={styles.modalInput} placeholder="Model" onChange={e=>setNewWI({...newWI, model: e.target.value})}/>
                <input type="date" style={styles.modalInput} title="Logo Updated Date" onChange={e=>setNewWI({...newWI, is_logo_updated: e.target.value})}/>
                <input style={styles.modalInput} placeholder="Location" onChange={e=>setNewWI({...newWI, location: e.target.value})}/>
                <select style={styles.modalInput} onChange={e=>setNewWI({...newWI, condition: e.target.value})}><option value="Bagus">Bagus</option><option value="Rusak">Rusak</option></select>
                <select style={styles.modalInput} onChange={e=>setNewWI({...newWI, status_oc: e.target.value})}><option value="O">Open (O)</option><option value="C">Close (C)</option></select>
                <div style={{gridColumn:'span 2'}}><input type="checkbox" onChange={e=>setNewWI({...newWI, is_6_sisi: e.target.checked})}/> <label>Sudah Standar 6 Sisi?</label></div>
                <button type="submit" style={styles.btnSaveFull}>Simpan Data</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', background: '#f4f7fe', minHeight: '100vh', width: '100%' },
  sidebarWrapper: { width: '260px', backgroundColor: '#4318FF', position: 'fixed', height: '100vh' },
  mainContent: { flex: 1, marginLeft: '260px', padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1B2559' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' },
  whiteBoxChart: { background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)' },
  chartTitle: { fontSize: '13px', color: '#A3AED0', fontWeight:'600', marginBottom:'10px' },
  chartValue: { fontSize: '28px', fontWeight: '800', margin:0 },
  filterBar: { display: 'flex', gap: '15px', marginBottom: '20px' },
  searchBar: { display: 'flex', alignItems: 'center', background: 'white', padding: '0 15px', borderRadius: '12px', border: '1px solid #E0E5F2', gap: '10px' },
  inputPlain: { border: 'none', outline: 'none', height: '40px', width: '200px' },
  selectFilter: { padding: '10px', borderRadius: '12px', border: '1px solid #E0E5F2', background:'white' },
  whiteBox: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' },
  badge: { padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' },
  btnAdd: { background: '#05CD99', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  btnRefresh: { background: 'white', border: '1px solid #E0E5F2', padding: '10px', borderRadius: '12px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex:1000 },
  modalContent: { background: 'white', padding: '30px', borderRadius: '20px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  modalInput: { padding: '10px', borderRadius: '10px', border: '1px solid #E0E5F2' },
  btnSaveFull: { gridColumn: 'span 2', background: '#4318FF', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold' }
};

export default App;