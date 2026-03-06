import React, { useState, useMemo } from "react";
import { 
  Search, ExternalLink, Plus, Trash2, 
  ArchiveRestore, Archive, Edit3, 
  CheckCircle2, AlertCircle, Filter, Download, HardDrive, Eye, Circle, UserCheck
} from "lucide-react";
import * as XLSX from 'xlsx';

export default function WICenterLibrary({ wiList, role, onEdit, onOpenInputModal, onDelete, storageUsage, onPreview }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("All");
  const [viewMode, setViewMode] = useState("active");

  const customers = useMemo(() => ["All", ...new Set(wiList.map(item => item.customer))].filter(Boolean), [wiList]);

  const stats = useMemo(() => ({
    totalUse: wiList.filter(wi => !wi.is_archived).length,
    totalObsolete: wiList.filter(wi => wi.is_archived).length
  }), [wiList]);

  const storageLimit = 1000; 
  const storagePercent = Math.min((storageUsage / storageLimit) * 100, 100);

  const filteredWI = useMemo(() => {
    return wiList.filter((wi) => {
      const searchString = `${wi.part_number} ${wi.mold_number} ${wi.model} ${wi.customer} ${wi.process_name} ${wi.remarks || ""} ${wi.verified_by_eng || ""} ${wi.verified_by_qc || ""} ${wi.verified_by_prod || ""}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      const matchesFilter = selectedCustomer === "All" || wi.customer === selectedCustomer;
      const isArchived = !!wi.is_archived;
      
      return matchesSearch && matchesFilter && (viewMode === "active" ? !isArchived : isArchived);
    });
  }, [wiList, searchTerm, selectedCustomer, viewMode]);

  const handleExportExcel = () => {
    const dataToExport = filteredWI.map(wi => ({
      Customer: wi.customer,
      Process: wi.process_name,
      'Part Number': wi.part_number,
      'Mold Number': wi.mold_number,
      Model: wi.model,
      Remarks: wi.remarks,
      Revision: wi.revision_no,
      Status: wi.is_archived ? 'OBSOLETE' : 'USE',
      'Verified Eng': wi.is_verified_eng ? `YES (${wi.verified_by_eng || '-'})` : 'NO',
      'Verified QA/QC': wi.is_verified_qc ? `YES (${wi.verified_by_qc || '-'})` : 'NO',
      'Verified Prod': wi.is_verified_prod ? `YES (${wi.verified_by_prod || '-'})` : 'NO'
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WI_Report");
    XLSX.writeFile(wb, `WI_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <mark key={i} style={styles.highlight}>{part}</mark> 
            : part
        )}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      {/* JUDUL HALAMAN (Menggantikan Navbar yang dihapus) */}
      <div style={{marginBottom: '20px'}}>
        <h2 style={{margin: 0, color: '#1E293B', fontWeight: '900'}}>Work Instruction Library</h2>
        <p style={{margin: 0, fontSize: '12px', color: '#64748B'}}>Kelola dan pantau dokumen instruksi kerja secara real-time.</p>
      </div>

      {/* STATS ROW */}
      <div style={styles.statsRow}>
        <div style={{...styles.statCard, borderLeft: '5px solid #10B981'}}>
          <span style={styles.statLabel}>ACTIVE (USE)</span>
          <span style={styles.statValue}>{stats.totalUse} <span style={styles.statUnit}>WI</span></span>
        </div>
        <div style={{...styles.statCard, borderLeft: '5px solid #EF4444'}}>
          <span style={styles.statLabel}>OBSOLETE</span>
          <span style={styles.statValue}>{stats.totalObsolete} <span style={styles.statUnit}>WI</span></span>
        </div>
        
        <div style={{...styles.statCard, borderLeft: '5px solid #3B82F6', minWidth: '250px'}}>
          <div style={styles.storageHeader}>
              <span style={styles.statLabel}>STORAGE CAPACITY</span>
              <HardDrive size={14} color="#3B82F6" />
          </div>
          <span style={styles.statValue}>{storageUsage} <span style={styles.statUnit}>MB / {storageLimit}MB</span></span>
          <div style={styles.progressContainer}>
              <div style={{...styles.progressBar, width: `${storagePercent}%`, background: storagePercent > 80 ? '#EF4444' : '#3B82F6'}} />
          </div>
        </div>
      </div>

      {/* HEADER & FILTERS */}
      <div style={styles.header}>
        <div style={styles.actionWrapper}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#94A3B8" />
            <input 
              style={styles.searchInput}
              placeholder="Cari Mold / Part / Verifikator..."
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

      {/* DATA TABLE */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>CUSTOMER</th>
              <th style={styles.th}>PROCESS</th>
              <th style={styles.th}>PART NUMBER / TRIPLE CHECK</th>
              <th style={styles.th}>MOLD NO</th>
              <th style={styles.th}>MODEL</th>
              <th style={styles.th}>REMARKS</th>
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
                <td style={styles.td}>
                  <div style={styles.partNumberText}>{highlightText(wi.part_number, searchTerm)}</div>
                  <div style={styles.verifContainer}>
                    {['eng', 'qc', 'prod'].map(dept => {
                      const isVerif = wi[`is_verified_${dept}`];
                      const verifierName = wi[`verified_by_${dept}`];
                      const label = dept === 'qc' ? 'QA/QC' : dept.toUpperCase();
                      return (
                        <div key={dept} style={styles.verifItem}>
                          <div style={{...styles.verifBadge, 
                                     color: isVerif ? '#059669' : '#94A3B8',
                                     background: isVerif ? '#ECFDF5' : '#F8FAFC',
                                     borderColor: isVerif ? '#10B981' : '#E2E8F0'}} 
                               title={`${label} ${isVerif ? 'Verified' : 'Pending'}`}>
                            {isVerif ? <CheckCircle2 size={10} strokeWidth={3} /> : <Circle size={10} strokeWidth={3} />}
                            {label}
                          </div>
                          {isVerif && verifierName && (
                            <span style={styles.verifierName}>{highlightText(verifierName, searchTerm)}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </td>
                <td style={{...styles.td, fontWeight: '600'}}>{highlightText(wi.mold_number, searchTerm) || '-'}</td>
                <td style={styles.td}>{highlightText(wi.model, searchTerm) || '-'}</td>
                <td style={styles.td}>
                  <div style={styles.remarksText} title={wi.remarks || "No remarks"}>
                    {highlightText(wi.remarks, searchTerm) || '-'}
                  </div>
                </td>
                <td style={{...styles.td, textAlign: 'center', fontWeight: 'bold'}}><div style={styles.revBadge}>{wi.revision_no}</div></td>
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
                    <button onClick={() => onPreview(wi.file_url)} style={styles.iconBtnPreview} title="Quick Preview"><Eye size={16} /></button>
                    <button onClick={() => window.open(wi.file_url, '_blank')} style={styles.iconBtnOpen} title="Open in New Tab"><ExternalLink size={16} /></button>
                    {role === 'admin' && (
                      <>
                        <button onClick={() => onEdit(wi)} style={styles.iconBtnEdit} title="Edit Data"><Edit3 size={16} /></button>
                        <button onClick={() => onDelete(wi.id, wi.file_url)} style={styles.iconBtnDelete} title="Delete Forever"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="9" style={styles.emptyCell}>Data tidak ditemukan...</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`.table-row-hover:hover { background-color: #F8FAFC !important; transition: background 0.2s ease; }`}</style>
    </div>
  );
}

// Styles tetap sama namun bagian TopNavbar dan UserSection bisa dihapus dari objek styles ini jika ingin merapikan kode.
const styles = {
  container: { padding: '5px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  statsRow: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
  statCard: { flex: 1, background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', minWidth: '180px' },
  statLabel: { fontSize: '11px', color: '#64748B', fontWeight: 'bold' },
  statValue: { fontSize: '24px', fontWeight: '900', color: '#1E293B' },
  statUnit: { fontSize: '12px', fontWeight: 'normal' },
  storageHeader: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  progressContainer: { width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' },
  progressBar: { height: '100%', transition: 'width 0.5s ease-in-out' },
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
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '1100px' },
  theadRow: { background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' },
  th: { padding: '12px 15px', fontSize: '11px', color: '#64748B', textAlign: 'left', fontWeight: 'bold' },
  tr: { borderBottom: '1px solid #F1F5F9' },
  td: { padding: '12px 15px', fontSize: '13px', color: '#334155' },
  partNumberText: { fontWeight: '800', marginBottom: '8px', color: '#1E293B', letterSpacing: '0.3px', fontSize: '14px' },
  verifContainer: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  verifItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  verifierName: { fontSize: '9px', color: '#64748B', fontWeight: '600', paddingLeft: '4px' },
  revBadge: { background: '#F1F5F9', borderRadius: '6px', padding: '2px 0' },
  highlight: { backgroundColor: '#FEF08A', padding: '0 2px', borderRadius: '2px' },
  remarksText: { maxWidth: '150px', fontSize: '11px', color: '#64748B', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  verifBadge: { display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px', border: '1px solid', transition: 'all 0.2s ease' },
  customerBadge: { background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold' },
  statusBtn: { border: 'none', background: 'none', padding: 0 },
  statusUse: { color: '#059669', background: '#DCFCE7', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' },
  statusObsolete: { color: '#DC2626', background: '#FEE2E2', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' },
  actionGroup: { display: 'flex', gap: '5px' },
  iconBtnPreview: { padding: '8px', background: '#F0F9FF', borderRadius: '8px', color: '#0EA5E9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  iconBtnOpen: { padding: '8px', background: '#F1F5F9', borderRadius: '8px', color: '#475569', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  iconBtnEdit: { padding: '8px', background: '#EFF6FF', borderRadius: '8px', color: '#2563EB', border: 'none', cursor: 'pointer' },
  iconBtnDelete: { padding: '8px', background: '#FEF2F2', borderRadius: '8px', color: '#DC2626', border: 'none', cursor: 'pointer' },
  emptyCell: { textAlign: 'center', padding: '40px', color: '#94A3B8' }
};