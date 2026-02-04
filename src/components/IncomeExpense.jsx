export default function IncomeExpense({ transactions, currency }) {
  const amounts = transactions.map(t => t.amount);

  const income = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);

  const expense = (
    amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1
  ).toFixed(2);

  return (
    <div className="inc-exp-container">
      <div>
        <h4>Revenus</h4>
        <p className="money plus">+{income}{currency}</p>
      </div>
      <div>
        <h4>Dépenses</h4>
        <p className="money minus">-{expense}{currency}</p>
      </div>
    </div>
  );
}