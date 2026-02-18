import React from "react";
import { AlertTriangle, Clock, CheckCircle, MapPin, Tag, Plus } from "lucide-react";

// TAMBAHKAN onUpdateStatus di props
export default function Findings({ ticketList, onOpenTicket, onUpdateStatus }) {
  const findingsData = ticketList?.filter(t => 
    t.ticket_type?.toLowerCase().includes('finding')
  ) || [];

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>FIELD FINDINGS</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Laporan temuan & masalah di area produksi</p>
        </div>
        <button onClick={() => onOpenTicket('Finding')} style={styles.btnCreate}>
          <Plus size={18} /> <span className="hide-mobile">New Finding</span>
        </button>
      </header>

      <div style={styles.container}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={{ padding: '15px' }}>INFO TEMUAN</th>
                <th>PROSES / PART</th>
                <th>URGENSI</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {findingsData.length > 0 ? findingsData.map((t) => (
                <tr key={t.id} style={styles.tableRow}>
                  <td style={{ padding: '20px 15px' }}>
                    <div style={{ fontWeight: '700', color: '#1E293B' }}>{new Date(t.created_at).toLocaleDateString('id-ID')}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} /> {t.requester_name}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#1E293B' }}>{t.process_name || t.wi_process || '-'}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {t.area || t.location || '-'}
                    </div>
                    <div style={{ fontSize: '13px', marginTop: '4px', color: '#475569', fontStyle: 'italic' }}>"{t.description}"</div>
                  </td>
                  <td>
                    <div style={styles.priorityBadge(t.priority)}>
                      {t.priority}
                    </div>
                  </td>
                  <td>
                    {/* MODIFIKASI: Tambahkan onClick dan pointer cursor */}
                    <div 
                      onClick={() => onUpdateStatus(t.id, t.status)}
                      style={{...styles.statusBox(t.status), cursor: 'pointer'}}
                      title="Klik untuk ubah status"
                    >
                      {t.status?.toLowerCase() === 'open' ? <Clock size={14} /> : <CheckCircle size={14} />}
                      {t.status}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={styles.empty}>Belum ada data temuan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 },
  btnCreate: { background: '#10B981', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  container: { background: 'white', borderRadius: '15px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  tableHead: { color: '#64748B', borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' },
  tableRow: { borderBottom: '1px solid #F1F5F9' },
  statusBox: (status) => ({
    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', width: 'fit-content',
    background: status?.toLowerCase() === 'open' ? '#FEF2F2' : '#F0FDF4',
    color: status?.toLowerCase() === 'open' ? '#EF4444' : '#10B981',
    border: `1px solid ${status?.toLowerCase() === 'open' ? '#FEE2E2' : '#DCFCE7'}`,
    transition: '0.2s' // Tambahan biar smooth saat diklik
  }),
  priorityBadge: (priority) => ({
    padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', width: 'fit-content',
    background: priority === 'High' || priority === 'Critical' ? '#EF4444' : '#F1F5F9',
    color: priority === 'High' || priority === 'Critical' ? 'white' : '#475569'
  }),
  empty: { textAlign: 'center', padding: '40px', color: '#94A3B8' }
};