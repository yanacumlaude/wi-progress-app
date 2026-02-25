import React, { useState } from "react";
import { 
  Search, ExternalLink, X, Layers, 
  MapPin, History, Info, Edit3, Plus,
  Trash2, ArchiveRestore, Archive, Printer
} from "lucide-react";

export default function WICenterLibrary({ wiList, role, onEdit, onOpenInputModal, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("active"); // "active" atau "archived"

  // Filter Data: Berdasarkan Search + Status Arsip
  const filteredWI = wiList.filter((wi) => {
    const matchesSearch = 
      wi.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wi.mold_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wi.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wi.process_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isArchived = wi.is_archived === true;
    return matchesSearch && (viewMode === "active" ? !isArchived : isArchived);
  });

  return (
    <div style={styles.container}>
      <div style={styles.header} className="no-print">
        <div>
          <h1 style={styles.title}>
            {viewMode === "active" ? "WI MASTER LIBRARY" : "WI ARCHIVED DATA"}
          </h1>
          <p style={styles.subtitle}>
            {viewMode === "active" ? "Cari dan akses instruksi kerja digital" : "Daftar data yang sedang diarsipkan"}
          </p>
        </div>
        
        <div style={styles.actionWrapper}>
          {/* SECURITY: Hanya Admin yang boleh ganti view ke Arsip */}
          {role === 'admin' && (
            <button 
              onClick={() => setViewMode(viewMode === "active" ? "archived" : "active")}
              style={{...styles.btnAction, background: viewMode === "active" ? '#64748B' : '#F59E0B'}}
            >
              {viewMode === "active" ? <Archive size={18} /> : <ArchiveRestore size={18} />}
              {viewMode === "active" ? "Lihat Arsip" : "Kembali ke Library"}
            </button>
          )}

          {role === 'admin' && viewMode === "active" && (
            <button onClick={onOpenInputModal} style={{...styles.btnAction, background: '#10B981'}}>
              <Plus size={20} /> Input WI Baru
            </button>
          )}

          <div style={styles.searchWrapper}>
            <Search size={20} color="#94A3B8" />
            <input
              style={styles.searchInput}
              placeholder="Cari Part / Mold / Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={styles.grid} className="no-print">
        {filteredWI.length > 0 ? filteredWI.map((wi) => (
          <div key={wi.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.processBadge}><Layers size={14} /> {wi.process_name}</div>
              <span style={styles.customerTag}>{wi.customer}</span>
            </div>

            <h3 style={styles.partNumber}>{wi.part_number}</h3>

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Mold No:</span>
                <span style={styles.detailValue}>{wi.mold_number || '-'}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Model:</span>
                <span style={styles.detailValue}>{wi.model || '-'}</span>
              </div>
            </div>

            <div style={styles.extraInfoGrid}>
              <div style={styles.extraItem}><History size={12}/> Rev: {wi.revision_no || "00"}</div>
              <div style={styles.extraItem}><MapPin size={12}/> {wi.location || "Produksi"}</div>
            </div>

            <div style={styles.remarkBox}>
              <Info size={12} color="#64748B"/> 
              <span style={styles.remarkText}>{wi.remarks || "No remarks."}</span>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.cardActions}>
              <a href={wi.file_url} target="_blank" rel="noreferrer" style={styles.btnOpen}>
                <ExternalLink size={16} /> Buka PDF
              </a>
              {role === 'admin' && (
                <>
                  <button onClick={() => onEdit(wi)} style={styles.btnEdit}>
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => onDelete(wi.id)} style={styles.btnDelete}>
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        )) : (
          <div style={styles.emptyState}>
            Data tidak ditemukan di folder {viewMode === "active" ? "Aktif" : "Arsip"}.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', backgroundColor: '#F8FAFC', minHeight: '100vh' },
  header: { marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
  title: { fontSize: '24px', fontWeight: '900', color: '#0F172A', margin: 0 },
  subtitle: { color: '#64748B', fontSize: '13px' },
  actionWrapper: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  btnAction: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  searchWrapper: { display: 'flex', alignItems: 'center', background: 'white', padding: '0 15px', borderRadius: '10px', border: '1px solid #E2E8F0', width: '250px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', padding: '10px', fontSize: '13px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '15px' },
  card: { background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  processBadge: { background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' },
  customerTag: { color: '#166534', fontSize: '10px', fontWeight: 'bold' },
  partNumber: { fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: '10px 0' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  detailLabel: { fontSize: '10px', color: '#94A3B8', fontWeight: 'bold', display: 'block' },
  detailValue: { fontSize: '13px', fontWeight: '700', color: '#334155' },
  extraInfoGrid: { display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap' },
  extraItem: { fontSize: '10px', color: '#64748B', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
  remarkBox: { marginTop: '12px', padding: '10px', background: '#F9FAFB', borderRadius: '8px', display: 'flex', gap: '6px', minHeight: '40px' },
  remarkText: { fontSize: '11px', color: '#64748B', lineHeight: '1.4' },
  divider: { height: '1px', background: '#F1F5F9', margin: '15px 0' },
  cardActions: { display: 'flex', gap: '8px' },
  btnOpen: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', background: '#10B981', color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' },
  btnEdit: { width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '10px', background: 'white', border: '1px solid #3B82F6', color: '#3B82F6', cursor: 'pointer' },
  btnDelete: { width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '10px', background: 'white', border: '1px solid #EF4444', color: '#EF4444', cursor: 'pointer' },
  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#64748B', background: 'white', borderRadius: '16px' }
};