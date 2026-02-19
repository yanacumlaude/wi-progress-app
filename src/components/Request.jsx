import React, { useState } from "react";
import { Plus, User, Search, CheckCircle2, Tag } from "lucide-react";

export default function Request({ ticketList, onOpenTicket, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState("");

  const statusSteps = [
    { id: 'Open', label: 'Pending' },
    { id: 'Accepted', label: 'Accepted' },
    { id: 'Processing', label: 'WI Drafting' },
    { id: 'Ready', label: 'Ready to Check' },
    { id: 'Closed', label: 'Distributed' }
  ];

  const getStatusIndex = (currentStatus) => {
    return statusSteps.findIndex(s => s.id === currentStatus);
  };

  // LOGIKA SEARCH FLEKSIBEL UNTUK REQUEST
  const filteredRequests = ticketList?.filter(t => {
    const isRequest = t.ticket_type?.toLowerCase().includes('request');
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      t.requester_name?.toLowerCase().includes(searchLower) ||
      t.part_number?.toLowerCase().includes(searchLower) ||
      t.description?.toLowerCase().includes(searchLower) ||
      t.model?.toLowerCase().includes(searchLower);
    
    return isRequest && matchSearch;
  }) || [];

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>USER REQUESTS</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Monitoring permintaan WI baru/revisi</p>
        </div>
        <button onClick={() => onOpenTicket('Request')} style={{...styles.btnCreate, background: '#3B82F6'}}>
          <Plus size={18} /> <span>New Request</span>
        </button>
      </header>

      {/* SEARCH BAR REQUEST */}
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#94A3B8" />
          <input 
            style={styles.searchInput} 
            placeholder="Cari pemohon, part number, atau model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{...styles.badgeCount, color: '#3B82F6', background: '#DBEAFE'}}>
          {filteredRequests.length} Permintaan
        </div>
      </div>

      <div style={styles.container}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={{ padding: '15px' }}>PEMOHON</th>
                <th>PART / MODEL</th>
                <th>LIVE TRACKING</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? filteredRequests.map((t) => {
                const currentIndex = getStatusIndex(t.status);

                return (
                  <tr key={t.id} style={styles.tableRow}>
                    <td style={{ padding: '20px 15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={styles.avatar}>{t.requester_name?.charAt(0)}</div>
                        <div>
                           <div style={{ fontWeight: '700', color: '#1E293B' }}>{t.requester_name}</div>
                           <div style={{ fontSize: '11px', color: '#64748B' }}>{new Date(t.created_at).toLocaleDateString('id-ID')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1E293B' }}>{t.part_number}</div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>{t.model || 'No Model'}</div>
                    </td>
                    <td style={{ minWidth: '320px' }}>
                      <div style={styles.stepperContainer}>
                        {statusSteps.map((step, index) => {
                          const isActive = index <= currentIndex;
                          const isCurrent = index === currentIndex;
                          
                          return (
                            <div key={step.id} style={styles.stepWrapper}>
                              {index !== 0 && (
                                <div style={{
                                  ...styles.stepLine,
                                  background: isActive ? '#3B82F6' : '#E2E8F0'
                                }} />
                              )}
                              
                              <div 
                                onClick={() => onUpdateStatus(t.id, step.id)}
                                style={{
                                  ...styles.stepDot,
                                  background: isActive ? '#3B82F6' : 'white',
                                  borderColor: isActive ? '#3B82F6' : '#CBD5E1',
                                  boxShadow: isCurrent ? '0 0 10px rgba(59, 130, 246, 0.8)' : 'none',
                                  cursor: 'pointer'
                                }}
                                className={isCurrent && t.status !== 'Closed' ? 'pulse-blue' : ''}
                              >
                                {isActive && <CheckCircle2 size={10} color="white" />}
                              </div>
                              <span style={{
                                ...styles.stepLabel,
                                color: isCurrent ? '#3B82F6' : '#94A3B8',
                                fontWeight: isCurrent ? '800' : '500'
                              }}>
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
                <tr><td colSpan="3" style={styles.empty}>Permintaan tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes pulse-blue {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .pulse-blue { animation: pulse-blue 2s infinite; }
      `}</style>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 },
  btnCreate: { color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  searchContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '15px' },
  searchWrapper: { flex: 1, display: 'flex', alignItems: 'center', background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', gap: '10px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent' },
  badgeCount: { fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '20px' },
  container: { background: 'white', borderRadius: '15px', border: '1px solid #F1F5F9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHead: { color: '#64748B', borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', fontSize: '12px' },
  tableRow: { borderBottom: '1px solid #F1F5F9' },
  avatar: { width: '32px', height: '32px', background: '#DBEAFE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#1E40AF' },
  stepperContainer: { display: 'flex', alignItems: 'center', padding: '10px 0' },
  stepWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 },
  stepDot: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, transition: '0.3s' },
  stepLine: { position: 'absolute', height: '2px', width: '100%', top: '9px', right: '50%', zIndex: 1, transition: '0.3s' },
  stepLabel: { fontSize: '9px', marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap' },
  empty: { textAlign: 'center', padding: '40px', color: '#94A3B8' }
};