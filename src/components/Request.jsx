import React from "react";
import { MessageSquare } from "lucide-react";

export default function Request({ ticketList }) {
  const requestsData = ticketList?.filter(t => t.ticket_type?.toLowerCase().includes('request')) || [];

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <h1 style={styles.title}>USER REQUESTS</h1>
        <p style={{color:'#707EAE'}}>Total {requestsData.length} permintaan</p>
      </header>
      <div style={styles.whiteBox}>
        <table style={styles.table}>
          <thead>
            <tr style={{color:'#A3AED0', borderBottom:'2px solid #F4F7FE'}}>
              <th style={{padding:'12px'}}>TANGGAL</th><th>PELAPOR</th><th>PART NUMBER</th><th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {requestsData.length > 0 ? requestsData.map(t => (
              <tr key={t.id} style={{borderBottom:'1px solid #F4F7FE'}}>
                <td style={{padding:'15px 0'}}>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>{t.requester_name}</td>
                <td>{t.part_number}</td>
                <td><span style={{ fontWeight:'bold', color: t.status === 'Open' ? '#FFB800' : '#05CD99'}}>{t.status}</span></td>
              </tr>
            )) : <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>Data Requests Kosong</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '25px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1B2559' },
  whiteBox: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }
};