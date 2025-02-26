import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { Form } from 'react-bootstrap';

const VisualizationSection = ({ students, chartCategory, setChartCategory }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const visualizationCategories = ['course', 'ageDistribution', 'yearLevel', 'college'];

  useEffect(() => {
    updateChart();
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [students, chartCategory]);

  const updateChart = () => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');

    let labels = [];
    let data = [];
    let backgroundColors = [];
    let datasets = [];

    switch (chartCategory) {
      case 'course':
        const courseCounts = countOccurrences(students, 'course');
        labels = Object.keys(courseCounts);
        data = Object.values(courseCounts);
        backgroundColors = generateColors(labels.length);
        break;

      case 'ageDistribution': {
        const ageBins = [
          { range: '16-18', min: 16, max: 18 },
          { range: '19-21', min: 19, max: 21 },
          { range: '22-24', min: 22, max: 24 },
          { range: '25-27', min: 25, max: 27 },
          { range: '28+', min: 28, max: 100 }
        ];

        labels = ageBins.map(bin => bin.range);
        data = labels.map(() => 0); // Initialize counts

        students.forEach(student => {
          const age = student.age;
          for (let i = 0; i < ageBins.length; i++) {
            if (age >= ageBins[i].min && age <= ageBins[i].max) {
              data[i] += 1;
              break;
            }
          }
        });

        backgroundColors = generateColors(labels.length);
        break;
      }

      case 'yearLevel':
        const yearCounts = countOccurrences(students, 'yearLevel');
        labels = Object.keys(yearCounts);
        data = Object.values(yearCounts);
        backgroundColors = generateColors(labels.length);
        break;

      case 'college':
        const collegeCounts = countOccurrences(students, 'college');
        labels = Object.keys(collegeCounts);
        data = Object.values(collegeCounts);
        backgroundColors = generateColors(labels.length);
        break;

      default:
        return;
    }

    chartInstance.current = new Chart(ctx, {
      type: chartCategory === 'ageDistribution' ? 'bar' : 'pie',
      data: {
        labels,
        datasets: [{
          label: `Student ${chartCategory} Distribution`,
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const value = tooltipItem.raw;
                const total = data.reduce((acc, val) => acc + val, 0);
                const percentage = ((value / total) * 100).toFixed(2);
                return `${tooltipItem.label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        scales: chartCategory === 'ageDistribution' ? {
          x: { stacked: false },
          y: { stacked: false, beginAtZero: true }
        } : {}
      }
    });
  };

  const countOccurrences = (data, key) => {
    return data.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {});
  };

  const generateColors = (count) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      '#FF4D6D', '#3B8BEB', '#FFEB33', '#42B6A5', '#AA7FFF', '#FF6E2D',
      '#1F75FE', '#B1D0E0', '#E20000', '#8C48AC', '#FF6C4D', '#63D2E6',
      '#A9D18E', '#D9534F', '#5E5D8C', '#9A32B3', '#F7A400', '#34C3EB'
    ];

    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  return (
    <div className="chart-container mt-4 p-3 border rounded bg-light" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <h5>Student Data Visualization</h5>
      <div className="mb-3">
        <Form.Select value={chartCategory} onChange={(e) => setChartCategory(e.target.value)}>
          {visualizationCategories.map(attr => <option key={attr} value={attr}>{attr}</option>)}
        </Form.Select>
      </div>
      <canvas ref={chartRef} className="w-100" style={{ height: '350px' }}></canvas>
    </div>
  );
};

export default VisualizationSection;
