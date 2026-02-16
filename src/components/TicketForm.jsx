// src/components/TicketForm.jsx
export default function TicketForm({ type, form, setForm, onSubmit }) {
  const isFinding = type === "issue";

  return (
    <div style={styles.formCard}>
      <h3 style={{ marginTop: 0, color: isFinding ? '#d63031' : '#0984e3' }}>
        {isFinding ? "⚠️ New Finding (Temuan)" : "📩 New WI Request"}
      </h3>
      <p style={{ fontSize: '12px', color: '#636e72', marginBottom: '20px' }}>
        {isFinding 
          ? "Gunakan ini untuk melaporkan WI lama atau logo yang belum di-update." 
          : "Gunakan ini untuk permintaan pembuatan atau pembaruan WI dari divisi."}
      </p>

      <div style={styles.inputGroup}>
        <label style={styles.label}>WI Code / Name</label>
        <input 
          style={styles.input} 
          placeholder="Contoh: WI-PROD-001" 
          value={form.wiCode}
          onChange={(e) => setForm({...form, wiCode: e.target.value})}
        />

        <label style={styles.label}>Division / Area</label>
        <input 
          style={styles.input} 
          placeholder="Contoh: Welding Line B" 
          value={form.division}
          onChange={(e) => setForm({...form, division: e.target.value})}
        />

        <label style={styles.label}>Category</label>
        <select 
          style={styles.input}
          value={form.category}
          onChange={(e) => setForm({...form, category: e.target.value})}
        >
          <option>Logo Update</option>
          <option>Process Change</option>
          <option>New Product</option>
          <option>Safety Requirement</option>
        </select>

        <label style={styles.label}>Description</label>
        <textarea 
          style={{...styles.input, height: '80px', resize: 'none'}} 
          placeholder="Detail informasi..."
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
        />

        <button 
          style={{
            ...styles.submitBtn, 
            background: isFinding ? '#d63031' : '#0984e3'
          }}
          onClick={onSubmit}
        >
          Submit {isFinding ? "Finding" : "Request"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  formCard: { background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', flex: 1 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#2d3436' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #f1f2f6', background: '#f8f9fd', outline: 'none', fontSize: '14px' },
  submitBtn: { color: 'white', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', transition: '0.3s' }
};
