import React, { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";

export default function LogoProgress({ wiList, onOpenModal }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [fCond, setFCond] = useState("All");
  const [fStatus, setFStatus] = useState("All");
  const [f6Sisi, setF6Sisi] = useState("All");

  // --- LOGIKA FILTER ---
  const filteredWI = wiList.filter(w => {
    const matchSearch = (w.part_number?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                        (w.model?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCond = fCond === "All" || w.condition === fCond;
    const matchStatus = fStatus === "All" || w.status_oc === fStatus;
    const match6Sisi = f6Sisi === "All" || (f6Sisi === "Sudah" ? w.is_6_sisi === true : w.is_6_sisi === false);
    return matchSearch && matchCond && matchStatus && match6Sisi;
  });

  // --- HITUNG PERSENTASE ---
  const totalF = filteredWI.length;
  const pctBagus = totalF > 0 ? ((filteredWI.filter(w => w.condition === 'Bagus').length / totalF) * 100).toFixed(0) : 0;
  const pctClosed = totalF > 0 ? ((filteredWI.filter(w => w.status_oc === 'C').length / totalF) * 100).toFixed(0) : 0;
  const pct6Sisi = totalF > 0 ? ((filteredWI.filter(w => w.is_6_sisi === true).length / totalF) * 100).toFixed(0) : 0;

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>LOGO PROGRESS TRACKER</h1>
          <p style={{color:'#707EAE'}}>Data Terfilter: {totalF} baris</p>
        </div>
        <button onClick={onOpenModal} style={styles.btnAdd}><Plus size={18}/> Tambah WI Manual</button>
      </header>

      {/* CHART BOXES */}
      <div style={styles.chartGrid}>
        <div style={styles.whiteBoxChart}>
          <h4 style={styles.chartTitle}>Kondisi Bagus</h4>
          <p style={{...styles.chartValue, color:'#05CD99'}}>{pctBagus}%</p>
        </div>
        <div style={styles.whiteBoxChart}>
          <h4 style={styles.chartTitle}>Status O/C (Closed)</h4>
          <p style={{...styles.chartValue, color:'#4318FF'}}>{pctClosed}%</p>
        </div>
        <div style={styles.whiteBoxChart}>
          <h4 style={styles.chartTitle}>Standar 6 Sisi</h4>
          <p style={{...styles.chartValue, color:'#FFB800'}}>{pct6Sisi}%</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={styles.filterBar}>
        <div style={styles.searchBar}>
          <Search size={16} color="#A3AED0" />
          <input placeholder="Cari Part No..." style={styles.inputPlain} onChange={e=>setSearchTerm(e.target.value)}/>
        </div>
        <select style={styles.selectFilter} onChange={e=>setFCond(e.target.value)}>
          <option value="All">Kondisi: Semua</option>
          <option value="Bagus">Bagus</option><option value="Rusak">Rusak</option>
        </select>
        <select style={styles.selectFilter} onChange={e=>setFStatus(e.target.value)}>
          <option value="All">O/C: Semua</option>
          <option value="O">Open (O)</option><option value="C">Closed (C)</option>
        </select>
        <select style={styles.selectFilter} onChange={e=>setF6Sisi(e.target.value)}>
          <option value="All">6 Sisi: Semua</option>
          <option value="Sudah">Sudah (✅)</option><option value="Belum">Belum (❌)</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={styles.whiteBox}>
        <table style={styles.table}>
          <thead>
            <tr style={{color:'#A3AED0', borderBottom:'2px solid #F4F7FE'}}>
              <th style={{padding:'12px'}}>CUSTOMER</th><th>DATE</th><th>PART NUMBER</th><th>MODEL</th><th>LOCATION</th><th>6 SISI</th><th>O/C</th>
            </tr>
          </thead>
          <tbody>
            {filteredWI.map(w => (
              <tr key={w.id} style={{borderBottom:'1px solid #F4F7FE'}}>
                <td style={{padding:'15px 0'}}>{w.customer || '-'}</td>
                <td>{w.date_created || '-'}</td>
                <td style={{fontWeight:'700', color:'#1B2559'}}>{w.part_number}</td>
                <td>{w.model || '-'}</td>
                <td>{w.location || '-'}</td>
                <td style={{textAlign:'center'}}>{w.is_6_sisi ? '✅' : '❌'}</td>
                <td>
                  <span style={{...styles.badge, background: w.status_oc === 'O' ? '#FFF1F0' : '#E6F9F4', color: w.status_oc === 'O' ? '#EE5D50' : '#05CD99'}}>
                    {w.status_oc}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1B2559', margin: 0 },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' },
  whiteBoxChart: { background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)' },
  chartTitle: { fontSize: '13px', color: '#A3AED0', fontWeight:'600', margin:0 },
  chartValue: { fontSize: '28px', fontWeight: '800', marginTop: '10px' },
  filterBar: { display: 'flex', gap: '15px', marginBottom: '20px' },
  searchBar: { display: 'flex', alignItems: 'center', background: 'white', padding: '0 15px', borderRadius: '12px', border: '1px solid #E0E5F2', gap: '10px' },
  inputPlain: { border: 'none', outline: 'none', height: '40px', width: '200px' },
  selectFilter: { padding: '10px', borderRadius: '12px', border: '1px solid #E0E5F2', background:'white' },
  whiteBox: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' },
  badge: { padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' },
  btnAdd: { background: '#05CD99', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
};