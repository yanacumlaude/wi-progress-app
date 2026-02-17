import React, { useState } from "react";
import { Search, Plus, CheckCircle, Clock } from "lucide-react";

export default function LogoProgress({ wiList, onOpenModal, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [fCond, setFCond] = useState("All");
  const [fStatus, setFStatus] = useState("All");

  // --- LOGIKA FILTER ---
  const filteredWI = wiList.filter(w => {
    const matchSearch = (w.part_number?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                        (w.model?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCond = fCond === "All" || w.condition === fCond;
    const matchStatus = fStatus === "All" || w.status_oc === fStatus;
    return matchSearch && matchCond && matchStatus;
  });

  // --- HITUNG PERSENTASE ---
  const totalF = filteredWI.length;
  const pctBagus = totalF > 0 ? ((filteredWI.filter(w => w.condition === 'Bagus').length / totalF) * 100).toFixed(0) : 0;
  const pctClosed = totalF > 0 ? ((filteredWI.filter(w => w.status_oc === 'C').length / totalF) * 100).toFixed(0) : 0;

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>LOGO PROGRESS TRACKER</h1>
          <p style={{color:'#64748B', fontSize: '14px'}}>Manajemen status Master WI</p>
        </div>
        <button onClick={onOpenModal} style={styles.btnAdd}>
          <Plus size={18}/> <span className="hide-mobile">Tambah WI</span>
        </button>
      </header>

      {/* STATS MINI CARD */}
      <div style={styles.chartGrid}>
        <div style={styles.whiteBoxChart}>
          <h4 style={styles.chartTitle}>Kondisi Bagus</h4>
          <p style={{...styles.chartValue, color:'#10B981'}}>{pctBagus}%</p>
        </div>
        <div style={styles.whiteBoxChart}>
          <h4 style={styles.chartTitle}>Status Closed (C)</h4>
          <p style={{...styles.chartValue, color:'#10B981'}}>{pctClosed}%</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={styles.filterBar}>
        <div style={styles.searchBar}>
          <Search size={16} color="#94A3B8" />
          <input 
            placeholder="Cari Part No / Model..." 
            style={styles.inputPlain} 
            onChange={e=>setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <select style={styles.selectFilter} onChange={e=>setFCond(e.target.value)}>
            <option value="All">Semua Kondisi</option>
            <option value="Bagus">Bagus</option>
            <option value="Rusak">Rusak</option>
          </select>
          <select style={styles.selectFilter} onChange={e=>setFStatus(e.target.value)}>
            <option value="All">Semua Status</option>
            <option value="O">Open (O)</option>
            <option value="C">Closed (C)</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.whiteBox}>
        <div style={{overflowX: 'auto'}}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={{padding:'12px'}}>CUSTOMER</th>
                <th>PART NUMBER</th>
                <th>MODEL</th>
                <th>6 SISI</th>
                <th style={{textAlign: 'center'}}>AKSI STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWI.map(w => (
                <tr key={w.id} style={styles.tableRow}>
                  <td style={{padding:'15px 12px'}}>{w.customer || '-'}</td>
                  <td style={{fontWeight:'700', color:'#1E293B'}}>{w.part_number}</td>
                  <td>{w.model || '-'}</td>
                  <td style={{textAlign:'center'}}>{w.is_6_sisi ? '✅' : '❌'}</td>
                  <td style={{textAlign: 'center'}}>
                    <button 
                      onClick={() => onUpdateStatus(w.id, w.status_oc)}
                      style={{
                        ...styles.statusBtn,
                        backgroundColor: w.status_oc === 'O' ? '#FEF2F2' : '#F0FDF4',
                        color: w.status_oc === 'O' ? '#EF4444' : '#10B981',
                        border: `1px solid ${w.status_oc === 'O' ? '#FEE2E2' : '#DCFCE7'}`
                      }}
                    >
                      {w.status_oc === 'O' ? <Clock size={14}/> : <CheckCircle size={14}/>}
                      {w.status_oc === 'O' ? 'Open' : 'Closed'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 },
  btnAdd: { background: '#10B981', color: 'white', padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' },
  whiteBoxChart: { background: 'white', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  chartTitle: { fontSize: '12px', color: '#64748B', fontWeight:'600', margin:0 },
  chartValue: { fontSize: '24px', fontWeight: '800', marginTop: '5px' },
  filterBar: { display: 'flex', justifyContent: 'space-between', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
  searchBar: { display: 'flex', alignItems: 'center', background: 'white', padding: '0 12px', borderRadius: '10px', border: '1px solid #E2E8F0', gap: '8px', flex: 1, minWidth: '200px' },
  inputPlain: { border: 'none', outline: 'none', height: '40px', width: '100%', fontSize: '14px' },
  selectFilter: { padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', background:'white', fontSize: '13px', outline: 'none' },
  whiteBox: { background: 'white', borderRadius: '15px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  tableHead: { color: '#64748B', borderBottom:'1px solid #F1F5F9', backgroundColor: '#F8FAFC' },
  tableRow: { borderBottom:'1px solid #F1F5F9' },
  statusBtn: { 
    display: 'inline-flex', alignItems: 'center', gap: '6px', 
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', 
    fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'
  }
};