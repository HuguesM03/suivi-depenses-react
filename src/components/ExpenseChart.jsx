import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ExpenseChart = ({ transactions }) => {
  // 1. Filtrer les dépenses uniquement
  const expenses = transactions.filter(t => t.amount < 0);

  // 2. Calculer le total des dépenses pour le calcul des %
  const totalExpenses = expenses.reduce((acc, current) => acc + Math.abs(current.amount), 0);

  // 3. Regrouper et additionner par catégorie
  const dataMap = expenses.reduce((acc, current) => {
    const category = current.category || 'Autre 📦';
    const amount = Math.abs(current.amount);
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  // 4. Formater les données
  const chartData = Object.keys(dataMap).map(category => ({
    name: category,
    value: parseFloat(dataMap[category].toFixed(2)),
    // Calcul du pourcentage individuel
    percentage: ((dataMap[category] / totalExpenses) * 100).toFixed(1)
  }));

  const COLORS = ['#FF4D6D', '#0088FE', '#FFBB28', '#00C49F', '#FF8042', '#9b59b6'];

  if (chartData.length === 0) return null;

  return (
    <div style={{ width: '100%', height: 450, marginTop: '20px' }}>
      <h3 style={{ textAlign: 'center', fontSize: '1.2rem', color: '#333', fontWeight: 'bold' }}>
        Répartition des dépenses
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={100} // Création de l'effet "Donut" (trou central)
            outerRadius={150} // Taille "grosse" pour ton écran
            paddingAngle={5}  // Espace entre les tranches pour éviter l'entremêlement
            dataKey="value"
            label={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          
          {/* Tooltip personnalisé avec Montant + Pourcentage */}
          <Tooltip 
            formatter={(value, name, props) => [
              `${value.toFixed(2)} € (${props.payload.percentage}%)`, 
              name
            ]}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              padding: '10px'
            }}
          />
          
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: '30px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;