import React from 'react';
import { Bar } from 'react-chartjs-2';

const ChartComponent = ({ data }) => {
  const chartData = {
    labels: data.map(student => student.name),
    datasets: [
      {
        label: 'Student Age',
        data: data.map(student => student.age),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }
    ]
  };

  return <Bar data={chartData} />;
};

export default ChartComponent;
