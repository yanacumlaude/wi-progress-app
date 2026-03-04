import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";
import { Menu, X, ShieldCheck, Upload, CheckCircle, FileText, Archive, Users, Lock, Clock, Eye } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react"; 

import Dashboard from "./components/Dashboard";
import WICenterLibrary from "./components/WICenterLibrary";
import ActivityLog from "./components/ActivityLog"; 

function App() {
  const [role, setRole] = useState("unauthenticated");
  const [userSession, setUserSession] = useState(""); 
  const [menu, setMenu] = useState("dashboard");
  const [wiList, setWiList] = useState([]);
  const [logs, setLogs] = useState([]); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isModalInputWI, setIsModalInputWI] = useState(false);
  const [isModalEditWI, setIsModalEditWI] = useState(false);
  const [editingWI, setEditingWI] = useState(null);

  // State Baru untuk Preview PDF
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [storageUsage, setStorageUsage] = useState(0);

  const [newWI, setNewWI] = useState({
    customer: "", date_created: new Date().toISOString().split('T')[0], 
    part_number: "", mold_number: "", model: "", is_logo_updated: false, 
    is_6_sisi: false, condition: "Bagus", remarks: "", status_oc: "O", 
    location: "", revision_no: "", file_url: "", process_name: "", is_archived: false 
  });

  // --- REPAIR: writeLog lebih aman (Anti-Error 400) ---
  const writeLog = async (action, target, details = "") => {
    try {
      const { error } = await supabase.from('activity_logs').insert([
        { 
          user_name: userSession || "System", 
          action: action, 
          target_item: target,
          details: details, 
          created_at: new Date().toISOString()
        }
      ]);
      if (error) console.error("Log error:", error.message);
      fetchLogs();
    } catch (err) { console.error("Log error:", err); }
  };

  const fetchData = async () => {
    const { data: wi } = await supabase.from('wi_data').select('*').order('id', { ascending: false });
    const list = wi || [];
    setWiList(list);
    
    const estimatedSize = (list.filter(item => item.file_url).length * 0.7).toFixed(2);
    setStorageUsage(estimatedSize);
  };

  const fetchLogs = async () => {
    const { data: logData } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
    setLogs(logData || []);
  };

  useEffect(() => { 
    fetchData();
    fetchLogs();
    
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("mode") === "library") {
      setRole("guest"); 
      setUserSession("Guest Operator");
      setMenu("library");    
    }

    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const divName = e.target.divisi.value; 
    const password = e.target.password.value;

    try {
      const { data, error } = await supabase
        .from('user_access')
        .select('*')
        .eq('username', divName)
        .eq('password', password)
        .single();

      if (data) {
        setUserSession(data.username);
        setRole(data.role);
        
        setTimeout(() => {
            supabase.from('activity_logs').insert([{
                user_name: data.username,
                action: "LOGIN",
                target_item: "Sistem Dashboard",
                details: `${data.username} berhasil masuk ke sistem`,
                created_at: new Date().toISOString()
            }]).then(() => fetchLogs());
        }, 500);

      } else {
        alert("Nama Divisi atau Password Salah, Puh!");
      }

      if (error) console.error("Login detail:", error.message);
    } catch (err) {
      alert("Gagal terhubung ke database!");
    }
  };

  const handleFileUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return alert("Hanya PDF!");
    if (file.size > 2 * 1024 * 1024) return alert("File terlalu besar (Max 2MB)!");

    try {
      setIsUploading(true);
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('wi-files').upload(`wi_documents/${fileName}`, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('wi-files').getPublicUrl(`wi_documents/${fileName}`);
      if (isEdit) setEditingWI({ ...editingWI, file_url: publicUrl });
      else setNewWI({ ...newWI, file_url: publicUrl });
      alert("Upload Berhasil!");
    } catch (error) { alert("Gagal upload!"); } 
    finally { setIsUploading(false); }
  };

  const handleSaveWI = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_data').insert([newWI]);
    if (error) alert(error.message);
    else { 
      await writeLog("CREATE", newWI.part_number, `Input baru customer: ${newWI.customer}`);
      alert("Master WI Disimpan!"); 
      setIsModalInputWI(false); 
      setNewWI({ customer: "", date_created: new Date().toISOString().split('T')[0], part_number: "", mold_number: "", model: "", is_logo_updated: false, is_6_sisi: false, condition: "Bagus", remarks: "", status_oc: "O", location: "", revision_no: "", file_url: "", process_name: "", is_archived: false }); 
      fetchData(); 
    }
  };

  const handleUpdateWI = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_data').update(editingWI).eq('id', editingWI.id);

    if (error) alert(error.message);
    else { 
      const actionType = editingWI.is_archived ? "ARCHIVE" : "UPDATE";
      await writeLog(actionType, editingWI.part_number, `Remark: ${editingWI.remarks || 'No remarks'}`);
      alert("Berhasil Diperbarui!"); 
      setIsModalEditWI(false); 
      fetchData(); 
    }
  };

  const handleDeleteWI = async (id, fileUrl) => {
    const item = wiList.find(i => i.id === id);
    if (!item) return;

    if (window.confirm(`Yakin hapus permanen WI: ${item.part_number}? File di storage juga akan dihapus.`)) {
      try {
        if (fileUrl) {
          const fileName = fileUrl.split('/').pop(); 
          const { error: storageError } = await supabase
            .storage
            .from('wi-files')
            .remove([`wi_documents/${fileName}`]);

          if (storageError) console.warn("Storage warning:", storageError.message);
        }

        const { error } = await supabase.from('wi_data').delete().eq('id', id);
        if (!error) {
          await writeLog("DELETE", item.part_number, "Dihapus permanen (Data & File)");
          alert("Data dan File fisik berhasil dihapus!");
          fetchData();
        } else {
          throw error;
        }
      } catch (err) { alert("Gagal menghapus: " + err.message); }
    }
  };

  // Fungsi Baru: Buka Preview
  const handleOpenPreview = (url) => {
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  const renderContent = () => {
    switch (menu) {
      case "dashboard": return <Dashboard wiList={wiList} logs={logs} userSession={userSession} />;
      case "library": 
        const displayWI = role === 'admin' ? wiList : wiList.filter(item => !item.is_archived);
        return <WICenterLibrary 
                  wiList={displayWI} 
                  role={role} 
                  storageUsage={storageUsage} 
                  onEdit={(wi) => { setEditingWI(wi); setIsModalEditWI(true); }} 
                  onOpenInputModal={() => setIsModalInputWI(true)} 
                  onDelete={(id, url) => handleDeleteWI(id, url)}
                  onPreview={handleOpenPreview} // Mengirim fungsi preview
                />;
      case "logs": return <ActivityLog logs={logs} />; 
      default: return <Dashboard wiList={wiList} logs={logs} />;
    }
  };

  if (role === "unauthenticated") {
    return (
      <div style={uiStyles.loginOverlay}>
        <div style={uiStyles.loginCard}>
          <div style={{background: '#ECFDF5', width:'60px', height:'60px', borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px auto'}}>
            <ShieldCheck size={32} color="#10B981" />
          </div>
          <h2 style={{margin: '0 0 5px 0', color: '#1E293B', fontSize:'22px', fontWeight:'900'}}>WI HUB LOGIN</h2>
          <form onSubmit={handleLogin} style={{textAlign:'left', display:'flex', flexDirection:'column', gap:'15px'}}>
            <div>
              <label style={{fontSize:'12px', fontWeight:'bold', color:'#475569'}}>NAMA DIVISI / USER</label>
              <input name="divisi" placeholder="Contoh: Engineering" required style={{...modalStyles.input, marginTop:'5px'}} />
            </div>
            <div>
              <label style={{fontSize:'12px', fontWeight:'bold', color:'#475569'}}>PASSWORD</label>
              <input name="password" type="password" placeholder="••••••••" required style={{...modalStyles.input, marginTop:'5px'}} />
            </div>
            <button type="submit" style={uiStyles.loginBtnAdmin}>Masuk ke Sistem</button>
          </form>
          <div style={uiStyles.qrGeneralContainer}>
             <p style={{fontSize: '11px', fontWeight: 'bold', color: '#94A3B8', marginBottom: '10px'}}>QR AKSES CEPAT (VIEWER ONLY)</p>
             <div style={uiStyles.qrWrapper}>
                <QRCodeCanvas value={`${window.location.origin}?mode=library`} size={100} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', background: '#F8FAFC', minHeight: '100vh', width: '100vw' }}>
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={uiStyles.mobileBtn}>
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isSidebarOpen && window.innerWidth < 768 && <div onClick={() => setIsSidebarOpen(false)} style={uiStyles.sidebarOverlay} />}

      <div style={{ 
        width: isSidebarOpen ? '260px' : '0', transition: '0.3s', position: 'fixed', height: '100vh', zIndex: 3000,
        overflow: 'hidden', background: 'white', borderRight: '1px solid #E2E8F0'
      }}>
        <Sidebar role={role} menu={menu} setMenu={(m) => { setMenu(m); if(window.innerWidth < 768) setIsSidebarOpen(false); }} userSession={userSession} />
      </div>
      
      <main style={{ 
        flex: 1, padding: window.innerWidth < 768 ? '20px 15px' : '30px', 
        marginLeft: isSidebarOpen && window.innerWidth > 768 ? '260px' : '0', 
        transition: '0.3s', width: '100%'
      }}>
        {renderContent()}
      </main>

      {/* --- MODAL INPUT WI --- */}
      {isModalInputWI && (
        <div style={modalStyles.overlay}>
          <div style={{...modalStyles.content, maxWidth: '600px'}}>
            <div style={modalStyles.header}>
              <h3 style={{margin:0}}>Input Master WI Baru</h3>
              <button onClick={() => setIsModalInputWI(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveWI} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Customer" value={newWI.customer} onChange={e=>setNewWI({...newWI, customer: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Nama Proses" value={newWI.process_name} onChange={e=>setNewWI({...newWI, process_name: e.target.value})}/>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Part Number" required value={newWI.part_number} onChange={e=>setNewWI({...newWI, part_number: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Mold Number" value={newWI.mold_number} onChange={e=>setNewWI({...newWI, mold_number: e.target.value})}/>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Model" value={newWI.model} onChange={e=>setNewWI({...newWI, model: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Lokasi Simpan" value={newWI.location} onChange={e=>setNewWI({...newWI, location: e.target.value})}/>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Revisi Ke-" value={newWI.revision_no} onChange={e=>setNewWI({...newWI, revision_no: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Remarks / Catatan" value={newWI.remarks} onChange={e=>setNewWI({...newWI, remarks: e.target.value})}/>
              </div>
              <div style={uploadStyles.container}>
                <label style={uploadStyles.label}>
                  <div style={uploadStyles.inner}>
                    {isUploading ? <span>Mengunggah...</span> : newWI.file_url ? <div style={{color: '#10B981'}}><CheckCircle size={18} /> PDF OK</div> : <div style={{color: '#64748B'}}><Upload size={18} /> Pilih PDF Dokumen (Max 2MB)</div>}
                  </div>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, false)} style={{display: 'none'}} />
                </label>
              </div>
              <button type="submit" disabled={isUploading || !newWI.file_url} style={{...modalStyles.btnSaveWI, background: (isUploading || !newWI.file_url) ? '#CBD5E1' : '#10B981'}}>
                Simpan Master WI
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT WI --- */}
      {isModalEditWI && editingWI && (
        <div style={modalStyles.overlay}>
          <div style={{...modalStyles.content, maxWidth: '600px'}}>
            <div style={modalStyles.header}>
              <h3 style={{margin:0}}>Edit Data WI</h3>
              <button onClick={() => setIsModalEditWI(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleUpdateWI} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Customer" value={editingWI.customer} onChange={e=>setEditingWI({...editingWI, customer: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Proses" value={editingWI.process_name} onChange={e=>setEditingWI({...editingWI, process_name: e.target.value})}/>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Part Number" value={editingWI.part_number} onChange={e=>setEditingWI({...editingWI, part_number: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Mold Number" value={editingWI.mold_number} onChange={e=>setEditingWI({...editingWI, mold_number: e.target.value})}/>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <input style={modalStyles.input} placeholder="Lokasi" value={editingWI.location} onChange={e=>setEditingWI({...editingWI, location: e.target.value})}/>
                <input style={modalStyles.input} placeholder="Revisi" value={editingWI.revision_no} onChange={e=>setEditingWI({...editingWI, revision_no: e.target.value})}/>
              </div>
              <textarea style={{...modalStyles.input, height: '60px'}} placeholder="Remarks" value={editingWI.remarks} onChange={e=>setEditingWI({...editingWI, remarks: e.target.value})}/>
              <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#FEF2F2', padding:'12px', borderRadius:'12px', border:'1px solid #FECDD3'}}>
                 <input type="checkbox" id="archive-check" checked={editingWI.is_archived} onChange={e => setEditingWI({...editingWI, is_archived: e.target.checked})} style={{width: '18px', height: '18px'}} />
                 <label htmlFor="archive-check" style={{fontSize:'13px', color:'#991B1B', fontWeight:'bold'}}>Tandai sebagai OBSOLETE (Arsip)</label>
              </div>
              <button type="submit" style={{...modalStyles.btnSaveWI, background: '#3B82F6'}}>Simpan Perubahan</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PREVIEW PDF (BARU) --- */}
      {isPreviewOpen && (
        <div style={modalStyles.overlay}>
          <div style={{...modalStyles.content, maxWidth: '95vw', width: '1000px', height: '90vh', padding: '15px'}}>
            <div style={modalStyles.header}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <FileText color="#3B82F6" />
                <h3 style={{margin:0}}>Preview Dokumen WI</h3>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <iframe 
              src={previewUrl} 
              style={{width: '100%', height: 'calc(100% - 60px)', borderRadius: '12px', border: '1px solid #E2E8F0'}} 
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const uploadStyles = { container: { border: '2px dashed #E2E8F0', borderRadius: '12px', padding: '10px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC' }, label: { cursor: 'pointer', display: 'block', width: '100%' }, inner: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40px', fontSize: '14px', fontWeight: '600' } };
const uiStyles = { loginOverlay: { height: '100vh', width: '100vw', background: '#F1F5F9', display: 'flex', justifyContent: 'center', alignItems: 'center' }, loginCard: { background: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center', width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }, loginBtnAdmin: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#10B981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold', fontSize: '15px', marginTop: '10px' }, mobileBtn: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 4000, background: '#10B981', color: 'white', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }, sidebarOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000 }, qrGeneralContainer: { marginTop: '25px', paddingTop: '20px', borderTop: '1px dashed #E2E8F0' }, qrWrapper: { background: 'white', padding: '10px', borderRadius: '15px', display: 'inline-block', border: '1px solid #E2E8F0' } };
const modalStyles = { overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, backdropFilter: 'blur(4px)' }, content: { background: 'white', padding: '25px', borderRadius: '25px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }, header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, input: { padding: '12px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' }, btnSaveWI: { padding: '15px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }, btnClose: { background: '#F1F5F9', border: 'none', fontSize: '20px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' } };

export default App;