import React, { useState } from "react";
import { Search, Clock, User, FileText, Calendar, Filter, Activity } from "lucide-react";

export default function ActivityLog({ logs }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtering Log berdasarkan User, Aksi, atau Item Terkait
  const filteredLogs = logs.filter((log) => {
    const searchString = `${log.user_name} ${log.action} ${log.target_item} ${log.details}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={styles.container}>
      {/* HEADER LOG */}
      <div style={styles.logHeader}>
        <div style={styles.titleWrapper}>
          <div style={styles.iconCircle}>
            <Activity size={24} color="#10B981" />
          </div>
          <div>
            <h2 style={styles.title}>System Activity Logs</h2>
            <p style={styles.subtitle}>Riwayat aktivitas seluruh divisi di WI HUB</p>
          </div>
        </div>

        <div style={styles.searchBox}>
          <Search size={18} color="#94A3B8" />
          <input 
            style={styles.searchInput}
            placeholder="Cari user, part number, atau aksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE LOG */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>WAKTU & TANGGAL</th>
              <th style={styles.th}>USER / DIVISI</th>
              <th style={styles.th}>AKSI</th>
              <th style={styles.th}>ITEM TERKAIT</th>
              <th style={styles.th}>REMARK / DETAIL</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
              <tr key={index} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.dateTime}>
                    <span style={styles.dateText}>
                      {new Date(log.created_at).toLocaleDateString('id-ID', { 
                        day: '2-digit', month: 'short', year: 'numeric' 
                      })}
                    </span>
                    <span style={styles.timeText}>
                      <Clock size={12} /> {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.userBadge}>
                    <User size={12} /> {log.user_name?.toUpperCase() || "UNKNOWN"}
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={getActionBadgeStyle(log.action)}>{log.action}</span>
                </td>
                <td style={{...styles.td, fontWeight: '800', color: '#1E293B'}}>
                  {log.target_item}
                </td>
                <td style={{...styles.td, color: '#64748B', fontSize: '12px', fontStyle: 'italic'}}>
                  {log.details || "-"}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={styles.empty}>Log tidak ditemukan...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper untuk warna label aksi
const getActionBadgeStyle = (action) => {
  const base = { padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block' };
  const act = action?.toUpperCase();
  
  if (act === 'CREATE' || act?.includes('INPUT')) return { ...base, background: '#DCFCE7', color: '#10B981' };
  if (act === 'DELETE' || act?.includes('HAPUS')) return { ...base, background: '#FEE2E2', color: '#EF4444' };
  if (act === 'UPDATE' || act?.includes('EDIT')) return { ...base, background: '#DBEAFE', color: '#3B82F6' };
  if (act === 'LOGIN') return { ...base, background: '#F1F5F9', color: '#64748B' };
  return { ...base, background: '#FEF9C3', color: '#A16207' };
};

const styles = {
  container: { background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' },
  logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  titleWrapper: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconCircle: { background: '#ECFDF5', padding: '12px', borderRadius: '15px' },
  title: { fontSize: '20px', fontWeight: '900', color: '#1E293B', margin: 0 },
  subtitle: { fontSize: '12px', color: '#94A3B8', margin: 0 },
  searchBox: { display: 'flex', alignItems: 'center', background: '#F8FAFC', padding: '0 15px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '350px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', padding: '12px', fontSize: '14px', width: '100%' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { textAlign: 'left', borderBottom: '2px solid #F1F5F9' },
  th: { padding: '15px 12px', fontSize: '11px', color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #F8FAFC', transition: '0.2s' },
  td: { padding: '15px 12px', fontSize: '14px', verticalAlign: 'middle' },
  dateTime: { display: 'flex', flexDirection: 'column', gap: '2px' },
  dateText: { fontWeight: 'bold', color: '#334155' },
  timeText: { fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' },
  userBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#475569', border: '1px solid #E2E8F0' },
  empty: { textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }
};