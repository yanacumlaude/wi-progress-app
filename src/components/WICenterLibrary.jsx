import React, { useState } from "react";
import { 
  Search, ExternalLink, Plus, Trash2, 
  ArchiveRestore, Archive, Edit3, 
  CheckCircle2, AlertCircle, Filter, Download 
} from "lucide-react";
import * as XLSX from 'xlsx'; // Import untuk fitur Export

export default function WICenterLibrary({ wiList, role, onEdit, onOpenInputModal, onDelete, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("All");
  const [viewMode, setViewMode] = useState("active");

  // AMBIL LIST CUSTOMER UNIK
  const customers = ["All", ...new Set(wiList.map(item => item.customer))].filter(Boolean);

  // LOGIC STATISTIK
  const stats = {
    totalUse: wiList.filter(wi => !wi.is_archived).length,
    totalObsolete: wiList.filter(wi => wi.is_archived).length
  };

  // FILTERING LOGIC
  const filteredWI = wiList.filter((wi) => {
    const searchString = `${wi.part_number} ${wi.mold_number} ${wi.model} ${wi.customer} ${wi.process_name}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesFilter = selectedCustomer === "All" || wi.customer === selectedCustomer;
    const isArchived = wi.is_archived === true;
    
    return matchesSearch && matchesFilter && (viewMode === "active" ? !isArchived : isArchived);
  });

  // FITUR BARU: EXPORT TO EXCEL
  const handleExportExcel = () => {
    const dataToExport = filteredWI.map(wi => ({
      Customer: wi.customer,
      Process: wi.process_name,
      'Part Number': wi.part_number,
      'Mold Number': wi.mold_number,
      Model: wi.model,
      Revision: wi.revision_no,
      Status: wi.is_archived ? 'OBSOLETE' : 'USE'
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WI_Report");
    XLSX.writeFile(wb, `WI_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  // FITUR BARU: HIGHLIGHT SEARCH TEXT
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <mark key={i} style={{backgroundColor: '#FEF08A', padding: '0 2px'}}>{part}</mark> 
            : part
        )}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      
      {/* 1. STATS SUMMARY CARDS */}
      <div style={styles.statsRow}>
        <div style={{...styles.statCard, borderLeft: '5px solid #10B981'}}>
          <span style={styles.statLabel}>ACTIVE (USE)</span>
          <span style={styles.statValue}>{stats.totalUse} <span style={{fontSize: '12px', fontWeight: 'normal'}}>WI</span></span>
        </div>
        <div style={{...styles.statCard, borderLeft: '5px solid #EF4444'}}>
          <span style={styles.statLabel}>OBSOLETE</span>
          <span style={styles.statValue}>{stats.totalObsolete} <span style={{fontSize: '12px', fontWeight: 'normal'}}>WI</span></span>
        </div>
      </div>

      {/* 2. HEADER & FILTERS */}
      <div style={styles.header}>
        <div style={styles.actionWrapper}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#94A3B8" />
            <input 
              style={styles.searchInput}
              placeholder="Cari Mold / Part / Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={styles.filterWrapper}>
            <Filter size={18} color="#94A3B8" />
            <select 
              style={styles.selectInput}
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              {customers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* FITUR BARU: BUTTON EXCEL */}
          <button onClick={handleExportExcel} style={styles.btnExcel}>
            <Download size={18} /> Export Excel
          </button>

          {role === 'admin' && (
            <button 
              onClick={() => setViewMode(viewMode === "active" ? "archived" : "active")}
              style={{...styles.btnAction, background: viewMode === "active" ? '#64748B' : '#F59E0B'}}
            >
              {viewMode === "active" ? <Archive size={18} /> : <ArchiveRestore size={18} />}
              {viewMode === "active" ? "Archive Mode" : "Library"}
            </button>
          )}
        </div>
        
        {role === 'admin' && viewMode === "active" && (
          <button onClick={onOpenInputModal} style={styles.btnAdd}>
            <Plus size={18} /> New WI
          </button>
        )}
      </div>

      {/* 3. DATA TABLE */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>CUSTOMER</th>
              <th style={styles.th}>PROCESS</th>
              <th style={styles.th}>PART NUMBER</th>
              <th style={styles.th}>MOLD NO</th>
              <th style={styles.th}>MODEL</th>
              <th style={styles.th}>REV</th>
              <th style={styles.th}>STATUS</th>
              <th style={{...styles.th, textAlign: 'center'}}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredWI.length > 0 ? filteredWI.map((wi) => (
              <tr key={wi.id} style={styles.tr} className="table-row-hover">
                <td style={styles.td}><span style={styles.customerBadge}>{highlightText(wi.customer, searchTerm)}</span></td>
                <td style={styles.td}>{highlightText(wi.process_name, searchTerm)}</td>
                <td style={{...styles.td, fontWeight: '800'}}>{highlightText(wi.part_number, searchTerm)}</td>
                <td style={styles.td}>{highlightText(wi.mold_number, searchTerm) || '-'}</td>
                <td style={styles.td}>{highlightText(wi.model, searchTerm) || '-'}</td>
                <td style={{...styles.td, textAlign: 'center'}}>{wi.revision_no}</td>
                <td style={styles.td}>
                  <button 
                    onClick={() => role === 'admin' && onEdit({...wi, is_archived: !wi.is_archived})} 
                    style={{...styles.statusBtn, cursor: role === 'admin' ? 'pointer' : 'default'}}
                  >
                    {wi.is_archived ? (
                      <span style={styles.statusObsolete}><AlertCircle size={14}/> OBSOLETE</span>
                    ) : (
                      <span style={styles.statusUse}><CheckCircle2 size={14}/> USE</span>
                    )}
                  </button>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionGroup}>
                    <a href={wi.file_url} target="_blank" rel="noreferrer" style={styles.iconBtnOpen}><ExternalLink size={16} /></a>
                    {role === 'admin' && (
                      <>
                        <button onClick={() => onEdit(wi)} style={styles.iconBtnEdit}><Edit3 size={16} /></button>
                        <button onClick={() => onDelete(wi.id)} style={styles.iconBtnDelete}><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" style={styles.emptyCell}>Data tidak ditemukan...</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .table-row-hover:hover {
          background-color: #F8FAFC !important;
          transition: background 0.2s ease;
        }
      `}</style>
    </div>
  );
}

const styles = {
  // ... (Gunakan style mase yang lama, saya hanya tambah yang baru di bawah)
  container: { padding: '5px' },
  statsRow: { display: 'flex', gap: '15px', marginBottom: '20px' },
  statCard: { flex: 1, background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: '11px', color: '#64748B', fontWeight: 'bold' },
  statValue: { fontSize: '24px', fontWeight: '900', color: '#1E293B' },
  header: { marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  actionWrapper: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  searchWrapper: { display: 'flex', alignItems: 'center', background: 'white', padding: '0 10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '250px' },
  filterWrapper: { display: 'flex', alignItems: 'center', background: 'white', padding: '0 10px', borderRadius: '8px', border: '1px solid #E2E8F0' },
  searchInput: { border: 'none', outline: 'none', padding: '10px', fontSize: '13px', width: '100%' },
  selectInput: { border: 'none', outline: 'none', padding: '10px', fontSize: '13px', color: '#475569', background: 'transparent' },
  
  btnExcel: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#475569', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  btnAction: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  btnAdd: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },

  tableContainer: { overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  theadRow: { background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' },
  th: { padding: '12px 15px', fontSize: '11px', color: '#64748B', textAlign: 'left', fontWeight: 'bold' },
  tr: { borderBottom: '1px solid #F1F5F9' },
  td: { padding: '12px 15px', fontSize: '13px', color: '#334155' },

  customerBadge: { background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold' },
  statusBtn: { border: 'none', background: 'none', padding: 0 },
  statusUse: { color: '#059669', background: '#DCFCE7', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' },
  statusObsolete: { color: '#DC2626', background: '#FEE2E2', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' },

  actionGroup: { display: 'flex', gap: '5px' },
  iconBtnOpen: { padding: '8px', background: '#F1F5F9', borderRadius: '8px', color: '#475569', display: 'flex', alignItems: 'center' },
  iconBtnEdit: { padding: '8px', background: '#EFF6FF', borderRadius: '8px', color: '#2563EB', border: 'none', cursor: 'pointer' },
  iconBtnDelete: { padding: '8px', background: '#FEF2F2', borderRadius: '8px', color: '#DC2626', border: 'none', cursor: 'pointer' },
  emptyCell: { textAlign: 'center', padding: '40px', color: '#94A3B8' }
};