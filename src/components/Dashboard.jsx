import React from "react";
import { 
  BarChart3, AlertCircle, CheckCircle2, FileEdit, 
  ArrowUpRight, Clock, PlusCircle, LayoutDashboard, 
  Activity, ShieldCheck, Layers, ClipboardList, ListTodo
} from "lucide-react";

export default function Dashboard({ wiList, ticketList, revisiList }) {
  // Logic Filter Data untuk Progress
  const totalWI = wiList?.length || 0;
  
  // Progress Pipeline (Biar kelihatan kerjanya banyak step)
  const inRevision = revisiList?.filter(r => r.status === 'In Progress').length || 0;
  const readyToDistribute = revisiList?.filter(r => r.status === 'Ready' || !r.status).length || 0; // Tambahkan status 'Ready' di pikiran kita
  const distributed = revisiList?.filter(r => r.status === 'Distributed').length || 0;

  // Breakdown WI per Tipe (Contoh Informasi Tambahan)
  const openFindings = ticketList?.filter(t => t.status === 'Open').length || 0;

  return (
    <div style={styles.wrapper}>
      {/* HEADER SECTION */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcomeText}>WI PROGRESS TRACKER</h1>
          <p style={styles.subText}>Transparansi Dokumen & Monitoring Temuan Lapangan</p>
        </div>
        <div style={styles.liveStatus}>
          <div style={styles.statusDot}></div>
          <span>SISTEM TERKONEKSI</span>
        </div>
      </header>

      {/* 1. PROGRESS PIPELINE (Gantinya Distribution Rate) */}
      <div style={styles.pipelineContainer}>
        <div style={styles.pipelineHeader}>
          <h3 style={styles.cardTitle}>ALUR PROSES DISTRIBUSI WI</h3>
          <span style={styles.infoBadge}>Update Real-time</span>
        </div>
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
            <p style={styles.statLabel}>OPEN FINDINGS (TEMUAN)</p>
            <h3 style={{...styles.statValue, color: '#EF4444'}}>{openFindings}</h3>
          </div>
          <AlertCircle color="#EF4444" size={32} opacity={0.2} />
        </div>
      </div>

      {/* 3. LOWER SECTION: LIST & SUMMARY */}
      <div style={styles.mainGrid}>
        {/* Table Activity - Memperlihatkan apa yang paling baru dikerjakan */}
        <div style={styles.tableCard}>
          <h3 style={styles.cardTitle}>AKTIVITAS TERKINI (LAPANGAN)</h3>
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

        {/* Executive Summary - PENGGANTI SYSTEM LOG */}
        <div style={styles.summaryCard}>
          <h3 style={{...styles.cardTitle, color: 'white'}}>EXECUTIVE SUMMARY</h3>
          <div style={styles.summaryItem}>
            <div style={styles.bullet}></div>
            <p><strong>{inRevision} WI</strong> sedang dalam proses update konten teknis.</p>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.bullet}></div>
            <p><strong>{openFindings} Temuan</strong> sedang menunggu verifikasi dari team produksi.</p>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.bullet}></div>
            <p>Fokus minggu ini: Distribusi area <strong>{revisiList[0]?.location || 'Line Utama'}</strong>.</p>
          </div>
          
          <div style={styles.tipBox}>
             <p><em>*Data ini adalah rangkuman dari progres harian di lapangan.</em></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: '22px', fontWeight: '900', color: '#1E293B', margin: 0 },
  subText: { color: '#64748B', fontSize: '13px' },
  liveStatus: { display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #E2E8F0' },
  statusDot: { width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%', boxShadow: '0 0 8px #22C55E' },
  
  pipelineContainer: { background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  pipelineHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  cardTitle: { fontSize: '14px', fontWeight: '800', color: '#475569' },
  infoBadge: { background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', color: '#64748B' },
  pipelineGrid: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  stepCard: { display: 'flex', alignItems: 'center', gap: '15px', flex: 1 },
  stepIcon: { padding: '12px', borderRadius: '12px' },
  stepLabel: { fontSize: '10px', fontWeight: '800', color: '#94A3B8', margin: 0 },
  stepValue: { fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: 0 },
  unit: { fontSize: '12px', fontWeight: '400', color: '#64748B' },
  arrow: { color: '#CBD5E1', fontWeight: 'bold', padding: '0 10px' },

  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  statCard: { background: 'white', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: '11px', fontWeight: '800', color: '#94A3B8' },
  statValue: { fontSize: '28px', fontWeight: '800', margin: '5px 0' },

  mainGrid: { display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '20px' },
  tableCard: { background: 'white', padding: '25px', borderRadius: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
  trHead: { textAlign: 'left', fontSize: '11px', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' },
  trBody: { borderBottom: '1px solid #F1F5F9', fontSize: '13px' },
  statusBadge: (s) => ({
    fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px',
    background: s === 'Distributed' ? '#DCFCE7' : '#FEF3C7',
    color: s === 'Distributed' ? '#166534' : '#92400E'
  }),

  summaryCard: { background: '#1E293B', padding: '25px', borderRadius: '25px', color: 'white' },
  summaryItem: { display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'flex-start' },
  bullet: { width: '6px', height: '6px', background: '#38BDF8', borderRadius: '50%', marginTop: '6px' },
  tipBox: { marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '11px', color: '#94A3B8' }
};