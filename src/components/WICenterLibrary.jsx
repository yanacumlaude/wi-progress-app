import React, { useState } from 'react';
import { Search, FileText, QrCode, ExternalLink, Box, Tag } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function WICenterLibrary({ wiList, role }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQR, setSelectedQR] = useState(null);

  const filteredWI = wiList.filter(wi => 
    wi.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wi.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wi.customer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>WI CENTER LIBRARY</h1>
          <p style={styles.subtitle}>Pusat Informasi Digital Work Instruction</p>
        </div>
        <div style={styles.searchWrapper}>
          <Search size={20} color="#94A3B8" />
          <input 
            style={styles.searchInput} 
            placeholder="Cari Part Number atau Model..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div style={styles.grid}>
        {filteredWI.map((wi) => (
          <div key={wi.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.iconBox}><FileText color="#10B981" /></div>
              <div style={{flex: 1}}>
                <div style={styles.partNo}>{wi.part_number}</div>
                <div style={styles.modelName}>{wi.model || 'No Model'}</div>
              </div>
              <div style={{...styles.badge, background: wi.status_oc === 'O' ? '#DCFCE7' : '#F1F5F9'}}>
                {wi.status_oc === 'O' ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.infoRow}><Tag size={14} /> <span>{wi.customer}</span></div>
              <div style={styles.infoRow}><Box size={14} /> <span>{wi.location || 'Produksi'}</span></div>
            </div>

            <div style={styles.cardFooter}>
              <a 
                href={wi.file_url || '#'} 
                target="_blank" 
                rel="noreferrer" 
                style={{...styles.btnAction, background: wi.file_url ? '#3B82F6' : '#CBD5E1', pointerEvents: wi.file_url ? 'auto' : 'none'}}
              >
                <ExternalLink size={16} /> View WI
              </a>
              <button onClick={() => setSelectedQR(wi)} style={styles.btnQR}>
                <QrCode size={16} /> QR Code
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL QR CODE */}
      {selectedQR && (
        <div style={styles.overlay} onClick={() => setSelectedQR(null)}>
          <div style={styles.modalQR} onClick={e => e.stopPropagation()}>
            <h3 style={{marginBottom: '10px'}}>QR Code WI</h3>
            <p style={{fontSize: '14px', color: '#64748B', marginBottom: '20px'}}>{selectedQR.part_number}</p>
            <div style={styles.qrContainer}>
              <QRCodeCanvas 
                value={`https://puh-wi-center.netlify.app/view?part=${selectedQR.part_number}`} 
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>
            <button style={styles.btnPrint} onClick={() => window.print()}>Print QR Label</button>
            <button style={styles.btnClose} onClick={() => setSelectedQR(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '24px', fontWeight: '900', color: '#1E293B', margin: 0 },
  subtitle: { color: '#64748B', fontSize: '14px', margin: '5px 0 0 0' },
  searchWrapper: { display: 'flex', alignItems: 'center', background: 'white', padding: '12px 20px', borderRadius: '15px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '400px', gap: '10px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  iconBox: { width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  partNo: { fontWeight: '800', fontSize: '16px', color: '#1E293B' },
  modelName: { fontSize: '12px', color: '#64748B' },
  badge: { fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px' },
  cardBody: { padding: '10px 0', borderTop: '1px solid #F8FAFC', marginBottom: '15px' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '5px' },
  cardFooter: { display: 'flex', gap: '10px' },
  btnAction: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', color: 'white', textDecoration: 'none', fontWeight: '600', fontSize: '13px' },
  btnQR: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalQR: { background: 'white', padding: '30px', borderRadius: '25px', textAlign: 'center', width: '90%', maxWidth: '350px' },
  qrContainer: { background: '#f8f8f8', padding: '20px', borderRadius: '15px', marginBottom: '20px', display: 'inline-block' },
  btnPrint: { width: '100%', padding: '12px', background: '#1E293B', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer' },
  btnClose: { width: '100%', padding: '12px', background: 'transparent', color: '#64748B', border: 'none', cursor: 'pointer' }
};