import React, { useState } from "react"; // Tambahkan useState
import { Plus, Tag, Clock, CheckCircle2, Search, Filter } from "lucide-react";

export default function Findings({ ticketList, onOpenTicket, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState("");

  const statusSteps = [
    { id: 'Open', label: 'Pending' },
    { id: 'Accepted', label: 'Accepted' },
    { id: 'Processing', label: 'WI Drafting' },
    { id: 'Ready', label: 'Ready to Check' },
    { id: 'Closed', label: 'Distributed' }
  ];

  const getStatusIndex = (currentStatus) => statusSteps.findIndex(s => s.id === currentStatus);

  // LOGIKA SEARCH FLEKSIBEL
  const filteredData = ticketList?.filter(t => {
    const isFinding = t.ticket_type?.toLowerCase().includes('finding');
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      t.requester_name?.toLowerCase().includes(searchLower) ||
      t.part_number?.toLowerCase().includes(searchLower) ||
      t.description?.toLowerCase().includes(searchLower);
    
    return isFinding && matchSearch;
  }) || [];

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>FIELD FINDINGS</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Live Tracking System</p>
        </div>
        <button onClick={() => onOpenTicket('Finding')} style={styles.btnCreate}>
          <Plus size={18} /> <span>New Finding</span>
        </button>
      </header>

      {/* --- SEARCH BAR BARU --- */}
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#94A3B8" />
          <input 
            style={styles.searchInput} 
            placeholder="Cari nama, part number, atau deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={styles.badgeCount}>{filteredData.length} Data ditemukan</div>
      </div>

      <div style={styles.container}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={{ padding: '15px' }}>INFO TEMUAN</th>
                <th>PROSES / DESKRIPSI</th>
                <th>LIVE PROGRESS TRACKING</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((t) => {
                const currentIndex = getStatusIndex(t.status);
                return (
                  <tr key={t.id} style={styles.tableRow}>
                    <td style={{ padding: '20px 15px' }}>
                      <div style={{ fontWeight: '700', color: '#1E293B' }}>{new Date(t.created_at).toLocaleDateString('id-ID')}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} /> {t.requester_name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1E293B' }}>{t.part_number}</div>
                      <div style={{ fontSize: '12px', color: '#475569', maxWidth: '250px' }}>{t.description}</div>
                    </td>
                    <td style={{ minWidth: '300px' }}>
                      <div style={styles.stepperContainer}>
                        {statusSteps.map((step, index) => {
                          const isActive = index <= currentIndex;
                          const isCurrent = index === currentIndex;
                          return (
                            <div key={step.id} style={styles.stepWrapper}>
                              {index !== 0 && (
                                <div style={{ ...styles.stepLine, background: isActive ? '#10B981' : '#E2E8F0' }} />
                              )}
                              <div 
                                onClick={() => onUpdateStatus(t.id, step.id)}
                                style={{
                                  ...styles.stepDot,
                                  background: isActive ? '#10B981' : 'white',
                                  borderColor: isActive ? '#10B981' : '#CBD5E1',
                                  boxShadow: isCurrent ? '0 0 10px rgba(16, 185, 129, 0.8)' : 'none',
                                  cursor: 'pointer'
                                }}
                                className={isCurrent && t.status !== 'Closed' ? 'pulse-animation' : ''}
                              >
                                {isActive && <CheckCircle2 size={10} color="white" />}
                              </div>
                              <span style={{ ...styles.stepLabel, color: isCurrent ? '#10B981' : '#94A3B8', fontWeight: isCurrent ? '800' : '500' }}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="3" style={styles.empty}>Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        .pulse-animation { animation: pulse 1.5s infinite ease-in-out; }
      `}</style>
    </div>
  );
}

// TAMBAHKAN STYLE SEARCH
const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 },
  btnCreate: { background: '#10B981', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  searchContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '15px' },
  searchWrapper: { flex: 1, display: 'flex', alignItems: 'center', background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', gap: '10px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent' },
  badgeCount: { fontSize: '12px', color: '#64748B', fontWeight: '600', background: '#F1F5F9', padding: '6px 12px', borderRadius: '20px' },
  container: { background: 'white', borderRadius: '15px', border: '1px solid #F1F5F9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHead: { color: '#64748B', borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', fontSize: '12px' },
  tableRow: { borderBottom: '1px solid #F1F5F9' },
  stepperContainer: { display: 'flex', alignItems: 'center', padding: '10px 0' },
  stepWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  stepDot: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, transition: '0.3s' },
  stepLine: { position: 'absolute', height: '2px', width: '100%', top: '9px', right: '50%', zIndex: 1, transition: '0.3s' },
  stepLabel: { fontSize: '9px', marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap' },
  empty: { textAlign: 'center', padding: '40px', color: '#94A3B8' }
};