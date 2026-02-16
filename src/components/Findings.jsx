import React from "react";
import { AlertTriangle, Clock, CheckCircle, User, Plus } from "lucide-react";

export default function Findings({ ticketList, onOpenTicket }) {
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
        <button onClick={() => onOpenTicket('Finding')} style={styles.btnCreate}>
          <Plus size={18} /> Create Finding
        </button>
      </header>

      <div style={styles.container}>
        {/* ... (Tabel tetap sama seperti sebelumnya) ... */}
        <table style={styles.table}>
            <thead>
                <tr style={styles.tableHead}>
                  <th style={{ padding: '15px' }}>TANGGAL & PELAPOR</th>
                  <th>PROSES / WI</th>
                  <th>DESKRIPSI TEMUAN</th>
                  <th>LOKASI</th>
                  <th>URGENSI</th>
                  <th>STATUS</th>
                </tr>
            </thead>
            <tbody>
              {findingsData.length > 0 ? findingsData.map((t) => (
                <tr key={t.id} style={styles.tableRow}>
                  <td style={{ padding: '20px 15px' }}>
                    <div style={{ fontWeight: '700', color: '#1B2559' }}>{new Date(t.created_at).toLocaleDateString('id-ID')}</div>
                    <div style={{ fontSize: '12px', color: '#A3AED0' }}>{t.requester_name}</div>
                  </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#1B2559' }}>{t.process_name ?? t.wi_process ?? '-'}</div>
                      <div style={{ fontSize: '12px', color: '#A3AED0' }}>{t.part_number}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1B2559' }}>{t.description}</div>
                      <div style={{ fontSize: '13px', color: '#707EAE' }}>{t.model ? `Model: ${t.model}` : ''} {t.mold_number ? ` • Mold: ${t.mold_number}` : ''}</div>
                    </td>
                    <td style={{ padding: '12px' }}>{t.area ?? t.location ?? '-'}</td>
                  <td><div style={styles.priorityBadge(t.priority)}>{t.priority}</div></td>
                  <td><div style={styles.statusBox(t.status)}>{t.status}</div></td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#A3AED0'}}>Belum ada temuan.</td></tr>
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
}

// Tambahkan style btnCreate
const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1B2559', margin: 0 },
  btnCreate: { background: '#EE5D50', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  container: { background: 'white', borderRadius: '20px', padding: '10px', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHead: { color: '#A3AED0', fontSize: '13px', borderBottom: '2px solid #F4F7FE' },
  tableRow: { borderBottom: '1px solid #F4F7FE' },
  statusBox: (status) => ({ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', background: status?.toLowerCase() === 'open' ? '#FFF1F0' : '#E6F9F4', color: status?.toLowerCase() === 'open' ? '#EE5D50' : '#05CD99', width:'fit-content' }),
  priorityBadge: (priority) => ({ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: priority === 'High' ? '#EE5D50' : '#F4F7FE', color: priority === 'High' ? 'white' : '#1B2559', width:'fit-content' })
};