import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function PieChartWI({ data, title }) {
  const COLORS = ['#4318FF', '#05CD99', '#FFB547', '#EE5D50', '#A3AED0'];

  return (
    <div style={{ 
      background: 'white', padding: '20px', borderRadius: '24px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#2b3674', fontSize: '16px' }}>{title}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie 
            data={data} 
            innerRadius={60} outerRadius={80} 
            paddingAngle={5} dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}