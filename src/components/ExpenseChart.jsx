import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseChart({ transactions }) {
  // On ne prend que les dépenses (montants négatifs)
  const expenses = transactions.filter(t => t.amount < 0);
  
  // On regroupe par catégorie
  const categories = {};
  expenses.forEach(t => {
    // On extrait la catégorie du texte "Nom (Catégorie)"
    const match = t.text.match(/\(([^)]+)\)/);
    const cat = match ? match[1] : 'Autre';
    
    categories[cat] = (categories[cat] || 0) + Math.abs(t.amount);
  });

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: 'Dépenses par catégorie',
        data: Object.values(categories),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.body.classList.contains('dark-theme') ? '#fff' : '#333'
        }
      }
    }
  };

  if (expenses.length === 0) return null;

  return (
    <div style={{ margin: '30px 0', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Répartition des dépenses</h4>
      <Pie data={data} options={options} />
    </div>
  );
}