// GANTI ISI StatCard.jsx JADI INI:
export default function StatCard({ title, value, color, icon: Icon }) {
  return (
    <div style={{
      flex: 1,
      background: color,
      padding: '20px',
      borderRadius: '20px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }}>
      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
        {/* DISINI KUNCINYA: Pakai <Icon /> (Huruf besar dan tag komponen) */}
        {Icon && <Icon size={24} />} 
      </div>
      <div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
      </div>
    </div>
  );
}