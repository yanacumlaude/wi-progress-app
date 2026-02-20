import React, { useState, useEffect } from "react";
import { Search, QrCode, ExternalLink, Box, Printer, X, Camera, RotateCcw, Layers } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function WICenterLibrary({ wiList }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWI, setSelectedWI] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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

  return (
    <div style={styles.container}>
      {/* Scanner Modal */}
      {isScannerOpen && (
        <div style={styles.modalOverlay}>
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
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} style={styles.btnClear}>
                   <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          {filteredWI.map((wi) => (
            <div key={wi.id} style={styles.card}>
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
                <button onClick={() => setSelectedWI(wi)} style={styles.btnQR}>
                  <QrCode size={16} /> QR Label
                </button>
                {wi.file_url && (
                  <a href={wi.file_url} target="_blank" rel="noreferrer" style={styles.btnOpen}>
                    <ExternalLink size={16} /> Buka WI
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL QR & PRINT AREA (GLOW UP VERSION) */}
      {selectedWI && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '400px'}} className="print-section">
            <div style={styles.modalHeader} className="no-print">
              <h3 style={{margin:0}}>Label Digital WI</h3>
              <button onClick={() => setSelectedWI(null)} style={styles.btnClose}><X size={20} /></button>
            </div>

            <div style={styles.labelPreviewContainer} className="no-print">
               <p style={{fontSize: '12px', color: '#64748B', marginBottom: '15px'}}>Preview Label Fisik:</p>
               
               <div id="printable-label" style={styles.printableArea}>
                  <div style={styles.printHeader}>
                    <span style={{fontWeight: '900'}}>WORK INSTRUCTION</span>
                    <span style={{opacity: 0.7}}>WI CENTER HUB</span>
                  </div>
                  
                  <div style={styles.qrWrapper}>
                     <QRCodeCanvas value={selectedWI.file_url} size={140} level={"H"} includeMargin={false} />
                  </div>
                  
                  <div style={styles.printInfo}>
                     <div style={styles.printProcessBadge}>{selectedWI.process_name}</div>
                     <div style={styles.printPartNo}>{selectedWI.part_number}</div>
                     <div style={styles.printMold}>Mold: {selectedWI.mold_number}</div>
                     <div style={{fontSize: '10px', marginTop: '5px', borderTop: '1px solid #000', paddingTop: '5px'}}>
                        Model: {selectedWI.model} | Customer: {selectedWI.customer}
                     </div>
                  </div>
               </div>
            </div>

            <div style={styles.modalFooter} className="no-print">
              <button onClick={() => window.print()} style={styles.btnPrint}>
                <Printer size={18} /> Print ke Thermal Printer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; display: flex; justify-content: center; background: white !important; }
          .no-print { display: none !important; }
          #printable-label { 
            border: 2px solid black !important; 
            padding: 10px !important; 
            width: 300px !important; 
            text-align: center;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { padding: '30px', backgroundColor: '#F8FAFC', minHeight: '100vh' },
  header: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '28px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px', margin: 0 },
  subtitle: { color: '#64748B', fontSize: '14px', marginTop: '5px' },
  actionWrapper: { display: 'flex', gap: '15px', alignItems: 'center' },
  
  btnScanHeader: { 
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', 
    color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', 
    cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
  },
  
  searchWrapper: { 
    display: 'flex', alignItems: 'center', background: 'white', padding: '12px 18px', 
    borderRadius: '12px', border: '1px solid #E2E8F0', width: '350px', gap: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '15px', color: '#1E293B' },
  btnClear: { background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
  
  card: { 
    background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0', 
    position: 'relative', transition: 'all 0.3s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
  },
  
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  processBadge: { background: '#EEF2FF', color: '#4F46E5', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' },
  customerTag: { background: '#F0FDF4', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #DCFCE7' },
  
  partNumber: { fontSize: '22px', fontWeight: '900', color: '#0F172A', margin: '0 0 15px 0' },
  
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
  detailLabel: { fontSize: '10px', color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', display: 'block' },
  detailValue: { fontSize: '14px', fontWeight: '700', color: '#334155' },
  
  divider: { height: '1px', background: '#F1F5F9', margin: '15px 0' },
  
  cardActions: { display: 'flex', gap: '12px' },
  btnQR: { 
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
    padding: '12px', borderRadius: '12px', border: '1.5px solid #E2E8F0', 
    background: 'white', cursor: 'pointer', fontWeight: '800', fontSize: '13px', color: '#475569' 
  },
  btnOpen: { 
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
    padding: '12px', borderRadius: '12px', background: '#10B981', color: 'white', 
    textDecoration: 'none', fontWeight: '800', fontSize: '13px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' 
  },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' },
  modalContent: { background: 'white', padding: '30px', borderRadius: '28px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btnClose: { background: '#F1F5F9', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '5px', color: '#64748B' },
  
  labelPreviewContainer: { background: '#F8FAFC', padding: '25px', borderRadius: '20px', border: '1px solid #E2E8F0', marginBottom: '20px' },
  printableArea: { 
    background: 'white', border: '2px solid #000', padding: '15px', margin: '0 auto',
    width: '260px', color: '#000', textAlign: 'center'
  },
  printHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '10px', borderBottom: '1.5px solid #000', paddingBottom: '5px' },
  qrWrapper: { padding: '10px', display: 'inline-block' },
  printInfo: { textAlign: 'center', marginTop: '5px' },
  printProcessBadge: { background: '#000', color: '#FFF', display: 'inline-block', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' },
  printPartNo: { fontSize: '20px', fontWeight: '900', lineHeight: 1.1 },
  printMold: { fontSize: '14px', fontWeight: 'bold' },
  
  modalFooter: { marginTop: '10px' },
  btnPrint: { 
    width: '100%', padding: '15px', background: '#0F172A', color: 'white', 
    border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)'
  }
};