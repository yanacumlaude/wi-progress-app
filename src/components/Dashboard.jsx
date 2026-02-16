import StatCard from "./StatCard"; 
import { FileText, ClipboardList, AlertTriangle, RefreshCw } from "lucide-react";

export default function Dashboard({ wiList, ticketList, revisiList }) {
  
  // LOGIKA FILTER: Dibuat case-insensitive (tidak peduli huruf besar/kecil)
  const totalWI = wiList?.length || 0;
  
  const openRequests = ticketList?.filter(t => 
    t.ticket_type?.toLowerCase() === 'request' && 
    (t.status?.toLowerCase() === 'open' || t.status === 'O')
  ).length || 0;

  const totalFindings = ticketList?.filter(t => 
    t.ticket_type?.toLowerCase() === 'finding'
  ).length || 0;

  // Pending Distribusi: jika tgl_distribusi kosong atau null
  const pendingRevisi = revisiList?.filter(r => 
    !r.tgl_distribusi || r.tgl_distribusi === "" || r.tgl_distribusi === "-"
  ).length || 0;

  // Hitung Persentase Sederhana untuk visual tambahan
  const completionRate = totalWI > 0 ? ((revisiList?.filter(r => r.tgl_distribusi).length / totalWI) * 100).toFixed(1) : 0;

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <h1 style={styles.title}>DASHBOARD OVERVIEW</h1>
        <div style={styles.dateBadge}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </header>
      
      {/* Grid Statistik Utama */}
      <div style={styles.statsGrid}>
        <StatCard title="Total Master WI" value={totalWI} color="#4318FF" icon={FileText} />
        <StatCard title="Open Requests" value={openRequests} color="#FFB800" icon={ClipboardList} />
        <StatCard title="Field Findings" value={totalFindings} color="#EE5D50" icon={AlertTriangle} />
        <StatCard title="Pending Distribusi" value={pendingRevisi} color="#05CD99" icon={RefreshCw} />
      </div>

      {/* Visual Tambahan: Status Progress WI */}
      <div style={styles.infoSection}>
        <div style={styles.infoBox}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
            <span style={styles.infoLabel}>WI Distribution Rate</span>
            <span style={styles.infoValue}>{completionRate}%</span>
          </div>
          <div style={styles.progressBarBg}>
            <div style={{...styles.progressBarFill, width: `${completionRate}%`}}></div>
          </div>
          <p style={styles.infoSub}>Persentase WI yang sudah terdistribusi dari total revisi.</p>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoLabel}>Quick Summary</h4>
          <div style={{display: 'flex', gap: '20px', marginTop: '15px'}}>
            <div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#1B2559'}}>{ticketList?.length || 0}</div>
              <div style={{fontSize: '12px', color: '#A3AED0'}}>Total Tickets</div>
            </div>
            <div style={{borderLeft: '1px solid #E0E5F2', paddingLeft: '20px'}}>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#1B2559'}}>{revisiList?.length || 0}</div>
              <div style={{fontSize: '12px', color: '#A3AED0'}}>Total History Revisi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '30px' 
  },
  title: { fontSize: '24px', fontWeight: '800', color: '#1B2559', margin: 0 },
  dateBadge: { background: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', color: '#707EAE', fontWeight: 'bold', boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
    gap: '20px',
    marginBottom: '25px'
  },
  infoSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  infoBox: { background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)' },
  infoLabel: { fontSize: '14px', fontWeight: 'bold', color: '#707EAE' },
  infoValue: { fontSize: '18px', fontWeight: '800', color: '#4318FF' },
  infoSub: { fontSize: '12px', color: '#A3AED0', marginTop: '10px' },
  progressBarBg: { width: '100%', height: '8px', background: '#F4F7FE', borderRadius: '10px', overflow: 'hidden' },
  progressBarFill: { height: '100%', background: '#4318FF', borderRadius: '10px', transition: '0.5s ease-in-out' }
};