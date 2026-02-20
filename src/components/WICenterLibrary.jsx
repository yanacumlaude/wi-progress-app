import React, { useState, useEffect } from "react";
import { Search, QrCode, ExternalLink, Box, Printer, X, Camera, RotateCcw, Layers } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function WICenterLibrary({ wiList }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWI, setSelectedWI] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Filter yang lebih "Ganas": Cari di Part No, Mold No, Model, atau Proses
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

      {/* MODAL QR & PRINT AREA */}
      {selectedWI && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="print-section">
            <div style={styles.modalHeader} className="no-print">
              <h3>Label WI: {selectedWI.process_name}</h3>
              <button onClick={() => setSelectedWI(null)} style={styles.btnClose}><X size={20} /></button>
            </div>

            <div id="printable-label" style={styles.printableArea}>
               <div style={styles.printHeader}>
                 <strong>{selectedWI.process_name}</strong>
                 <span>WI CENTER HUB</span>
               </div>
               <div style={styles.qrWrapper}>
                  {/* QR mengandung Part No agar discan langsung muncul di search */}
                  <QRCodeCanvas value={selectedWI.part_number} size={160} level={"H"} includeMargin={true} />
               </div>
               <div style={styles.printInfo}>
                  <div style={styles.printPartNo}>{selectedWI.part_number}</div>
                  <div style={styles.printMold}>Mold: {selectedWI.mold_number}</div>
                  <div style={styles.printModel}>{selectedWI.model}</div>
               </div>
            </div>

            <div style={styles.modalFooter} className="no-print">
              <button onClick={() => window.print()} style={styles.btnPrint}>
                <Printer size={18} /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; display: flex; justify-content: center; }
          .no-print { display: none !important; }
          #printable-label { border: 3px solid black !important; padding: 15px !important; width: 280px !important; text-align: center; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px' },
  header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  actionWrapper: { display: 'flex', gap: '12px' },
  btnScanHeader: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#1E293B', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  searchWrapper: { display: 'flex', alignItems: 'center', background: 'white', padding: '10px 15px', borderRadius: '10px', border: '1px solid #E2E8F0', width: '300px', gap: '10px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', position: 'relative' },
  processBadge: { background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' },
  customerTag: { background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  partNumber: { fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: '15px 0 10px 0' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' },
  detailLabel: { fontSize: '10px', color: '#94A3B8', display: 'block', textTransform: 'uppercase' },
  detailValue: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  divider: { height: '1px', background: '#F1F5F9', margin: '10px 0' },
  cardActions: { display: 'flex', gap: '10px' },
  btnQR: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontWeight: 'bold' },
  btnOpen: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '8px', background: '#10B981', color: 'white', textDecoration: 'none', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { background: 'white', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '350px' },
  printableArea: { textAlign: 'center' },
  printHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '10px', borderBottom: '1px solid #EEE', paddingBottom: '5px' },
  printPartNo: { fontSize: '24px', fontWeight: '900' },
  printMold: { fontSize: '16px', fontWeight: 'bold', color: '#444' },
  printModel: { fontSize: '14px', color: '#666' }
};