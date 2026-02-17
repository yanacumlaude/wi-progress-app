import React from "react";
import { 
  BarChart3, AlertCircle, CheckCircle2, FileEdit, 
  ArrowUpRight, Clock, PlusCircle, LayoutDashboard, 
  Activity, ShieldCheck, Layers, ClipboardList, ListTodo
} from "lucide-react";

export default function Dashboard({ wiList, ticketList, revisiList }) {
  // Logic Filter Data untuk Progress
  const totalWI = wiList?.length || 0;
  
  // Progress Pipeline
  const inRevision = revisiList?.filter(r => r.status === 'In Progress').length || 0;
  const readyToDistribute = revisiList?.filter(r => r.status === 'Ready' || !r.status).length || 0;
  const distributed = revisiList?.filter(r => r.status === 'Distributed').length || 0;

  // Breakdown WI per Tipe
  const openFindings = ticketList?.filter(t => t.status === 'Open').length || 0;

  // Check jika layar mobile (sederhana)
  const isMobile = window.innerWidth < 768;

  return (
    <div style={styles.wrapper}>
      {/* HEADER SECTION */}
      <header style={styles.header}>
        <div style={{ flex: 1 }}>
          <h1 style={styles.welcomeText}>WI PROGRESS TRACKER</h1>
          <p style={styles.subText}>Transparansi Dokumen & Monitoring</p>
        </div>
        {!isMobile && (
          <div style={styles.liveStatus}>
            <div style={styles.statusDot}></div>
            <span>SISTEM TERKONEKSI</span>
          </div>
        )}
      </header>

      {/* 1. PROGRESS PIPELINE (Dibuat bisa scroll horizontal di HP) */}
      <div style={styles.pipelineContainer}>
        <div style={styles.pipelineHeader}>
          <h3 style={styles.cardTitle}>ALUR PROSES DISTRIBUSI WI</h3>
          <span style={styles.infoBadge}>Swipe untuk detail →</span>
        </div>
        <div style={styles.scrollArea}>
          <div style={styles.pipelineGrid}>
            {/* Step 1 */}
            <div style={styles.stepCard}>
              <div style={{...styles.stepIcon, background: '#E0F2FE'}}><FileEdit size={20} color="#0EA5E9"/></div>
              <div>
                <p style={styles.stepLabel}>TAHAP REVISI</p>
                <h2 style={styles.stepValue}>{inRevision} <span style={styles.unit}>Docs</span></h2>
              </div>
            </div>
            <div style={styles.arrow}>→</div>
            {/* Step 2 */}
            <div style={styles.stepCard}>
              <div style={{...styles.stepIcon, background: '#FFF7ED'}}><Clock size={20} color="#F97316"/></div>
              <div>
                <p style={styles.stepLabel}>SIAP DISTRIBUSI</p>
                <h2 style={styles.stepValue}>{readyToDistribute} <span style={styles.unit}>Docs</span></h2>
              </div>
            </div>
            <div style={styles.arrow}>→</div>
            {/* Step 3 */}
            <div style={styles.stepCard}>
              <div style={{...styles.stepIcon, background: '#DCFCE7'}}><CheckCircle2 size={20} color="#22C55E"/></div>
              <div>
                <p style={styles.stepLabel}>TERPASANG DI LINE</p>
                <h2 style={styles.stepValue}>{distributed} <span style={styles.unit}>Docs</span></h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>DATABASE MASTER WI</p>
            <h3 style={styles.statValue}>{totalWI}</h3>
          </div>
          <Layers color="#6366F1" size={32} opacity={0.2} />
        </div>
        <div style={styles.statCard}>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>OPEN FINDINGS</p>
            <h3 style={{...styles.statValue, color: '#EF4444'}}>{openFindings}</h3>
          </div>
          <AlertCircle color="#EF4444" size={32} opacity={0.2} />
        </div>
      </div>

      {/* 3. LOWER SECTION */}
      <div style={styles.mainGrid}>
        {/* Table Activity */}
        <div style={styles.tableCard}>
          <h3 style={styles.cardTitle}>AKTIVITAS TERKINI</h3>
          <div style={styles.scrollArea}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th>PART NUMBER</th>
                  <th>MODEL</th>
                  <th>JENIS WI</th>
                  <th>PROGRES</th>
                </tr>
              </thead>
              <tbody>
                {revisiList?.slice(0, 5).map(r => (
                  <tr key={r.id} style={styles.trBody}>
                    <td style={{fontWeight: 'bold'}}>{r.part_number}</td>
                    <td>{r.model}</td>
                    <td>{r.wi_type || 'FG'}</td>
                    <td>
                      <span style={styles.statusBadge(r.status)}>{r.status || 'Ready'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={styles.summaryCard}>
          <h3 style={{...styles.cardTitle, color: 'white', marginBottom: '15px'}}>EXECUTIVE SUMMARY</h3>
          <div style={styles.summaryItem}>
            <div style={styles.bullet}></div>
            <p style={styles.summaryText}><strong>{inRevision} WI</strong> sedang dalam proses update konten teknis.</p>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.bullet}></div>
            <p style={styles.summaryText}><strong>{openFindings} Temuan</strong> sedang menunggu verifikasi team.</p>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.bullet}></div>
            <p style={styles.summaryText}>Lokasi: <strong>{revisiList[0]?.location || 'Line Utama'}</strong>.</p>
          </div>
          <div style={styles.tipBox}>
             <p style={{margin: 0}}>*Data real-time lapangan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px', 
    animation: 'fadeIn 0.5s',
    width: '100%',
    paddingBottom: '80px' // Agar tidak tertutup tombol floating di mobile
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  welcomeText: { fontSize: '20px', fontWeight: '900', color: '#1E293B', margin: 0 },
  subText: { color: '#64748B', fontSize: '12px', margin: 0 },
  liveStatus: { display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #E2E8F0' },
  statusDot: { width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%', boxShadow: '0 0 8px #22C55E' },
  
  pipelineContainer: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  pipelineHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  scrollArea: { overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' },
  pipelineGrid: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '600px' },
  stepCard: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  stepIcon: { padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center' },
  stepLabel: { fontSize: '10px', fontWeight: '800', color: '#94A3B8', margin: 0 },
  stepValue: { fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 },
  unit: { fontSize: '11px', fontWeight: '400', color: '#64748B' },
  arrow: { color: '#CBD5E1', fontWeight: 'bold', padding: '0 10px' },

  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', 
    gap: '15px' 
  },
  statCard: { background: 'white', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #F1F5F9' },
  statLabel: { fontSize: '10px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.5px' },
  statValue: { fontSize: '24px', fontWeight: '800', margin: '5px 0' },

  mainGrid: { 
    display: 'grid', 
    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1.8fr 1fr', 
    gap: '20px' 
  },
  tableCard: { background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #F1F5F9' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '450px' },
  trHead: { textAlign: 'left', fontSize: '10px', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' },
  trBody: { borderBottom: '1px solid #F1F5F9', fontSize: '12px' },
  statusBadge: (s) => ({
    fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px',
    background: s === 'Distributed' ? '#DCFCE7' : '#FEF3C7',
    color: s === 'Distributed' ? '#166534' : '#92400E'
  }),

  summaryCard: { background: '#1E293B', padding: '20px', borderRadius: '25px', color: 'white' },
  summaryItem: { display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'flex-start' },
  summaryText: { margin: 0, fontSize: '12px', lineHeight: '1.5' },
  bullet: { width: '6px', height: '6px', background: '#38BDF8', borderRadius: '50%', marginTop: '6px', flexShrink: 0 },
  tipBox: { marginTop: '15px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '10px', color: '#94A3B8' },
  cardTitle: { fontSize: '13px', fontWeight: '800', color: '#475569', margin: 0 }
};