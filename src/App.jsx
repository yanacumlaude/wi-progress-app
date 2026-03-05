import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";
import { 
  Menu, X, ShieldCheck, Upload, CheckCircle, 
  FileText, CheckCircle2, ShieldAlert, BookOpen, 
  Lock, ArrowRight, User
} from "lucide-react";
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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [storageUsage, setStorageUsage] = useState(0);

  const initialWIState = {
    customer: "", 
    date_created: new Date().toLocaleDateString('id-ID'), 
    part_number: "", 
    mold_number: "", 
    model: "", 
    is_logo_updated: false, 
    is_6_sisi: false, 
    condition: "Bagus", 
    remarks: "", 
    status_oc: "Open", 
    location: "", 
    revision_no: "", 
    file_url: "", 
    process_name: "", 
    is_archived: false,
    is_verified_eng: true, 
    is_verified_qc: false, 
    is_verified_prod: false 
  };

  const [newWI, setNewWI] = useState(initialWIState);

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
      const { data } = await supabase.from('user_access').select('*').eq('username', divName).eq('password', password).single();
      if (data) {
        setUserSession(data.username);
        setRole(data.role);
        writeLog("LOGIN", "Sistem Dashboard", `${data.username} masuk`);
      } else {
        alert("Nama Divisi atau Password Salah!");
      }
    } catch (err) { alert("Gagal terhubung ke database!"); }
  };

  const handleFileUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return alert("Hanya PDF!");
    if (file.size > 2 * 1024 * 1024) return alert("Maksimal 2MB!");

    try {
      setIsUploading(true);
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`; 
      const filePath = `wi_documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wi-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      if (isEdit) setEditingWI({ ...editingWI, file_url: filePath });
      else setNewWI({ ...newWI, file_url: filePath });
      
      alert("Upload Berhasil!");
    } catch (error) { alert("Gagal upload: " + error.message); } 
    finally { setIsUploading(false); }
  };

  const handleSaveWI = async (e) => {
    e.preventDefault();
    if (!newWI.remarks || newWI.remarks.length < 5) return alert("Remarks (Alasan) wajib diisi!");

    try {
      setIsUploading(true);
      const payload = {
        customer: newWI.customer,
        part_number: newWI.part_number,
        model: newWI.model,
        location: newWI.location,
        is_logo_updated: Boolean(newWI.is_logo_updated),
        condition: newWI.condition,
        mold_number: newWI.mold_number,
        is_6_sisi: Boolean(newWI.is_6_sisi),
        remarks: newWI.remarks,
        status_oc: "Open",
        date_created: new Date().toLocaleDateString('id-ID'),
        file_url: newWI.file_url,
        process_name: newWI.process_name,
        revision_no: newWI.revision_no,
        is_archived: false,
        is_verified_eng: Boolean(newWI.is_verified_eng),
        is_verified_qc: Boolean(newWI.is_verified_qc),
        is_verified_prod: Boolean(newWI.is_verified_prod)
      };

      await supabase
        .from('wi_data')
        .update({ is_archived: true })
        .eq('part_number', payload.part_number)
        .eq('is_archived', false);

      const { error } = await supabase.from('wi_data').insert([payload]);
      if (error) throw error;

      await writeLog("CREATE", payload.part_number, `New Rev: ${payload.revision_no}`);
      alert("Master WI Berhasil Disimpan!"); 
      setIsModalInputWI(false); 
      setNewWI(initialWIState); 
      fetchData(); 
    } catch (err) { 
      console.error("Save Error:", err);
      alert("Error: " + err.message); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateWI = async (e) => {
    e.preventDefault();
    try {
      const { id, ...updateData } = editingWI;
      const { error } = await supabase.from('wi_data').update(updateData).eq('id', id);
      if (error) throw error;
      await writeLog("UPDATE", editingWI.part_number, "Data updated");
      alert("Berhasil Diperbarui!"); 
      setIsModalEditWI(false); 
      fetchData(); 
    } catch (err) {
      alert("Update Gagal: " + err.message);
    }
  };

  // --- FIXED DELETE FUNCTION (Sesuai Kebutuhan) ---
  const handleDeleteWI = async (id, fileUrl) => {
    const item = wiList.find(i => i.id === id);
    if (window.confirm(`Hapus permanen ${item?.part_number}?`)) {
      try {
        if (fileUrl) {
          let pathToDelete = fileUrl;
          // Pembersihan path agar konsisten
          if (fileUrl.includes('wi-files/')) {
            pathToDelete = fileUrl.split('wi-files/').pop().split('?')[0];
          } else if (!fileUrl.includes('wi_documents/')) {
            pathToDelete = `wi_documents/${fileUrl}`;
          }

          console.log("Menghapus dari storage:", pathToDelete);
          const { error: storageError } = await supabase.storage.from('wi-files').remove([pathToDelete]);
          if (storageError) console.error("Storage delete warning:", storageError.message);
        }

        const { error: dbError } = await supabase.from('wi_data').delete().eq('id', id);
        if (dbError) throw dbError;

        await writeLog("DELETE", item?.part_number, "Deleted from system");
        alert("Data & File Berhasil Dihapus!");
        fetchData();
      } catch (err) { 
        alert("Gagal hapus: " + err.message); 
      }
    }
  };

  // --- FIXED PREVIEW FUNCTION (Solusi Error 404 Vercel) ---
  const handleOpenPreview = async (path) => {
    if (!path) return alert("File tidak ditemukan!");
    try {
      let cleanPath = path;
      // Normalisasi path agar tidak double folder
      if (path.includes('wi-files/')) {
        cleanPath = path.split('wi-files/').pop().split('?')[0];
      } else if (!path.includes('wi_documents/')) {
        cleanPath = `wi_documents/${path}`;
      }

      console.log("Meminta Signed URL untuk:", cleanPath);
      
      // Menggunakan createSignedUrl agar file Private bisa diakses sementara lewat link Supabase
      const { data, error } = await supabase.storage
        .from('wi-files')
        .createSignedUrl(cleanPath, 3600); // Aktif 1 jam
      
      if (error || !data?.signedUrl) throw new Error("File tidak ditemukan di Storage Supabase");
      
      setPreviewUrl(data.signedUrl);
      setIsPreviewOpen(true);
    } catch (err) {
      alert("Gagal memuat dokumen: " + err.message);
      console.error(err);
    }
  };

  const renderContent = () => {
    switch (menu) {
      case "dashboard": return <Dashboard wiList={wiList} logs={logs} userSession={userSession} />;
      case "library": 
        const displayWI = role === 'admin' 
          ? wiList 
          : wiList.filter(item => !item.is_archived && item.is_verified_eng && item.is_verified_qc && item.is_verified_prod);
        return <WICenterLibrary wiList={displayWI} role={role} storageUsage={storageUsage} onEdit={(wi) => { setEditingWI(wi); setIsModalEditWI(true); }} onOpenInputModal={() => setIsModalInputWI(true)} onDelete={handleDeleteWI} onPreview={handleOpenPreview} />;
      case "logs": return <ActivityLog logs={logs} />; 
      default: return <Dashboard wiList={wiList} logs={logs} />;
    }
  };

  if (role === "unauthenticated") {
    return (
      <div style={uiStyles.loginOverlay}>
        <div style={uiStyles.loginCard}>
          <div style={uiStyles.loginHeader}>
            <div style={uiStyles.logoBox}>
              <BookOpen size={40} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h1 style={uiStyles.loginTitle}>NiBook</h1>
            <p style={uiStyles.loginSubtitle}>Work Instruction Management Hub</p>
            <p style={uiStyles.loginSlogan}>All for dreams</p>
          </div>

          <form onSubmit={handleLogin} style={uiStyles.loginForm}>
            <div style={uiStyles.inputWrapper}>
               <User size={18} color="#94A3B8" />
               <input name="divisi" placeholder="Username / Division" required style={uiStyles.loginInput} />
            </div>
            <div style={uiStyles.inputWrapper}>
               <Lock size={18} color="#94A3B8" />
               <input name="password" type="password" placeholder="Password" required style={uiStyles.loginInput} />
            </div>
            <button type="submit" style={uiStyles.loginBtnAdmin}>
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <div style={uiStyles.qrGeneralContainer}>
              <div style={uiStyles.qrBox}>
                <QRCodeCanvas value={`${window.location.origin}?mode=library`} size={90} />
              </div>
              <p style={{fontSize: '11px', color: '#94A3B8', marginTop: '12px', fontWeight: '600'}}>SCAN FOR GUEST ACCESS</p>
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

      <div style={{ width: isSidebarOpen ? '260px' : '0', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'fixed', height: '100vh', zIndex: 3000, overflow: 'hidden', background: '#ffffff', borderRight: '1px solid #E2E8F0', boxShadow: '10px 0 30px rgba(0,0,0,0.02)' }}>
        <div style={uiStyles.sidebarHeader}>
            <div style={uiStyles.sidebarLogoBox}>
              <BookOpen size={22} color="#ffffff" strokeWidth={3} />
            </div>
            <div style={{display:'flex', flexDirection:'column'}}>
              <span style={uiStyles.sidebarBrandName}>NiBook</span>
              <span style={uiStyles.sidebarBrandSlogan}>All for dreams</span>
            </div>
        </div>
        <Sidebar role={role} menu={menu} setMenu={(m) => { setMenu(m); if(window.innerWidth < 768) setIsSidebarOpen(false); }} userSession={userSession} />
      </div>
      
      <main style={{ flex: 1, padding: window.innerWidth < 768 ? '20px 15px' : '30px', marginLeft: isSidebarOpen && window.innerWidth > 768 ? '260px' : '0', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', width: '100%' }}>
        {renderContent()}
      </main>

      {isModalInputWI && (
        <div style={modalStyles.overlay}>
          <div style={{...modalStyles.content, maxWidth: '650px'}}>
            <div style={modalStyles.header}>
              <h3 style={{margin:0}}>Tambah Master WI Baru</h3>
              <button onClick={() => setIsModalInputWI(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveWI} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={grid2}>
                <div><label style={labelS}>CUSTOMER</label><input style={modalStyles.input} placeholder="Nama Customer" required value={newWI.customer} onChange={e=>setNewWI({...newWI, customer: e.target.value})}/></div>
                <div><label style={labelS}>PROSES</label><input style={modalStyles.input} placeholder="Injection / Assy" required value={newWI.process_name} onChange={e=>setNewWI({...newWI, process_name: e.target.value})}/></div>
              </div>
              <div style={grid2}>
                <div><label style={labelS}>PART NUMBER</label><input style={modalStyles.input} placeholder="P/N" required value={newWI.part_number} onChange={e=>setNewWI({...newWI, part_number: e.target.value})}/></div>
                <div><label style={labelS}>MOLD NUMBER</label><input style={modalStyles.input} placeholder="M/N" required value={newWI.mold_number} onChange={e=>setNewWI({...newWI, mold_number: e.target.value})}/></div>
              </div>
              <div style={grid2}>
                <div><label style={labelS}>MODEL</label><input style={modalStyles.input} placeholder="Nama Model" required value={newWI.model} onChange={e=>setNewWI({...newWI, model: e.target.value})}/></div>
                <div><label style={labelS}>REVISI KE-</label><input style={modalStyles.input} placeholder="01" required value={newWI.revision_no} onChange={e=>setNewWI({...newWI, revision_no: e.target.value})}/></div>
              </div>
              <div style={verifContainer}>
                <p style={{fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '10px'}}>PHYSICAL VERIFICATION CHECKLIST</p>
                <div style={{display: 'flex', gap: '8px'}}>
                  {['eng', 'qc', 'prod'].map(dept => (
                    <label key={dept} style={{...uiStyles.verifCard, 
                      borderColor: newWI[`is_verified_${dept}`] ? '#10B981' : '#E2E8F0',
                      background: newWI[`is_verified_${dept}`] ? '#F0FDF4' : 'white'
                    }}>
                      <input type="checkbox" checked={newWI[`is_verified_${dept}`]} onChange={e=>setNewWI({...newWI, [`is_verified_${dept}`]: e.target.checked})} style={{display:'none'}} />
                      {newWI[`is_verified_${dept}`] ? <CheckCircle2 size={16} color="#10B981" /> : <div style={uiStyles.emptyCircle} />}
                      <span style={{color: newWI[`is_verified_${dept}`] ? '#065F46' : '#64748B'}}>{dept.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div><label style={labelS}>REMARKS (ALASAN REVISI)</label><textarea style={{...modalStyles.input, height: '60px'}} placeholder="Wajib diisi..." required value={newWI.remarks} onChange={e=>setNewWI({...newWI, remarks: e.target.value})}/></div>
              <div style={uploadStyles.container}>
                <label style={uploadStyles.label}>
                  <div style={uploadStyles.inner}>
                    {isUploading ? <span>Mengunggah...</span> : newWI.file_url ? <div style={{color: '#10B981'}}><CheckCircle size={18} /> FILE PDF READY</div> : <div><Upload size={18} /> Upload WI (PDF)</div>}
                  </div>
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, false)} style={{display: 'none'}} />
                </label>
              </div>
              <button type="submit" disabled={isUploading || !newWI.file_url} style={{...modalStyles.btnSaveWI, background: (isUploading || !newWI.file_url) ? '#CBD5E1' : '#10B981'}}>Aktifkan Master WI</button>
            </form>
          </div>
        </div>
      )}

      {isModalEditWI && editingWI && (
        <div style={modalStyles.overlay}>
          <div style={{...modalStyles.content, maxWidth: '600px'}}>
            <div style={modalStyles.header}>
              <h3>Update & Verifikasi</h3>
              <button onClick={() => setIsModalEditWI(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleUpdateWI} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={grid2}>
                <input style={modalStyles.input} value={editingWI.customer} onChange={e=>setEditingWI({...editingWI, customer: e.target.value})}/>
                <input style={modalStyles.input} value={editingWI.process_name} onChange={e=>setEditingWI({...editingWI, process_name: e.target.value})}/>
              </div>
              <div style={verifContainer}>
                <div style={{display: 'flex', gap: '8px'}}>
                  {['eng', 'qc', 'prod'].map(dept => (
                    <label key={dept} style={{...uiStyles.verifCard, 
                      borderColor: editingWI[`is_verified_${dept}`] ? '#10B981' : '#E2E8F0',
                      background: editingWI[`is_verified_${dept}`] ? '#F0FDF4' : 'white',
                      flex: 1
                    }}>
                      <input type="checkbox" checked={editingWI[`is_verified_${dept}`]} onChange={e=>setEditingWI({...editingWI, [`is_verified_${dept}`]: e.target.checked})} style={{display:'none'}} />
                      {editingWI[`is_verified_${dept}`] ? <CheckCircle2 size={16} color="#10B981" /> : <div style={uiStyles.emptyCircle} />}
                      <span>{dept.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
              <textarea style={modalStyles.input} value={editingWI.remarks} onChange={e=>setEditingWI({...editingWI, remarks: e.target.value})}/>
              <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#FEF2F2', padding:'12px', borderRadius:'12px'}}>
                  <input type="checkbox" checked={editingWI.is_archived} onChange={e => setEditingWI({...editingWI, is_archived: e.target.checked})} />
                  <label style={{fontSize:'13px', color:'#991B1B', fontWeight:'bold'}}>SET AS OBSOLETE (ARCHIVE)</label>
              </div>
              <button type="submit" style={{...modalStyles.btnSaveWI, background: '#3B82F6'}}>Update Data</button>
            </form>
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <div style={modalStyles.overlay}>
          <div style={{...modalStyles.content, maxWidth: '95vw', width: '1100px', height: '90vh', padding: '10px'}}>
            <div style={modalStyles.header}>
               <h3 style={{margin:0}}>Dokumen Preview (Private)</h3>
               <button onClick={() => setIsPreviewOpen(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <iframe src={previewUrl} style={{width: '100%', height: 'calc(100% - 50px)', borderRadius: '12px', border: 'none'}} />
          </div>
        </div>
      )}
    </div>
  );
}

// Styles Tetap Sama
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const labelS = { fontSize: '10px', fontWeight: '800', color: '#94A3B8', marginBottom: '4px', display: 'block' };
const verifContainer = { background: '#F8FAFC', padding: '15px', borderRadius: '15px', border: '1px solid #E2E8F0' };
const uploadStyles = { container: { border: '2px dashed #E2E8F0', borderRadius: '12px', padding: '10px', textAlign: 'center', background: '#F8FAFC' }, label: { cursor: 'pointer', display: 'block' }, inner: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40px', gap: '10px', fontSize: '14px', fontWeight: '600' } };
const uiStyles = { loginOverlay: { height: '100vh', width: '100vw', background: 'radial-gradient(circle at top left, #0f172a, #020617)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Inter', sans-serif" }, loginCard: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '50px 40px', borderRadius: '40px', textAlign: 'center', width: '90%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }, loginHeader: { marginBottom: '35px' }, logoBox: { background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }, loginTitle: { color: '#ffffff', fontSize: '36px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }, loginSubtitle: { color: '#94A3B8', fontSize: '14px', margin: '5px 0 0 0' }, loginSlogan: { color: '#10B981', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px' }, loginForm: { display: 'flex', flexDirection: 'column', gap: '15px' }, inputWrapper: { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '0 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }, loginInput: { background: 'transparent', border: 'none', color: '#ffffff', padding: '16px 0', fontSize: '15px', width: '100%', outline: 'none' }, loginBtnAdmin: { width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: '#10B981', color: 'white', cursor: 'pointer', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 15px rgba(16, 185, 129, 0.2)', transition: '0.3s' }, qrGeneralContainer: { marginTop: '40px', paddingTop: '30px', borderTop: '1px dashed rgba(255,255,255,0.1)' }, qrBox: { background: 'white', padding: '10px', borderRadius: '18px', display: 'inline-block', border: '4px solid #10B981' }, sidebarHeader: { padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid #F1F5F9' }, sidebarLogoBox: { background: '#10B981', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }, sidebarBrandName: { fontSize: '22px', fontWeight: '900', color: '#1E293B', lineHeight: 1 }, sidebarBrandSlogan: { fontSize: '9px', color: '#10B981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }, mobileBtn: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 4000, background: '#10B981', color: 'white', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }, sidebarOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, backdropFilter: 'blur(4px)' }, verifCard: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: '2px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', transition: '0.2s' }, emptyCircle: { width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #CBD5E1' } };
const modalStyles = { overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, backdropFilter: 'blur(8px)' }, content: { background: 'white', padding: '25px', borderRadius: '25px', width: '90%', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }, header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, input: { padding: '12px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' }, btnSaveWI: { padding: '15px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }, btnClose: { background: '#F1F5F9', border: 'none', fontSize: '20px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%' } };

export default App;