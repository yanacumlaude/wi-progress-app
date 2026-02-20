import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";
import { Menu, X, ShieldCheck, HardHat, LogOut, Upload, FileText, CheckCircle } from "lucide-react";

import Dashboard from "./components/Dashboard";
import LogoProgress from "./components/LogoProgress";
import Request from "./components/Request";
import Findings from "./components/Findings";
import Revisi from "./components/Revisi";
import WICenterLibrary from "./components/WICenterLibrary";

function App() {
  const [role, setRole] = useState("guest");
  const [menu, setMenu] = useState("dashboard");
  const [wiList, setWiList] = useState([]);
  const [revisiList, setRevisiList] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State untuk Upload
  const [isUploading, setIsUploading] = useState(false);

  const [isModalInputWI, setIsModalInputWI] = useState(false);
  const [isModalTicket, setIsModalTicket] = useState(false);
  const [isModalRevisi, setIsModalRevisi] = useState(false); 
  const [editMode, setEditMode] = useState(false);
  const [currentRevisiId, setCurrentRevisiId] = useState(null);

  const initialTicket = {
    ticket_type: "Finding", requester_name: "", part_number: "", area: "", 
    description: "", priority: "Normal", status: "Open", process_name: "",
    mold_number: "", model: "", wi_process: "Finish Good", location: "Production",
    customer: ""
  };

  const initialRevisi = {
    proses_name: "", customer: "", part_name: "", part_number: "",
    mold_number: "", model: "", wi_type: "Finish Good", location: "Production",
    tgl_revisi: "", departemen: "", keterangan_revisi: "", qty_print: 0,
    pic_penerima: "", tgl_distribusi: "", tgl_penarikan: "", status: "In Progress"
  };

  const [newWI, setNewWI] = useState({
    customer: "", date_created: new Date().toISOString().split('T')[0], part_number: "", mold_number: "",
    model: "", is_logo_updated: false, is_6_sisi: false,
    condition: "Bagus", remarks: "", status_oc: "O", location: "",
    file_url: "", process_name: "" 
  });

  const [newTicket, setNewTicket] = useState(initialTicket);
  const [newRevisi, setNewRevisi] = useState(initialRevisi);

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
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- NEW HANDLER: FILE UPLOAD TO SUPABASE STORAGE ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diizinkan!");
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `wi_documents/${fileName}`;

      // 1. Upload file ke bucket 'wi-files'
      const { error: uploadError } = await supabase.storage
        .from('wi-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wi-files')
        .getPublicUrl(filePath);

      // 3. Masukkan ke state newWI
      setNewWI({ ...newWI, file_url: publicUrl });
      alert("Upload Berhasil!");

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload gagal: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- HANDLERS ---
  const handleSaveWI = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_data').insert([newWI]);
    if (error) alert(error.message);
    else { 
      alert("Master WI Disimpan!"); 
      setIsModalInputWI(false); 
      setNewWI({ ...newWI, file_url: "" }); // Reset URL setelah simpan
      fetchData(); 
    }
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_tickets').insert([newTicket]);
    if (error) alert(error.message);
    else { alert("Tiket Terkirim!"); setIsModalTicket(false); fetchData(); }
  };

  const handleUpdateTicketStatus = async (id, targetStatus) => {
    const { error } = await supabase.from('wi_tickets').update({ status: targetStatus }).eq('id', id);
    if (!error) fetchData();
  };

  const handleSaveRevisi = async (e) => {
    e.preventDefault();
    if (editMode) {
      const { error } = await supabase.from('revisi_wi').update(newRevisi).eq('id', currentRevisiId);
      if (!error) { alert("Data Diupdate!"); setIsModalRevisi(false); fetchData(); }
    } else {
      const { error } = await supabase.from('revisi_wi').insert([newRevisi]);
      if (!error) { alert("Data Disimpan!"); setIsModalRevisi(false); fetchData(); }
    }
  };

  const renderContent = () => {
    switch (menu) {
      case "dashboard": 
        return <Dashboard wiList={wiList} ticketList={ticketList} revisiList={revisiList} role={role} />;
      case "library": 
        return <WICenterLibrary wiList={wiList} role={role} />;
      case "logo":
        return role === 'admin' 
          ? <LogoProgress wiList={wiList} onOpenModal={() => setIsModalInputWI(true)} onUpdateStatus={async (id, status) => {
              const next = status === 'O' ? 'C' : 'O';
              await supabase.from('wi_data').update({ status_oc: next }).eq('id', id);
              fetchData();
            }} /> 
          : <Dashboard wiList={wiList} />;
      case "revisi": 
        return role === 'admin' 
          ? <Revisi revisiList={revisiList} onOpenModal={() => { setEditMode(false); setNewRevisi(initialRevisi); setIsModalRevisi(true); }} onEditRevisi={(data) => { setNewRevisi(data); setCurrentRevisiId(data.id); setEditMode(true); setIsModalRevisi(true); }} /> 
          : <Dashboard wiList={wiList} />;
      case "findings": 
        return role === 'admin' 
          ? <Findings ticketList={ticketList} onUpdateStatus={handleUpdateTicketStatus} onOpenTicket={(type) => { setNewTicket({...initialTicket, ticket_type: type}); setIsModalTicket(true); }} /> 
          : <Dashboard wiList={wiList} />;
      case "requests": 
        return role === 'admin' 
          ? <Request ticketList={ticketList} onUpdateStatus={handleUpdateTicketStatus} onOpenTicket={(type) => { setNewTicket({...initialTicket, ticket_type: type}); setIsModalTicket(true); }} /> 
          : <Dashboard wiList={wiList} />;
      default: 
        return <Dashboard wiList={wiList} />;
    }
  };

  if (role === "guest") {
    return (
      <div style={uiStyles.loginOverlay}>
        <div style={uiStyles.loginCard}>
          <ShieldCheck size={48} color="#10B981" style={{marginBottom: '20px'}} />
          <h2 style={{margin: '0 0 20px 0'}}>WI CENTER HUB</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <button onClick={() => setRole('admin')} style={uiStyles.loginBtnAdmin}><ShieldCheck size={20} /> Admin Engineering</button>
            <button onClick={() => setRole('operator')} style={uiStyles.loginBtnUser}><HardHat size={20} /> Operator Produksi</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', background: '#F8FAFC', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={uiStyles.mobileBtn}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isSidebarOpen && window.innerWidth < 768 && (
        <div onClick={() => setIsSidebarOpen(false)} style={uiStyles.sidebarOverlay} />
      )}

      <div style={{ 
        width: isSidebarOpen ? '260px' : '0', 
        transition: '0.3s', 
        position: 'fixed', 
        height: '100vh', 
        zIndex: 3000,
        overflow: 'hidden',
        background: 'white'
      }}>
        <Sidebar role={role} menu={menu} setMenu={(m) => { setMenu(m); if(window.innerWidth < 768) setIsSidebarOpen(false); }} />
      </div>
      
      <main style={{ 
        flex: 1, 
        padding: window.innerWidth < 768 ? '15px' : '30px', 
        marginLeft: isSidebarOpen && window.innerWidth > 768 ? '260px' : '0', 
        transition: '0.3s',
        width: '100%'
      }}>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '20px'}}>
           <button onClick={() => setRole('guest')} style={uiStyles.btnLogout}>
             <LogOut size={14} /> Logout ({role})
           </button>
        </div>
        {renderContent()}
      </main>

      {/* MODAL INPUT MASTER WI DENGAN FITUR UPLOAD */}
      {isModalInputWI && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <div style={modalStyles.header}>
              <h3>Input Master WI</h3>
              <button onClick={() => setIsModalInputWI(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveWI} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Customer" value={newWI.customer} onChange={e=>setNewWI({...newWI, customer: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Model" value={newWI.model} onChange={e=>setNewWI({...newWI, model: e.target.value})}/>
              </div>
              <input style={modalStyles.input} placeholder="Part Number" required value={newWI.part_number} onChange={e=>setNewWI({...newWI, part_number: e.target.value})}/>
              <input style={modalStyles.input} placeholder="Mold Number" value={newWI.mold_number} onChange={e=>setNewWI({...newWI, mold_number: e.target.value})}/>
              <input style={modalStyles.input} placeholder="Nama Proses" value={newWI.process_name} onChange={e=>setNewWI({...newWI, process_name: e.target.value})}/>
              
              {/* BAGIAN UPLOAD FILE */}
              <div style={uploadStyles.container}>
                <label style={uploadStyles.label}>
                  <div style={uploadStyles.inner}>
                    {isUploading ? (
                      <span style={{color: '#64748B'}}>Mengunggah file...</span>
                    ) : newWI.file_url ? (
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981'}}>
                        <CheckCircle size={18} /> <span>PDF Terunggah</span>
                      </div>
                    ) : (
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B'}}>
                        <Upload size={18} /> <span>Klik untuk Pilih PDF WI</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept=".pdf" onChange={handleFileUpload} style={{display: 'none'}} />
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isUploading || !newWI.file_url} 
                style={{
                  ...modalStyles.btnSaveWI,
                  background: (isUploading || !newWI.file_url) ? '#CBD5E1' : '#10B981'
                }}
              >
                {isUploading ? 'Menunggu Upload...' : 'Simpan Master WI'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TICKET */}
      {isModalTicket && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <div style={modalStyles.header}>
              <h3>Buat Tiket {newTicket.ticket_type}</h3>
              <button onClick={() => setIsModalTicket(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveTicket} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <input style={modalStyles.input} placeholder="Nama Pelapor" required value={newTicket.requester_name} onChange={e=>setNewTicket({...newTicket, requester_name: e.target.value})}/>
              <input style={modalStyles.input} placeholder="Part Number" required value={newTicket.part_number} onChange={e=>setNewTicket({...newTicket, part_number: e.target.value})}/>
              <textarea style={{...modalStyles.input, height: '80px'}} placeholder="Deskripsi temuan" value={newTicket.description} onChange={e=>setNewTicket({...newTicket, description: e.target.value})}></textarea>
              <button type="submit" style={modalStyles.btnSaveWI}>Kirim Tiket</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REVISI */}
      {isModalRevisi && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <div style={modalStyles.header}>
              <h3>{editMode ? 'Edit' : 'Tambah'} Revisi & Distribusi</h3>
              <button onClick={() => setIsModalRevisi(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveRevisi} style={{display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '70vh', overflowY: 'auto', padding: '5px'}}>
              <input style={modalStyles.input} placeholder="Customer" value={newRevisi.customer} onChange={e=>setNewRevisi({...newRevisi, customer: e.target.value})}/>
              <input style={modalStyles.input} placeholder="Part Number" value={newRevisi.part_number} onChange={e=>setNewRevisi({...newRevisi, part_number: e.target.value})}/>
              <input style={modalStyles.input} placeholder="Keterangan Revisi" value={newRevisi.keterangan_revisi} onChange={e=>setNewRevisi({...newRevisi, keterangan_revisi: e.target.value})}/>
              <button type="submit" style={modalStyles.btnSaveWI}>{editMode ? 'Update' : 'Simpan'} Data</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const uploadStyles = {
  container: {
    border: '2px dashed #E2E8F0',
    borderRadius: '12px',
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#F8FAFC',
    transition: '0.3s'
  },
  label: { cursor: 'pointer', display: 'block', width: '100%' },
  inner: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40px', fontSize: '14px', fontWeight: '600' }
};

const uiStyles = {
  loginOverlay: { height: '100vh', width: '100vw', background: '#F1F5F9', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  loginCard: { background: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
  loginBtnAdmin: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#1E293B', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' },
  loginBtnUser: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' },
  mobileBtn: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 4000, background: '#10B981', color: 'white', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: window.innerWidth < 768 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' },
  sidebarOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000 },
  btnLogout: { background: 'white', border: '1px solid #E2E8F0', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }
};

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, backdropFilter: 'blur(2px)' },
  content: { background: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '500px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px' },
  btnSaveWI: { padding: '15px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  btnClose: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }
};

export default App;