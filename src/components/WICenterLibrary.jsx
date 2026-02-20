import React, { useState, useEffect } from "react";
import { Search, QrCode, ExternalLink, Printer, X, Camera, RotateCcw, Layers, CheckSquare, Square, ListChecks } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function WICenterLibrary({ wiList }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWI, setSelectedWI] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // State Baru untuk Massal
  const [isMassalMode, setIsMassalMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); // Menampung ID yang dipilih

  const filteredWI = wiList.filter((wi) =>
    wi.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wi.mold_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wi.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wi.process_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    let scanner = null;
    if (isScannerOpen) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((decodedText) => {
        setSearchTerm(decodedText);
        setIsScannerOpen(false);
        scanner.clear();
      }, () => {});
    }
    return () => { if (scanner) scanner.clear(); };
  }, [isScannerOpen]);

  // Fungsi Pilih/Batal Pilih Item
  const toggleSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Pilih Semua yang tampil di Filter
  const selectAllFiltered = () => {
    const allIds = filteredWI.map(wi => wi.id);
    setSelectedItems(allIds);
  };

  const handlePrint = () => {
    if (isMassalMode && selectedItems.length === 0) {
      alert("Pilih minimal satu label untuk dicetak, Puh!");
      return;
    }
    window.print();
  };

  return (
    <div style={styles.container}>
      {/* Scanner Modal */}
      {isScannerOpen && (
        <div style={styles.modalOverlay} className="no-print">
          <div style={styles.modalContent}>
             <div style={styles.modalHeader}>
                <h3>Scan QR Code</h3>
                <button onClick={() => setIsScannerOpen(false)} style={styles.btnClose}><X size={20} /></button>
             </div>
             <div id="reader" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}

      <div className="no-print">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>WI MASTER LIBRARY</h1>
            <p style={styles.subtitle}>Database Pusat: Part No, Mold No, & Proses</p>
          </div>
          
          <div style={styles.actionWrapper}>
            {/* Tombol Toggle Massal - Label Diperjelas */}
            <button 
              onClick={() => {
                setIsMassalMode(!isMassalMode);
                setSelectedItems([]); // Reset pilihan saat ganti mode
              }} 
              style={{
                ...styles.btnScanHeader, 
                background: isMassalMode ? '#EF4444' : '#1E293B'
              }}
            >
              {isMassalMode ? <X size={20} /> : <ListChecks size={20} />} 
              {isMassalMode ? "Batal Pilih" : "Pilih Banyak Label"}
            </button>

            <button onClick={() => setIsScannerOpen(true)} style={styles.btnScanHeader}>
              <Camera size={20} /> Scan QR
            </button>

            <div style={styles.searchWrapper}>
              <Search size={20} color="#94A3B8" />
              <input
                style={styles.searchInput}
                placeholder="Cari Part / Mold / Proses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Panel Instruksi Cetak Massal */}
        {isMassalMode && (
          <div style={styles.massalAlert}>
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
               <div style={{background: '#4F46E5', color:'white', padding:'8px 12px', borderRadius:'10px'}}>
                  <strong>{selectedItems.length}</strong> Label Terpilih
               </div>
               <button onClick={selectAllFiltered} style={styles.btnSelectAll}>
                 Pilih Semua Hasil Cari
               </button>
            </div>
            <button 
               onClick={handlePrint} 
               style={{...styles.btnPrintMassal, opacity: selectedItems.length > 0 ? 1 : 0.5}}
               disabled={selectedItems.length === 0}
            >
              <Printer size={18} /> Cetak Label Terpilih
            </button>
          </div>
        )}

        <div style={styles.grid}>
          {filteredWI.map((wi) => {
            const isSelected = selectedItems.includes(wi.id);
            return (
              <div 
                key={wi.id} 
                style={{
                  ...styles.card, 
                  borderColor: isSelected ? '#4F46E5' : '#E2E8F0',
                  boxShadow: isSelected ? '0 0 0 2px #4F46E5' : 'none'
                }}
                onClick={() => isMassalMode && toggleSelection(wi.id)}
              >
                {/* Checkbox Overlay (Hanya muncul di mode massal) */}
                {isMassalMode && (
                  <div style={styles.checkboxWrapper}>
                    {isSelected ? <CheckSquare color="#4F46E5" size={28} /> : <Square color="#94A3B8" size={28} />}
                  </div>
                )}

                <div style={styles.cardHeader}>
                  <div style={styles.processBadge}><Layers size={14} /> {wi.process_name}</div>
                  <span style={styles.customerTag}>{wi.customer}</span>
                </div>
                
                <h3 style={styles.partNumber}>{wi.part_number}</h3>
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Mold No:</span>
                    <span style={styles.detailValue}>{wi.mold_number}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Model:</span>
                    <span style={styles.detailValue}>{wi.model}</span>
                  </div>
                </div>

                <div style={styles.divider}></div>
                
                <div style={styles.cardActions}>
                  {!isMassalMode && (
                    <button onClick={(e) => { e.stopPropagation(); setSelectedWI(wi); }} style={styles.btnQR}>
                      <QrCode size={16} /> QR Label
                    </button>
                  )}
                  <a href={wi.file_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={styles.btnOpen}>
                    <ExternalLink size={16} /> Buka WI
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AREA CETAK (Hanya Muncul Saat Print) */}
      <div className="print-only">
        <div style={styles.printGrid}>
          {isMassalMode ? (
            wiList.filter(wi => selectedItems.includes(wi.id)).map(wi => (
              <LabelTemplate key={wi.id} wi={wi} size="small" />
            ))
          ) : (
            selectedWI && <LabelTemplate wi={selectedWI} size="large" />
          )}
        </div>
      </div>

      {/* MODAL PREVIEW (SINGLE) */}
      {selectedWI && !isMassalMode && (
        <div style={styles.modalOverlay} className="no-print">
          <div style={{...styles.modalContent, maxWidth: '400px'}}>
            <div style={styles.modalHeader}>
              <h3 style={{margin:0}}>Cetak Label Tunggal</h3>
              <button onClick={() => setSelectedWI(null)} style={styles.btnClose}><X size={20} /></button>
            </div>
            <div style={styles.labelPreviewContainer}>
               <LabelTemplate wi={selectedWI} size="large" />
            </div>
            <button onClick={handlePrint} style={styles.btnPrint}>
              <Printer size={18} /> Print Label Sekarang
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media screen { .print-only { display: none; } }
        @media print {
          body * { visibility: hidden !important; }
          .print-only, .print-only * { visibility: visible !important; }
          .print-only { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; display: flex !important; flex-wrap: wrap !important; justify-content: flex-start !important; }
          .no-print { display: none !important; }
          @page { margin: 0.5cm; }
        }
      `}</style>
    </div>
  );
}

// Template Label
const LabelTemplate = ({ wi, size }) => (
  <div style={{
    width: size === "small" ? '200px' : '300px',
    padding: '12px', margin: '5px', border: '2px solid black', background: 'white', display: 'inline-block', textAlign: 'center', color: '#000'
  }}>
    <div style={{display:'flex', justifyContent:'space-between', fontSize:'9px', borderBottom:'1px solid black', marginBottom:'5px', fontWeight:'bold'}}>
      <span>{wi.process_name}</span><span>WI MASTER</span>
    </div>
    <QRCodeCanvas value={wi.file_url} size={size === "small" ? 90 : 150} level="H" />
    <div style={{fontSize: size === "small" ? '14px' : '20px', fontWeight: '900', marginTop:'5px'}}>{wi.part_number}</div>
    <div style={{fontSize: '10px'}}>Mold: {wi.mold_number}</div>
  </div>
);

const styles = {
  container: { padding: '30px', backgroundColor: '#F8FAFC', minHeight: '100vh' },
  header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '26px', fontWeight: '900', color: '#0F172A', margin: 0 },
  subtitle: { color: '#64748B', fontSize: '14px' },
  actionWrapper: { display: 'flex', gap: '15px' },
  btnScanHeader: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  searchWrapper: { display: 'flex', alignItems: 'center', background: 'white', padding: '12px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '300px', gap: '12px' },
  searchInput: { border: 'none', outline: 'none', width: '100%' },
  
  massalAlert: { background: '#FFF', border: '2px solid #4F46E5', padding: '15px 25px', borderRadius: '20px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.1)' },
  btnSelectAll: { background: '#F1F5F9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#475569' },
  btnPrintMassal: { background: '#4F46E5', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0', position: 'relative', cursor: 'pointer', transition: '0.2s' },
  checkboxWrapper: { position: 'absolute', top: '15px', right: '15px', zIndex: 10 },
  
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingRight: '30px' },
  processBadge: { background: '#F1F5F9', color: '#475569', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' },
  customerTag: { background: '#F0FDF4', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  partNumber: { fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: '0 0 15px 0' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
  detailLabel: { fontSize: '10px', color: '#94A3B8', fontWeight: 'bold' },
  detailValue: { fontSize: '14px', fontWeight: '700', color: '#334155' },
  divider: { height: '1px', background: '#F1F5F9', margin: '15px 0' },
  cardActions: { display: 'flex', gap: '12px' },
  btnQR: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: 'white', fontWeight: '800' },
  btnOpen: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', background: '#10B981', color: 'white', textDecoration: 'none', fontWeight: '800' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' },
  modalContent: { background: 'white', padding: '30px', borderRadius: '28px', width: '90%' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btnClose: { background: '#F1F5F9', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '5px' },
  labelPreviewContainer: { background: '#F8FAFC', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'center' },
  btnPrint: { width: '100%', marginTop: '15px', padding: '15px', background: '#0F172A', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' },
};