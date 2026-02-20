export default function Balance({ transactions, currency }) {
  const amounts = transactions.map(transaction => transaction.amount);
  const totalNumber = amounts.reduce((acc, item) => acc + item, 0);
  const totalDisplay = totalNumber.toFixed(2);

  return (
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalNumber >= 0 ? '#000' : '#e74c3c' }}>
      <h4>Votre Solde</h4>
      <h1>{totalDisplay}{currency}</h1>
    </div>
  );
}
