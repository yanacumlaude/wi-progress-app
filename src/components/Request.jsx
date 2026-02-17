import React from "react";
import { MessageSquare, Plus, User, ArrowRight } from "lucide-react";

export default function Request({ ticketList, onOpenTicket }) {
  const requestsData = ticketList?.filter(t => t.ticket_type?.toLowerCase().includes('request')) || [];

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>USER REQUESTS</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Total {requestsData.length} permintaan pembuatan/revisi WI</p>
        </div>
        <button onClick={() => onOpenTicket && onOpenTicket('Request')} style={styles.btnCreate}>
          <Plus size={18} /> <span className="hide-mobile">New Request</span>
        </button>
      </header>

      <div style={styles.whiteBox}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={{ padding: '12px' }}>TANGGAL</th>
                <th>PEMOHON</th>
                <th>PROSES / PART NO</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {requestsData.length > 0 ? requestsData.map(t => (
                <tr key={t.id} style={styles.tableRow}>
                  <td style={{ padding: '15px 12px' }}>{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={styles.avatar}>{t.requester_name?.charAt(0)}</div>
                      <span style={{ fontWeight: '600' }}>{t.requester_name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#1E293B' }}>{t.part_number}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{t.process_name || t.wi_process || '-'}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '11px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: t.status === 'Open' ? '#FFFBEB' : '#F0FDF4',
                      color: t.status === 'Open' ? '#B45309' : '#10B981',
                      border: `1px solid ${t.status === 'Open' ? '#FEF3C7' : '#DCFCE7'}`
                    }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              )) : <tr><td colSpan="4" style={styles.empty}>Data Requests Kosong</td></tr>}
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
  whiteBox: { background: 'white', borderRadius: '15px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  tableHead: { color: '#64748B', borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' },
  tableRow: { borderBottom: '1px solid #F1F5F9' },
  avatar: { width: '24px', height: '24px', background: '#E2E8F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#64748B' },
  empty: { textAlign: 'center', padding: '30px', color: '#94A3B8' }
};