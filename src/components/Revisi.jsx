import React, { useState } from "react";
import { FileText, Edit3, Plus, Search, Calendar, User, MapPin, Building2, RotateCcw } from "lucide-react";

export default function Revisi({ revisiList, onOpenModal, onEditRevisi }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRevisi = revisiList?.filter(r => 
    r.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.proses_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div style={{ width: '100%' }}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>WI REVISION & DISTRIBUTION</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Monitoring distribusi dokumen & penarikan WI lama</p>
        </div>
        <button onClick={onOpenModal} style={styles.btnCreate}>
          <Plus size={18} /> <span>Tambah Distribusi</span>
        </button>
      </header>

      <div style={styles.filterBar}>
        <div style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <input 
            placeholder="Cari Part, Model, atau Proses..." 
            style={styles.inputPlain}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.grid}>
        {filteredRevisi.length > 0 ? filteredRevisi.map((rev) => (
          <div key={rev.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.iconBox}><FileText size={20} color="#10B981" /></div>
              <span style={styles.statusBadge(rev.status)}>{rev.status}</span>
            </div>

            <div style={styles.cardBody}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={styles.partNo}>{rev.part_number}</h4>
                <span style={styles.deptBadge}>{rev.departemen || 'No Dept'}</span>
              </div>
              <p style={styles.modelText}>{rev.model} — {rev.proses_name || 'Tanpa Nama Proses'}</p>
              
              <div style={styles.detailGrid}>
                <div style={styles.infoItem}><Calendar size={12}/> Rev: {rev.tgl_revisi || '-'}</div>
                <div style={styles.infoItem}><MapPin size={12}/> {rev.location}</div>
                <div style={styles.infoItem}><User size={12}/> PIC: {rev.pic_penerima || '-'}</div>
                {/* Field Baru: Tgl Penarikan */}
                <div style={{...styles.infoItem, color: rev.tgl_penarikan ? '#EF4444' : '#64748B'}}>
                  <RotateCcw size={12}/> Tarik: {rev.tgl_penarikan || 'Belum'}
                </div>
              </div>
              
              <p style={styles.desc}><strong>Catatan:</strong> {rev.keterangan_revisi || '-'}</p>
            </div>

            <div style={styles.cardFooter}>
              <div style={styles.qtyBox}>Distribusi: <strong>{rev.qty_print} Lembar</strong></div>
              <button onClick={() => onEditRevisi(rev)} style={styles.btnEdit}>
                <Edit3 size={14} /> Update Data
              </button>
            </div>
          </div>
        )) : <div style={styles.empty}>Data distribusi tidak ditemukan.</div>}
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 },
  btnCreate: { background: '#10B981', color: 'white', padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  filterBar: { marginBottom: '20px' },
  searchBar: { display: 'flex', alignItems: 'center', background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', gap: '10px', maxWidth: '400px' },
  inputPlain: { border: 'none', outline: 'none', width: '100%', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: { background: 'white', borderRadius: '16px', padding: '18px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  iconBox: { padding: '8px', background: '#F0FDF4', borderRadius: '10px' },
  statusBadge: (s) => ({ 
    fontSize: '10px', 
    fontWeight: 'bold', 
    padding: '4px 10px', 
    borderRadius: '20px', 
    background: s === 'Completed' ? '#F0FDF4' : s === 'Distributed' ? '#EFF6FF' : '#FFFBEB', 
    color: s === 'Completed' ? '#10B981' : s === 'Distributed' ? '#3B82F6' : '#B45309' 
  }),
  deptBadge: { fontSize: '10px', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', color: '#475569', fontWeight: '600' },
  partNo: { fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: 0 },
  modelText: { fontSize: '12px', color: '#64748B', marginBottom: '12px', fontWeight: '500' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' },
  infoItem: { fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' },
  desc: { fontSize: '12px', background: '#F8FAFC', padding: '8px', borderRadius: '8px', color: '#475569', borderLeft: '3px solid #E2E8F0' },
  cardFooter: { marginTop: '15px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  qtyBox: { fontSize: '12px', color: '#64748B' },
  btnEdit: { background: '#F1F5F9', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontWeight: '600' },
  empty: { textAlign: 'center', gridColumn: '1/-1', padding: '50px', color: '#94A3B8' }
};