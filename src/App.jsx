import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";
import { Menu, X, ShieldCheck, HardHat, LogOut, Upload, CheckCircle, FileText, Archive, Save, Users } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react"; // Tambahan Import QR

import Dashboard from "./components/Dashboard";
import LogoProgress from "./components/LogoProgress";
import Request from "./components/Request";
import Findings from "./components/Findings";
import Revisi from "./components/Revisi";
import WICenterLibrary from "./components/WICenterLibrary";

function App() {
  // State Role: 'unauthenticated', 'admin', atau 'guest_user'
  const [role, setRole] = useState("unauthenticated");
  const [menu, setMenu] = useState("dashboard");
  const [wiList, setWiList] = useState([]);
  const [revisiList, setRevisiList] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isModalInputWI, setIsModalInputWI] = useState(false);
  const [isModalEditWI, setIsModalEditWI] = useState(false);
  const [editingWI, setEditingWI] = useState(null);

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
    customer: "", 
    date_created: new Date().toISOString().split('T')[0], 
    part_number: "", 
    mold_number: "",
    model: "", 
    is_logo_updated: false, 
    is_6_sisi: false,
    condition: "Bagus", 
    remarks: "", 
    status_oc: "O", 
    location: "",
    revision_no: "", 
    file_url: "", 
    process_name: "",
    is_archived: false 
  });

  const [newTicket, setNewTicket] = useState(initialTicket);
  const [newRevisi, setNewRevisi] = useState(initialRevisi);

  const fetchData = async () => {
    try {
      const { data: wi } = await supabase
        .from('wi_data')
        .select('*')
        .order('id', { ascending: false });
        
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
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("mode") === "library") {
      setRole("guest_user"); 
      setMenu("library");    
    }

    fetchData();
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diizinkan!");
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `wi_documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wi-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wi-files')
        .getPublicUrl(filePath);

      if (isEdit) {
        setEditingWI({ ...editingWI, file_url: publicUrl });
      } else {
        setNewWI({ ...newWI, file_url: publicUrl });
      }
      alert("Upload Berhasil!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload gagal: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveWI = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_data').insert([newWI]);
    if (error) alert(error.message);
    else { 
      alert("Master WI Disimpan!"); 
      setIsModalInputWI(false); 
      setNewWI({ 
        customer: "", date_created: new Date().toISOString().split('T')[0], 
        part_number: "", mold_number: "", model: "", is_logo_updated: false, 
        is_6_sisi: false, condition: "Bagus", remarks: "", status_oc: "O", 
        location: "", revision_no: "", file_url: "", process_name: "", is_archived: false 
      }); 
      fetchData(); 
    }
  };

  const handleUpdateWI = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('wi_data')
      .update({
        customer: editingWI.customer,
        model: editingWI.model,
        part_number: editingWI.part_number,
        mold_number: editingWI.mold_number,
        process_name: editingWI.process_name,
        revision_no: editingWI.revision_no,
        location: editingWI.location,
        remarks: editingWI.remarks,
        file_url: editingWI.file_url,
        is_archived: editingWI.is_archived 
      })
      .eq('id', editingWI.id);

    if (error) alert(error.message);
    else { 
      alert(editingWI.is_archived ? "Data Berhasil Diarsipkan!" : "Data WI Berhasil Diperbarui!"); 
      setIsModalEditWI(false); 
      fetchData(); 
    }
  };

  const handleDeleteWI = async (id) => {
    if (window.confirm("Puh, yakin mau hapus permanen data ini? Tindakan ini tidak bisa dibatalkan!")) {
      const { error } = await supabase.from('wi_data').delete().eq('id', id);
      if (error) alert(error.message);
      else {
        alert("Data dihapus selamanya!");
        fetchData();
      }
    }
  };

  const handleUpdateTicketStatus = async (id, targetStatus) => {
    const { error } = await supabase.from('wi_tickets').update({ status: targetStatus }).eq('id', id);
    if (!error) fetchData();
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_tickets').insert([newTicket]);
    if (error) alert(error.message);
    else { alert("Tiket Terkirim!"); setIsModalTicket(false); fetchData(); }
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
        return (
          <WICenterLibrary 
            wiList={wiList} 
            role={role} 
            onEdit={(wi) => { setEditingWI(wi); setIsModalEditWI(true); }} 
            onOpenInputModal={() => setIsModalInputWI(true)} 
            onDelete={handleDeleteWI}
          />
        );
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

  // HALAMAN LOGIN AWAL
  if (role === "unauthenticated") {
    return (
      <div style={uiStyles.loginOverlay}>
        <div style={uiStyles.loginCard}>
          <ShieldCheck size={48} color="#10B981" style={{marginBottom: '20px'}} />
          <h2 style={{margin: '0 0 10px 0', color: '#1E293B'}}>WI CENTER HUB</h2>
          <p style={{margin: '0 0 25px 0', color: '#64748B', fontSize: '14px'}}>Pilih akses untuk melanjutkan</p>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <button onClick={() => setRole('admin')} style={uiStyles.loginBtnAdmin}>
              <ShieldCheck size={20} /> Admin Engineering
            </button>
            <button onClick={() => setRole('guest_user')} style={uiStyles.loginBtnUser}>
              <Users size={20} /> Masuk sebagai Guest
            </button>
          </div>

          {/* QR GENERAL DI LOGIN PAGE */}
          <div style={uiStyles.qrGeneralContainer}>
             <p style={{fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '10px'}}>QR CODE AKSES CEPAT (GENERAL)</p>
             <div style={uiStyles.qrWrapper}>
                <QRCodeCanvas value={`${window.location.origin}?mode=library`} size={130} />
             </div>
             <p style={{fontSize: '10px', color: '#94A3B8', marginTop: '10px'}}>Scan untuk buka Library tanpa login</p>
          </div>

          <div style={{marginTop: '25px', fontSize: '11px', color: '#CBD5E1'}}>Digital Documentation System v2.0</div>
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
        background: 'white',
        borderRight: '1px solid #E2E8F0' // Tambah border agar rapi
      }}>
        <Sidebar role={role} menu={menu} setMenu={(m) => { setMenu(m); if(window.innerWidth < 768) setIsSidebarOpen(false); }} />
      </div>
      
      <main style={{ 
        flex: 1, 
        padding: window.innerWidth < 768 ? '20px 15px' : '30px', 
        marginLeft: isSidebarOpen && window.innerWidth > 768 ? '260px' : '0', 
        transition: '0.3s',
        width: '100%'
      }}>
        {/* Konten Utama */}
        {renderContent()}
      </main>

      {/* MODAL INPUT & EDIT WI (Tetap Sama) */}
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
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Mold Number" value={newWI.mold_number} onChange={e=>setNewWI({...newWI, mold_number: e.target.value})}/>
                <input style={modalStyles.input} placeholder="No. Revisi (Contoh: 01)" value={newWI.revision_no} onChange={e=>setNewWI({...newWI, revision_no: e.target.value})}/>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Nama Proses" value={newWI.process_name} onChange={e=>setNewWI({...newWI, process_name: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Lokasi" value={newWI.location} onChange={e=>setNewWI({...newWI, location: e.target.value})}/>
              </div>

              <textarea 
                style={{...modalStyles.input, height: '60px'}} 
                placeholder="Remarks" 
                value={newWI.remarks} 
                onChange={e=>setNewWI({...newWI, remarks: e.target.value})}
              />
              
              <div style={uploadStyles.container}>
                <label style={uploadStyles.label}>
                  <div style={uploadStyles.inner}>
                    {isUploading ? <span style={{color: '#64748B'}}>Mengunggah...</span> : newWI.file_url ? <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981'}}><CheckCircle size={18} /> <span>PDF OK</span></div> : <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B'}}><Upload size={18} /> <span>Pilih PDF WI</span></div>}
                  </div>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, false)} style={{display: 'none'}} />
                </label>
              </div>

              <button type="submit" disabled={isUploading || !newWI.file_url} style={{...modalStyles.btnSaveWI, background: (isUploading || !newWI.file_url) ? '#CBD5E1' : '#10B981'}}>
                {isUploading ? 'Tunggu...' : 'Simpan Master WI'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isModalEditWI && editingWI && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <div style={modalStyles.header}>
              <h3 style={{display:'flex', alignItems:'center', gap:'10px'}}><FileText size={20} color="#3B82F6"/> Edit Data WI</h3>
              <button onClick={() => setIsModalEditWI(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleUpdateWI} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Customer" value={editingWI.customer} onChange={e=>setEditingWI({...editingWI, customer: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Model" value={editingWI.model} onChange={e=>setEditingWI({...editingWI, model: e.target.value})}/>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Part Number" required value={editingWI.part_number} onChange={e=>setEditingWI({...editingWI, part_number: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Mold Number" value={editingWI.mold_number} onChange={e=>setEditingWI({...editingWI, mold_number: e.target.value})}/>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Nama Proses" value={editingWI.process_name} onChange={e=>setEditingWI({...editingWI, process_name: e.target.value})}/>
                <input style={modalStyles.input} placeholder="No. Revisi" value={editingWI.revision_no} onChange={e=>setEditingWI({...editingWI, revision_no: e.target.value})}/>
              </div>

              <input style={modalStyles.input} placeholder="Lokasi" value={editingWI.location} onChange={e=>setEditingWI({...editingWI, location: e.target.value})}/>
              
              <textarea style={{...modalStyles.input, height: '60px'}} placeholder="Remarks" value={editingWI.remarks} onChange={e=>setEditingWI({...editingWI, remarks: e.target.value})}/>
              
              <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#FEF2F2', padding:'10px', borderRadius:'10px', border:'1px solid #FEE2E2'}}>
                 <input 
                   type="checkbox" 
                   id="archive-check" 
                   checked={editingWI.is_archived} 
                   onChange={e => setEditingWI({...editingWI, is_archived: e.target.checked})} 
                 />
                 <label htmlFor="archive-check" style={{fontSize:'13px', color:'#991B1B', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>
                   <Archive size={14}/> Arsipkan data ini (Sembunyikan dari Library)
                 </label>
              </div>

              <div style={{...uploadStyles.container, borderColor: '#3B82F6', background: '#EFF6FF'}}>
                <label style={uploadStyles.label}>
                  <div style={uploadStyles.inner}>
                    {isUploading ? <span style={{color: '#3B82F6'}}>Mengganti file...</span> : <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#1D4ED8'}}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Upload size={16} /> <span>Ganti PDF (Opsional)</span></div></div>}
                  </div>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, true)} style={{display: 'none'}} />
                </label>
              </div>

              <button type="submit" disabled={isUploading} style={{...modalStyles.btnSaveWI, background: '#3B82F6'}}>
                {isUploading ? 'Tunggu...' : 'Update Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// STYLES UPDATE
const uploadStyles = { 
  container: { border: '2px dashed #E2E8F0', borderRadius: '12px', padding: '10px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC' }, 
  label: { cursor: 'pointer', display: 'block', width: '100%' }, 
  inner: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40px', fontSize: '14px', fontWeight: '600' } 
};

const uiStyles = { 
  loginOverlay: { height: '100vh', width: '100vw', background: '#F1F5F9', display: 'flex', justifyContent: 'center', alignItems: 'center' }, 
  loginCard: { background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', width: '90%', maxWidth: '420px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }, 
  loginBtnAdmin: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#1E293B', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', transition: '0.2s' }, 
  loginBtnUser: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', transition: '0.2s' }, 
  mobileBtn: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 4000, background: '#10B981', color: 'white', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }, 
  sidebarOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000 }, 
  btnLogout: { background: 'white', border: '1px solid #E2E8F0', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' },
  qrGeneralContainer: { marginTop: '25px', paddingTop: '20px', borderTop: '1px dashed #E2E8F0', textAlign: 'center' },
  qrWrapper: { background: 'white', padding: '10px', borderRadius: '15px', display: 'inline-block', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }
};

const modalStyles = { 
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, backdropFilter: 'blur(2px)' }, 
  content: { background: 'white', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }, 
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }, 
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', width: '100%', boxSizing: 'border-box' }, 
  btnSaveWI: { padding: '15px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }, 
  btnClose: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' } 
};

export default App;