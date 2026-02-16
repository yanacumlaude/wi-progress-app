import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartWI = ({ data }) => {
  // Menghitung jumlah Bagus vs Rusak dari data Supabase
  const bagus = data.filter(item => item.condition === 'Bagus').length;
  const rusak = data.filter(item => item.condition === 'Rusak').length;

  const chartData = {
    labels: ['Bagus', 'Rusak'],
    datasets: [
      {
        data: [bagus, rusak],
        backgroundColor: ['#05CD99', '#EE5D50'], // Hijau & Merah
        hoverBackgroundColor: ['#04b386', '#d6453a'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: '250px', marginTop: '10px' }}>
      {data.length > 0 ? (
        <Pie data={chartData} options={options} />
      ) : (
        <p style={{ textAlign: 'center', color: '#A3AED0' }}>Menunggu data...</p>
      )}
    </div>
  );
};

export default PieChartWI;