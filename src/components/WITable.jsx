import React from "react";
import { Edit3, ExternalLink, FileText, MapPin, History } from "lucide-react";

export default function WITable({ wiList, onEdit }) {
  return (
    <div style={styles.container}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Part Number / Model</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Proses</th>
              <th style={styles.th}>No. Rev</th>
              <th style={styles.th}>Lokasi</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {wiList.length > 0 ? (
              wiList.map((wi) => (
                <tr key={wi.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "bold", color: "#1E293B" }}>{wi.part_number}</div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Model: {wi.model || "-"}</div>
                  </td>
                  <td style={styles.td}>{wi.customer}</td>
                  <td style={styles.td}>
                    <span style={styles.badgeProses}>{wi.process_name}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <History size={14} color="#64748B" /> {wi.revision_no || "00"}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} color="#64748B" /> {wi.location || "-"}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => onEdit(wi)} 
                        style={styles.btnEdit}
                        title="Edit Data"
                      >
                        <Edit3 size={16} />
                      </button>
                      <a 
                        href={wi.file_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={styles.btnView}
                        title="Lihat PDF"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                  Belum ada data WI Master.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { background: "white", borderRadius: "15px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", overflow: "hidden" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" },
  th: { padding: "15px", background: "#F8FAFC", color: "#64748B", fontWeight: "600", borderBottom: "1px solid #E2E8F0" },
  td: { padding: "15px", borderBottom: "1px solid #F1F5F9", verticalAlign: "middle" },
  tr: { transition: "0.2s" },
  badgeProses: { background: "#E0F2FE", color: "#0369A1", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" },
  btnEdit: { 
    display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", 
    borderRadius: "8px", border: "1px solid #3B82F6", color: "#3B82F6", 
    background: "transparent", cursor: "pointer", transition: "0.2s" 
  },
  btnView: { 
    display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", 
    borderRadius: "8px", background: "#10B981", color: "white", 
    textDecoration: "none", transition: "0.2s" 
  }
};