import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";
import { Menu, X } from "lucide-react";

import Dashboard from "./components/Dashboard";
import LogoProgress from "./components/LogoProgress";
import Request from "./components/Request";
import Findings from "./components/Findings";
import Revisi from "./components/Revisi";

function App() {
  const [menu, setMenu] = useState("dashboard");
  const [wiList, setWiList] = useState([]);
  const [revisiList, setRevisiList] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // --- STATE MODALS ---
  const [isModalInputWI, setIsModalInputWI] = useState(false);
  const [isModalTicket, setIsModalTicket] = useState(false);
  const [isModalRevisi, setIsModalRevisi] = useState(false); // Modal Revisi Baru
  const [editMode, setEditMode] = useState(false);
  const [currentRevisiId, setCurrentRevisiId] = useState(null);

  // --- DATA STATES ---
  const [newWI, setNewWI] = useState({
    customer: "", date_created: "", part_number: "", mold_number: "",
    model: "", is_logo_updated: false, is_6_sisi: false,
    condition: "Bagus", remarks: "", status_oc: "O", location: ""
  });

  const [newTicket, setNewTicket] = useState({
    ticket_type: "Finding", requester_name: "", part_number: "", area: "", 
    description: "", priority: "Normal", status: "Open", process_name: "",
    mold_number: "", model: "", wi_process: "Finish Good", location: "Production",
    customer: ""
  });

  const [newRevisi, setNewRevisi] = useState({
    proses_name: "", customer: "", part_name: "", part_number: "",
    mold_number: "", model: "", wi_type: "Finish Good", location: "Production",
    tgl_revisi: "", departemen: "", keterangan_revisi: "", qty_print: 0,
    pic_penerima: "", tgl_distribusi: "", tgl_penarikan: "", status: "In Progress"
  });

  const fetchData = async () => {
    try {
      const { data: wi } = await supabase.from('wi_data').select('*').order('id', { ascending: false });
      const { data: rev } = await supabase.from('revisi_wi').select('*').order('id', { ascending: false });
      const { data: tick } = await supabase.from('wi_tickets').select('*').order('id', { ascending: false });
      
      setWiList(wi || []);
      setRevisiList(rev || []);
      setTicketList(tick || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => { 
    fetchData();
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  // --- HANDLERS ---
  const handleSaveWI = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_data').insert([newWI]);
    if (error) alert(error.message);
    else { alert("Data WI Berhasil Disimpan!"); setIsModalInputWI(false); fetchData(); }
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_tickets').insert([newTicket]);
    if (error) alert(error.message);
    else { alert("Tiket Berhasil Terkirim!"); setIsModalTicket(false); fetchData(); }
  };

  const handleSaveRevisi = async (e) => {
    e.preventDefault();
    if (editMode) {
      const { error } = await supabase.from('revisi_wi').update(newRevisi).eq('id', currentRevisiId);
      if (error) alert(error.message);
      else { alert("Data Revisi Diperbarui!"); setIsModalRevisi(false); fetchData(); }
    } else {
      const { error } = await supabase.from('revisi_wi').insert([newRevisi]);
      if (error) alert(error.message);
      else { alert("Data Distribusi Berhasil Dicatat!"); setIsModalRevisi(false); fetchData(); }
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'O' ? 'C' : 'O';
    const { error } = await supabase.from('wi_data').update({ status_oc: nextStatus }).eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const onEditRevisi = (data) => {
    setNewRevisi(data);
    setCurrentRevisiId(data.id);
    setEditMode(true);
    setIsModalRevisi(true);
  };

  const renderContent = () => {
    const props = {
      dashboard: { wiList, ticketList, revisiList },
      logo: { wiList, onOpenModal: () => setIsModalInputWI(true), onUpdateStatus: handleUpdateStatus },
      findings: { ticketList, onOpenTicket: (type) => { setNewTicket({...newTicket, ticket_type: type}); setIsModalTicket(true); } },
      requests: { ticketList, onOpenTicket: (type) => { setNewTicket({...newTicket, ticket_type: type}); setIsModalTicket(true); } },
      revisi: { 
        revisiList, 
        onOpenModal: () => { setEditMode(false); setNewRevisi({}); setIsModalRevisi(true); },
        onEditRevisi 
      }
    };

    switch (menu) {
      case "dashboard": return <Dashboard {...props.dashboard} />;
      case "logo": return <LogoProgress {...props.logo} />;
      case "revisi": return <Revisi {...props.revisi} />;
      case "findings": return <Findings {...props.findings} />;
      case "requests": return <Request {...props.requests} />;
      default: return <Dashboard {...props.dashboard} />;
    }
  };

  return (
    <div style={{ display: 'flex', background: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={uiStyles.mobileBtn}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {isSidebarOpen && <Sidebar menu={menu} setMenu={(m) => { setMenu(m); if(window.innerWidth < 768) setIsSidebarOpen(false); }} />}
      
      <main style={{ 
        flex: 1, 
        padding: '30px', 
        marginLeft: isSidebarOpen && window.innerWidth > 768 ? '260px' : '0',
        transition: '0.3s'
      }}>
        {renderContent()}
      </main>

      {/* --- MODAL INPUT MASTER WI --- */}
      {isModalInputWI && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <div style={modalStyles.header}>
              <h3 style={{color: '#10B981'}}>Input Master WI Baru</h3>
              <button onClick={() => setIsModalInputWI(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveWI} style={modalStyles.formGrid}>
              <input style={modalStyles.input} placeholder="Customer" onChange={e=>setNewWI({...newWI, customer: e.target.value})}/>
              <input type="date" style={modalStyles.input} onChange={e=>setNewWI({...newWI, date_created: e.target.value})}/>
              <input style={modalStyles.input} placeholder="Part Number" required onChange={e=>setNewWI({...newWI, part_number: e.target.value})}/>
              <input style={modalStyles.input} placeholder="Model" onChange={e=>setNewWI({...newWI, model: e.target.value})}/>
              <button type="submit" style={modalStyles.btnSaveWI}>Simpan Master WI</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL REVISI & DISTRIBUSI (MENU KRUSIAL) --- */}
      {isModalRevisi && (
        <div style={modalStyles.overlay}>
          <div style={{...modalStyles.content, maxWidth: '700px'}}>
            <div style={modalStyles.header}>
              <h3 style={{color: '#10B981', margin: 0}}>{editMode ? 'Update Progres Revisi' : 'Input Distribusi Baru'}</h3>
              <button onClick={() => setIsModalRevisi(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveRevisi} style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Part Number</label>
                  <input style={modalStyles.input} value={newRevisi.part_number || ''} onChange={e=>setNewRevisi({...newRevisi, part_number: e.target.value})} required/></div>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Model</label>
                  <input style={modalStyles.input} value={newRevisi.model || ''} onChange={e=>setNewRevisi({...newRevisi, model: e.target.value})}/></div>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Customer</label>
                  <input style={modalStyles.input} value={newRevisi.customer || ''} onChange={e=>setNewRevisi({...newRevisi, customer: e.target.value})}/></div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Tgl Revisi</label>
                  <input type="date" style={modalStyles.input} value={newRevisi.tgl_revisi || ''} onChange={e=>setNewRevisi({...newRevisi, tgl_revisi: e.target.value})}/></div>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>PIC Penerima</label>
                  <input style={modalStyles.input} value={newRevisi.pic_penerima || ''} onChange={e=>setNewRevisi({...newRevisi, pic_penerima: e.target.value})}/></div>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Qty Print</label>
                  <input type="number" style={modalStyles.input} value={newRevisi.qty_print || 0} onChange={e=>setNewRevisi({...newRevisi, qty_print: e.target.value})}/></div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Location</label>
                  <select style={modalStyles.input} value={newRevisi.location || 'Production'} onChange={e=>setNewRevisi({...newRevisi, location: e.target.value})}>
                    <option value="Production">Production</option>
                    <option value="F&P">F&P</option>
                    <option value="Others">Others</option>
                  </select></div>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Status</label>
                  <select style={modalStyles.input} value={newRevisi.status || 'In Progress'} onChange={e=>setNewRevisi({...newRevisi, status: e.target.value})}>
                    <option value="In Progress">In Progress</option>
                    <option value="Distributed">Distributed</option>
                  </select></div>
              </div>
              <div style={uiStyles.formGroup}>
                <label style={uiStyles.labelStyle}>Keterangan Revisi</label>
                <textarea style={{...modalStyles.input, height: '70px', resize: 'none'}} value={newRevisi.keterangan_revisi || ''} onChange={e=>setNewRevisi({...newRevisi, keterangan_revisi: e.target.value})} placeholder="Detail revisi..."></textarea>
              </div>
              <button type="submit" style={modalStyles.btnSaveTicket}>{editMode ? 'Update Data Lapangan' : 'Simpan Distribusi'}</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CREATE TICKET --- */}
      {isModalTicket && (
        <div style={modalStyles.overlay}>
          <div style={{...modalStyles.content, width: '90%', maxWidth: '600px'}}>
            <div style={modalStyles.header}>
              <h3 style={{color: '#10B981', margin: 0}}>Buat Tiket {newTicket.ticket_type}</h3>
              <button onClick={() => setIsModalTicket(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveTicket} style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Nama Pelapor</label>
                  <input style={modalStyles.input} placeholder="Nama Anda" required onChange={e => setNewTicket({...newTicket, requester_name: e.target.value})} /></div>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Nama Proses</label>
                  <input style={modalStyles.input} placeholder="Nama Proses" onChange={e => setNewTicket({...newTicket, process_name: e.target.value})} /></div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Part Number</label>
                  <input style={modalStyles.input} placeholder="No. Part" required onChange={e => setNewTicket({...newTicket, part_number: e.target.value})} /></div>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Mold Number</label>
                  <input style={modalStyles.input} placeholder="No. Mold" onChange={e => setNewTicket({...newTicket, mold_number: e.target.value})} /></div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>Customer</label>
                  <input style={modalStyles.input} placeholder="Nama Customer" onChange={e => setNewTicket({...newTicket, customer: e.target.value})} /></div>
                <div style={uiStyles.formGroup}><label style={uiStyles.labelStyle}>WI Process</label>
                  <select style={modalStyles.input} onChange={e => setNewTicket({...newTicket, wi_process: e.target.value})}>
                    <option value="Finish Good">Finish Good</option>
                    <option value="2nd Process">2nd Process</option>
                  </select></div>
              </div>
              <div style={uiStyles.formGroup}>
                <label style={uiStyles.labelStyle}>Deskripsi Detail</label>
                <textarea style={{...modalStyles.input, height: '80px', resize: 'none'}} placeholder="Penjelasan temuan..." required onChange={e => setNewTicket({...newTicket, description: e.target.value})}></textarea>
              </div>
              <button type="submit" style={modalStyles.btnSaveTicket}>Kirim Tiket Sekarang</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const uiStyles = {
  mobileBtn: {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: 3000,
    background: '#10B981', color: 'white', border: 'none', borderRadius: '50%',
    width: '50px', height: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    display: window.innerWidth < 768 ? 'flex' : 'none',
    alignItems: 'center', justifyContent: 'center'
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  labelStyle: { fontSize: '12px', fontWeight: 'bold', color: '#64748B', marginLeft: '2px' }
};

const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' },
  content: { background: 'white', padding: '25px', borderRadius: '15px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  btnClose: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' },
  btnSaveWI: { gridColumn: 'span 2', background: '#10B981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  btnSaveTicket: { background: '#10B981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default App;