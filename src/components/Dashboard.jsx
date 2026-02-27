import React from "react";
import { 
  BarChart3, AlertCircle, CheckCircle2, FileEdit, 
  Layers, Clock, ShieldCheck, Activity, User
} from "lucide-react";

export default function Dashboard({ wiList = [], logs = [], userSession = "" }) {
  // Logic Filter Data
  const safeWI = Array.isArray(wiList) ? wiList : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  const totalWI = safeWI.length;
  const activeWI = safeWI.filter(wi => !wi.is_archived).length;
  const obsoleteWI = safeWI.filter(wi => wi.is_archived).length;

  const isMobile = window.innerWidth < 768;

  return (
    <div style={styles.wrapper}>
      {/* HEADER SECTION */}
      <header style={styles.header}>
        <div style={{ flex: 1 }}>
          <h1 style={styles.welcomeText}>OPERATIONAL DASHBOARD</h1>
          <p style={styles.subText}>Selamat Bekerja, <strong>Divisi {userSession || "General"}</strong></p>
        </div>
        {!isMobile && (
          <div style={styles.liveStatus}>
            <div style={styles.statusDot}></div>
            <span>SISTEM TERPANTAU</span>
          </div>
        )}
      </header>

      {/* 1. KEY PERFORMANCE INDICATORS (KPI) */}
      <div style={styles.pipelineContainer}>
        <div style={styles.pipelineHeader}>
          <h3 style={styles.cardTitle}>RINGKASAN DATABASE WI</h3>
          <span style={styles.infoBadge}>Live Summary</span>
        </div>
        <div style={styles.pipelineGrid}>
          <div style={styles.stepCard}>
            <div style={{...styles.stepIcon, background: '#E0F2FE'}}><Layers size={20} color="#0EA5E9"/></div>
            <div>
              <p style={styles.stepLabel}>TOTAL DATABASE</p>
              <h2 style={styles.stepValue}>{totalWI} <span style={styles.unit}>Items</span></h2>
            </div>
          </div>
          <div style={styles.arrow}>|</div>
          <div style={styles.stepCard}>
            <div style={{...styles.stepIcon, background: '#DCFCE7'}}><CheckCircle2 size={20} color="#22C55E"/></div>
            <div>
              <p style={styles.stepLabel}>ACTIVE (USE)</p>
              <h2 style={styles.stepValue}>{activeWI} <span style={styles.unit}>Docs</span></h2>
            </div>
          </div>
          <div style={styles.arrow}>|</div>
          <div style={styles.stepCard}>
            <div style={{...styles.stepIcon, background: '#FEF2F2'}}><AlertCircle size={20} color="#EF4444"/></div>
            <div>
              <p style={styles.stepLabel}>OBSOLETE</p>
              <h2 style={styles.stepValue}>{obsoleteWI} <span style={styles.unit}>Docs</span></h2>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SECTION: AUDIT TRAIL & LOGS */}
      <div style={styles.mainGrid}>
        {/* TABEL RIWAYAT AKTIVITAS (Ini yang bikin Bos Terperangah) */}
        <div style={styles.tableCard}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
            <h3 style={styles.cardTitle}><Activity size={16} style={{marginRight: '8px'}}/> AUDIT TRAIL (LOG AKTIVITAS)</h3>
            <span style={{fontSize:'10px', color:'#10B981', fontWeight:'bold'}}>REAL-TIME UPDATE</span>
          </div>
          <div style={styles.scrollArea}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={{paddingBottom: '10px'}}>WAKTU</th>
                  <th style={{paddingBottom: '10px'}}>PELAKSANA</th>
                  <th style={{paddingBottom: '10px'}}>TINDAKAN</th>
                  <th style={{paddingBottom: '10px'}}>TARGET PART</th>
                </tr>
              </thead>
              <tbody>
                {safeLogs.length > 0 ? safeLogs.slice(0, 8).map(log => (
                  <tr key={log.id} style={styles.trBody}>
                    <td style={{padding: '12px 0', color: '#64748B'}}>
                        {new Date(log.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td>
                        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                            <div style={{width:'20px', height:'20px', borderRadius:'50%', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <User size={12} color="#94A3B8"/>
                            </div>
                            <span style={{fontWeight: 'bold', fontSize:'11px'}}>{log.user_name}</span>
                        </div>
                    </td>
                    <td style={{fontSize:'11px'}}>{log.action}</td>
                    <td>
                        <span style={styles.partBadge}>{log.target_item || '-'}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#94A3B8'}}>Belum ada aktivitas tercatat.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY CARD (RIGHT SIDE) */}
        <div style={styles.summaryCard}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom: '20px'}}>
             <ShieldCheck size={24} color="#38BDF8"/>
             <h3 style={{...styles.cardTitle, color: 'white', margin: 0}}>SISTEM INTEGRITI</h3>
          </div>
          
          <div style={styles.summaryItem}>
            <div style={styles.bullet}></div>
            <p style={styles.summaryText}>Akses login tercatat otomatis berdasarkan <strong>Nama Divisi</strong>.</p>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.bullet}></div>
            <p style={styles.summaryText}>Setiap perubahan status <strong>Obsolete</strong> akan mencatat ID pelaksana.</p>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.bullet}></div>
            <p style={styles.summaryText}>Data master aman dengan backup di <strong>Supabase Cloud</strong>.</p>
          </div>

          <div style={styles.tipBox}>
              <p style={{margin: 0, fontWeight:'bold', color:'white'}}>Tips Atasan:</p>
              <p style={{margin: '5px 0 0 0'}}>Gunakan fitur filter di menu Library untuk mencari Mold Number lebih spesifik.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', paddingBottom: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  welcomeText: { fontSize: '20px', fontWeight: '900', color: '#1E293B', margin: 0 },
  subText: { color: '#64748B', fontSize: '13px', margin: 0 },
  liveStatus: { display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #E2E8F0' },
  statusDot: { width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%', boxShadow: '0 0 8px #22C55E' },
  pipelineContainer: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' },
  pipelineHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  pipelineGrid: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' },
  stepCard: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: '150px' },
  stepIcon: { padding: '12px', borderRadius: '15px', display: 'flex', alignItems: 'center' },
  stepLabel: { fontSize: '10px', fontWeight: '800', color: '#94A3B8', margin: 0 },
  stepValue: { fontSize: '20px', fontWeight: '900', color: '#1E293B', margin: 0 },
  unit: { fontSize: '11px', fontWeight: '400', color: '#64748B' },
  arrow: { color: '#E2E8F0', fontWeight: '100', fontSize: '20px' },
  mainGrid: { display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '2fr 1fr', gap: '20px' },
  tableCard: { background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #F1F5F9' },
  scrollArea: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  trHead: { textAlign: 'left', fontSize: '10px', color: '#94A3B8', borderBottom: '2px solid #F8FAFC' },
  trBody: { borderBottom: '1px solid #F8FAFC', fontSize: '12px' },
  partBadge: { padding: '4px 8px', background: '#EFF6FF', color: '#2563EB', borderRadius: '6px', fontWeight: 'bold', fontSize: '10px' },
  summaryCard: { background: '#1E293B', padding: '25px', borderRadius: '30px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  summaryItem: { display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'flex-start' },
  summaryText: { margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#CBD5E1' },
  bullet: { width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', marginTop: '8px', flexShrink: 0 },
  tipBox: { marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', fontSize: '11px', color: '#94A3B8', borderLeft: '4px solid #38BDF8' },
  cardTitle: { fontSize: '14px', fontWeight: '900', color: '#475569', margin: 0, letterSpacing: '0.5px' },
  infoBadge: { fontSize: '10px', color: '#10B981', background: '#DCFCE7', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }
};