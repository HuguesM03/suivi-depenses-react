export default function Balance({ transactions, currency }) {
  const amounts = transactions.map(transaction => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

  return (
    <>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: total >= 0 ? '#000' : '#e74c3c' }}>
      <h4>Votre Solde</h4>
      
      <h1>{total}{currency}</h1>
    </div>
    </>
    
  )
}