export default function IncomeExpense({ transactions, currency }) {
  const amounts = transactions.map(t => t.amount);

  const incomeNumber = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0);
  const expenseNumber = amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0) * -1;

  return (
    <div className="inc-exp-container">
      <div>
        <h4>Revenus</h4>
        <p className="money plus">+{incomeNumber.toFixed(2)}{currency}</p>
      </div>
      <div>
        <h4>Dépenses</h4>
        <p className="money minus">-{expenseNumber.toFixed(2)}{currency}</p>
      </div>
    </div>
  );
}
