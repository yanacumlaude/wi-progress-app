import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";

import Dashboard from "./components/Dashboard";
import LogoProgress from "./components/LogoProgress";
import Request from "./components/Request";
import Findings from "./components/Findings";
import Revisi from "./components/Revisi";

function App() {
  const [menu, setMenu] = useState("dashboard");
  const [wiList, setWiList] = useState([]);
  const [revisiList, setRevisiList] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  
  // --- STATE MODAL MASTER WI ---
  const [isModalInputWI, setIsModalInputWI] = useState(false);
  const [newWI, setNewWI] = useState({
    customer: "", date_created: "", part_number: "", mold_number: "",
    model: "", is_logo_updated: "", is_6_sisi: false,
    condition: "Bagus", remarks: "", status_oc: "O", location: ""
  });

  // --- STATE MODAL TICKETING (Findings/Requests) ---
  const [isModalTicket, setIsModalTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    ticket_type: "Finding",
    requester_name: "",
    part_number: "",
    description: "",
    priority: "Normal",
    status: "Open"
  });

  const fetchData = async () => {
    try {
      const { data: wi } = await supabase.from('wi_data').select('*').order('id', { ascending: false });
      const { data: rev } = await supabase.from('revisi_wi').select('*').order('id', { ascending: false });
      const { data: tick } = await supabase.from('wi_tickets').select('*').order('id', { ascending: false });
      
      setWiList(wi || []);
      setRevisiList(rev || []);
      setTicketList(tick || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLER SIMPAN MASTER WI ---
  const handleSaveWI = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_data').insert([newWI]);
    if (error) {
      alert(error.message);
    } else {
      alert("Data WI Berhasil Disimpan!");
      setIsModalInputWI(false);
      fetchData();
    }
  };

  // --- HANDLER SIMPAN TIKET (Findings/Request) ---
  const handleSaveTicket = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('wi_tickets').insert([newTicket]);
    if (error) {
      alert(error.message);
    } else {
      alert("Tiket Berhasil Terkirim!");
      setIsModalTicket(false);
      setNewTicket({ ticket_type: "Finding", requester_name: "", part_number: "", description: "", priority: "Normal", status: "Open" });
      fetchData();
    }
  };

  const renderContent = () => {
    switch (menu) {
      case "dashboard":
        return <Dashboard wiList={wiList} ticketList={ticketList} revisiList={revisiList} />;
      case "logo":
        return <LogoProgress wiList={wiList} onOpenModal={() => setIsModalInputWI(true)} />;
      case "revisi":
        return <Revisi revisiList={revisiList} />;
      case "findings":
        return <Findings 
          ticketList={ticketList} 
          onOpenTicket={(type) => { 
            setNewTicket({...newTicket, ticket_type: type}); 
            setIsModalTicket(true); 
          }} 
        />;
      case "requests":
        return <Request 
          ticketList={ticketList} 
          onOpenTicket={(type) => { 
            setNewTicket({...newTicket, ticket_type: type}); 
            setIsModalTicket(true); 
          }} 
        />;
      default:
        return <Dashboard wiList={wiList} ticketList={ticketList} revisiList={revisiList} />;
    }
  };

  return (
    <div style={{ display: 'flex', background: '#f4f7fe', minHeight: '100vh', width: '100%' }}>
      <Sidebar menu={menu} setMenu={setMenu} />
      <main style={{ flex: 1, padding: '30px', marginLeft: '260px' }}>
        {renderContent()}
      </main>

      {/* --- MODAL INPUT MASTER WI --- */}
      {isModalInputWI && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <div style={modalStyles.header}>
              <h3>Input Master WI Baru</h3>
              <button onClick={() => setIsModalInputWI(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveWI} style={modalStyles.formGrid}>
              <input style={modalStyles.input} placeholder="Customer" onChange={e=>setNewWI({...newWI, customer: e.target.value})}/>
              <input type="date" style={modalStyles.input} onChange={e=>setNewWI({...newWI, date_created: e.target.value})}/>
              <input style={modalStyles.input} placeholder="Part Number" required onChange={e=>setNewWI({...newWI, part_number: e.target.value})}/>
              <input style={modalStyles.input} placeholder="Model" onChange={e=>setNewWI({...newWI, model: e.target.value})}/>
              <button type="submit" style={modalStyles.btnSaveWI}>Simpan Master WI</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CREATE TICKET (Findings & Requests) --- */}
      {isModalTicket && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <div style={modalStyles.header}>
              <h3>Buat Tiket {newTicket.ticket_type}</h3>
              <button onClick={() => setIsModalTicket(false)} style={modalStyles.btnClose}>×</button>
            </div>
            <form onSubmit={handleSaveTicket} style={modalStyles.formVertical}>
              <input 
                style={modalStyles.input} placeholder="Nama Pelapor" required
                onChange={e => setNewTicket({...newTicket, requester_name: e.target.value})}
              />
              <input 
                style={modalStyles.input} placeholder="Part Number / Area" 
                onChange={e => setNewTicket({...newTicket, part_number: e.target.value})}
              />
              <textarea 
                style={{...modalStyles.input, height: '80px', resize: 'none'}} placeholder="Deskripsi Detail..." required
                onChange={e => setNewTicket({...newTicket, description: e.target.value})}
              ></textarea>
              <select 
                style={modalStyles.input}
                onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
              >
                <option value="Normal">Prioritas: Normal</option>
                <option value="High">Prioritas: High / Urgent</option>
              </select>
              <button type="submit" style={modalStyles.btnSaveTicket}>Kirim Tiket Sekarang</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES UNTUK MODAL ---
const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  content: { background: 'white', padding: '30px', borderRadius: '20px', width: '450px', boxShadow: '0px 20px 40px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btnClose: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#A3AED0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formVertical: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #E0E5F2', fontSize: '14px', outline: 'none' },
  btnSaveWI: { gridColumn: 'span 2', background: '#05CD99', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  btnSaveTicket: { background: '#4318FF', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }
};

export default App;