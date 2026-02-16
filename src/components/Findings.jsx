import React from "react";
import { AlertTriangle, Clock, CheckCircle, User } from "lucide-react";

export default function Findings({ ticketList }) {
  // Memastikan filter mencari tipe 'finding' (case-insensitive)
  const findingsData = ticketList?.filter(t => 
    t.ticket_type?.toLowerCase().includes('finding')
  ) || [];

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>FIELD FINDINGS</h1>
          <p style={{ color: '#707EAE' }}>Monitoring temuan lapangan dan status perbaikan</p>
        </div>
        <div style={styles.badgeCount}>{findingsData.length} Tiket Aktif</div>
      </header>

      <div style={styles.container}>
        {findingsData.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={{ padding: '15px' }}>TANGGAL & PELAPOR</th>
                <th>DESKRIPSI TEMUAN</th>
                <th>URGENSI</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {findingsData.map((t) => (
                <tr key={t.id} style={styles.tableRow}>
                  <td style={{ padding: '20px 15px' }}>
                    <div style={{ fontWeight: '700', color: '#1B2559' }}>
                      {new Date(t.created_at).toLocaleDateString('id-ID')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#A3AED0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <User size={12} /> {t.requester_name || 'Anonim'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#1B2559' }}>{t.part_number || 'General'}</div>
                    <div style={{ fontSize: '13px', color: '#707EAE' }}>{t.description}</div>
                  </td>
                  <td>
                    <div style={styles.priorityBadge(t.priority)}>
                      {t.priority || 'Normal'}
                    </div>
                  </td>
                  <td>
                    <div style={styles.statusBox(t.status)}>
                      {t.status?.toLowerCase() === 'open' ? <Clock size={14} /> : <CheckCircle size={14} />}
                      {t.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            <AlertTriangle size={48} color="#A3AED0" />
            <p style={{ marginTop: '15px', fontWeight: '600', color: '#A3AED0' }}>Belum ada data temuan lapangan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1B2559', margin: 0 },
  badgeCount: { background: '#EE5D50', color: 'white', padding: '6px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' },
  container: { background: 'white', borderRadius: '20px', padding: '10px', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHead: { color: '#A3AED0', fontSize: '13px', borderBottom: '2px solid #F4F7FE' },
  tableRow: { borderBottom: '1px solid #F4F7FE', transition: '0.2s hover' },
  statusBox: (status) => ({
    display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content',
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
    background: status?.toLowerCase() === 'open' ? '#FFF1F0' : '#E6F9F4',
    color: status?.toLowerCase() === 'open' ? '#EE5D50' : '#05CD99'
  }),
  priorityBadge: (priority) => ({
    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', width: 'fit-content',
    background: priority === 'High' ? '#EE5D50' : '#F4F7FE',
    color: priority === 'High' ? 'white' : '#1B2559'
  }),
  emptyState: { padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }
};