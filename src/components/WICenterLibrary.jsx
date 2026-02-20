import React, { useState, useEffect } from "react";
import { Search, FileText, QrCode, ExternalLink, Box, Printer, X, Camera, RotateCcw } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function WICenterLibrary({ wiList, role }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWI, setSelectedWI] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const filteredWI = wiList.filter((wi) =>
    wi.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wi.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOGIK SCANNER ---
  useEffect(() => {
    let scanner = null;
    if (isScannerOpen) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render((decodedText) => {
        setSearchTerm(decodedText); // Masukkan hasil scan ke kolom search
        setIsScannerOpen(false);    // Tutup scanner
        scanner.clear();            // Matikan kamera
      }, (error) => {
        // Diamkan saja saat scanning gagal nyari code
      });
    }

    return () => {
      if (scanner) scanner.clear();
    };
  }, [isScannerOpen]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      <div className="no-print">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>WI CENTER LIBRARY</h1>
            <p style={styles.subtitle}>Cari cepat via Search atau Scan QR Label</p>
          </div>
          
          <div style={styles.actionWrapper}>
            <button onClick={() => setIsScannerOpen(true)} style={styles.btnScanHeader}>
              <Camera size={20} /> Scan QR Kamera
            </button>

            <div style={styles.searchWrapper}>
              <Search size={20} color="#94A3B8" />
              <input
                style={styles.searchInput}
                placeholder="Hasil scan atau ketik Part No..."
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

        {/* GRID VIEW */}
        <div style={styles.grid}>
          {filteredWI.length > 0 ? filteredWI.map((wi) => (
            <div key={wi.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <Box size={18} color="#10B981" />
                <span style={styles.customerTag}>{wi.customer}</span>
              </div>
              <h3 style={styles.partNumber}>{wi.part_number}</h3>
              <p style={styles.modelText}>{wi.model || "No Model"}</p>
              <div style={styles.divider}></div>
              <div style={styles.cardActions}>
                <button onClick={() => setSelectedWI(wi)} style={styles.btnQR}>
                  <QrCode size={16} /> QR Code
                </button>
                {wi.file_url ? (
                  <a href={wi.file_url} target="_blank" rel="noreferrer" style={styles.btnOpen}>
                    <ExternalLink size={16} /> Buka WI
                  </a>
                ) : (
                  <span style={styles.noFile}>No File</span>
                )}
              </div>
            </div>
          )) : (
            <div style={styles.emptyState}>Data tidak ditemukan. Coba scan lagi atau cek pengetikan.</div>
          )}
        </div>
      </div>

      {/* MODAL SCANNER KAMERA */}
      {isScannerOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentScanner}>
            <div style={styles.modalHeader}>
              <h3>Arahkan Kamera ke QR</h3>
              <button onClick={() => setIsScannerOpen(false)} style={styles.btnClose}>
                <X size={24} />
              </button>
            </div>
            <div id="reader" style={{ width: '100%' }}></div>
            <p style={{fontSize: '12px', color: '#64748B', marginTop: '15px'}}>Pastikan label QR mendapat cahaya yang cukup</p>
          </div>
        </div>
      )}

      {/* MODAL QR & PRINT (Sama seperti sebelumnya) */}
      {selectedWI && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="print-section">
            <div style={styles.modalHeader} className="no-print">
              <h3>Label QR Produksi</h3>
              <button onClick={() => setSelectedWI(null)} style={styles.btnClose}><X size={20} /></button>
            </div>
            <div id="printable-label" style={styles.printableArea}>
               <div style={styles.printBrand}>WI CENTER HUB</div>
               <div style={styles.qrWrapper}>
                  <QRCodeCanvas value={selectedWI.part_number} size={180} level={"H"} includeMargin={true} />
               </div>
               <div style={styles.printInfo}>
                  <div style={styles.printPartNo}>{selectedWI.part_number}</div>
                  <div style={styles.printModel}>{selectedWI.model}</div>
               </div>
            </div>
            <div style={styles.modalFooter} className="no-print">
              <button onClick={handlePrint} style={styles.btnPrint}><Printer size={18} /> Print Label</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          #printable-label { border: 2px solid black !important; padding: 20px !important; display: flex !important; flex-direction: column !important; align-items: center !important; width: 300px !important; margin: 0 auto !important; }
        }
        #reader__scan_region { background: white !important; }
        #reader__dashboard_section_csr button { 
          padding: 8px 16px !important; 
          background: #10B981 !important; 
          color: white !important; 
          border: none !important; 
          border-radius: 8px !important;
          margin-top: 10px !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px' },
  header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' },
  actionWrapper: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  btnScanHeader: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1E293B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 },
  subtitle: { color: '#64748B', fontSize: '14px', margin: '5px 0 0 0' },
  searchWrapper: { display: 'flex', alignItems: 'center', background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', minWidth: '300px', gap: '10px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '14px' },
  btnClear: { border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  customerTag: { background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  partNumber: { fontSize: '18px', fontWeight: '700', color: '#1E293B', margin: '0' },
  modelText: { color: '#64748B', fontSize: '13px', margin: '5px 0 0 0' },
  divider: { height: '1px', background: '#F1F5F9', margin: '15px 0' },
  cardActions: { display: 'flex', gap: '10px' },
  btnQR: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  btnOpen: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', background: '#10B981', color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: '600' },
  noFile: { flex: 1, textAlign: 'center', color: '#CBD5E1', fontSize: '12px', padding: '10px' },
  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#94A3B8', background: 'white', borderRadius: '20px' },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, backdropFilter: 'blur(4px)', padding: '20px' },
  modalContent: { background: 'white', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' },
  modalContentScanner: { background: 'white', padding: '20px', borderRadius: '20px', width: '100%', maxWidth: '500px', textAlign: 'center' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btnClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' },
  printableArea: { padding: '10px', background: 'white' },
  printBrand: { fontSize: '12px', fontWeight: 'bold', color: '#94A3B8', marginBottom: '10px' },
  qrWrapper: { padding: '10px', display: 'inline-block' },
  printInfo: { marginTop: '10px' },
  printPartNo: { fontSize: '22px', fontWeight: '800', color: '#1E293B' },
  printModel: { fontSize: '16px', color: '#64748B' },
  modalFooter: { marginTop: '20px' },
  btnPrint: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', borderRadius: '12px', background: '#3B82F6', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }
};