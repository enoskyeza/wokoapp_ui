// components/Dashboard/AgeCategoryChart.tsx
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AgeCategoryChart = () => {
  const data = {
    labels: ['3-7', '8-12', '13-17'],
    datasets: [
      {
        label: 'Participants',
        data: [3, 5, 4], // Example data, adjust based on participants array
        backgroundColor: ['#2ecc71', '#f1c40f', '#9b59b6'],
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">Age Category Distribution</h3>
      <Bar data={data} />
    </div>
  );
};

export default AgeCategoryChart;
