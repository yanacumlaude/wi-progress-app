import React from "react";

export default function Revisi({ revisiList }) {
  // Objek styles lokal agar tampilan tetap konsisten
  const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    title: { fontSize: '24px', fontWeight: '800', color: '#1B2559', margin: 0 },
    whiteBox: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
    statusBadge: (isDone) => ({
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: 'bold',
      background: isDone ? '#E6F9F4' : '#FFF8E6',
      color: isDone ? '#05CD99' : '#FFB800',
      display: 'inline-block'
    })
  };

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>KONTROL REVISI WI</h1>
          <p style={{ color: '#707EAE' }}>Monitoring distribusi revisi dokumen</p>
        </div>
      </header>

      <div style={styles.whiteBox}>
        <table style={styles.table}>
          <thead>
            <tr style={{ color: '#A3AED0', borderBottom: '2px solid #F4F7FE' }}>
              <th style={{ padding: '12px' }}>TGL REVISI</th>
              <th>PART NAME / NO</th>
              <th>DEPARTEMEN</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {revisiList && revisiList.length > 0 ? (
              revisiList.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F4F7FE' }}>
                  <td style={{ padding: '15px 0' }}>{r.tgl_revisi}</td>
                  <td style={{ fontWeight: '700', color: '#1B2559' }}>{r.part_name}</td>
                  <td>{r.departemen}</td>
                  <td>
                    <div style={styles.statusBadge(!!r.tgl_distribusi)}>
                      {r.tgl_distribusi ? `✅ Selesai (${r.tgl_distribusi})` : '⏳ Sedang Proses'}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#A3AED0' }}>
                  Belum ada data revisi yang tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}