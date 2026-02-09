import { useState } from 'react';

export default function TransactionList({ transactions, onDelete, onClear, currency }) {
  const [filter, setFilter] = useState('');

  // Logique pour filtrer les transactions par nom
  const filteredTransactions = transactions.filter(t => 
    t.text.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '10px' 
      }}>
        <h3>Historique</h3>
        {/* Afficher le bouton "Vider tout" uniquement s'il y a des transactions */}
        {transactions.length > 0 && (
          <button 
            onClick={onClear} 
            style={{ 
              width: 'auto', 
              background: '#e74c3c', 
              color: 'white',
              padding: '5px 12px', 
              fontSize: '0.75rem',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Vider tout
          </button>
        )}
      </div>

      {/* Barre de recherche */}
      <input 
        type="text" 
        placeholder="Rechercher une transaction..." 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ 
          marginBottom: '15px', 
          width: '100%', 
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ddd',
          boxSizing: 'border-box'
        }}
      />

<ul className="list">
  {filteredTransactions.map(transaction => (
    <li key={transaction.id} className={transaction.amount < 0 ? 'minus' : 'plus'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <span>
          {transaction.text} <small style={{ opacity: 0.6 }}>({transaction.category})</small>
        </span>
        <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>
          {transaction.amount < 0 ? '-' : '+'}{Math.abs(transaction.amount).toFixed(2)}{currency}
        </span>
      </div>
      <button onClick={() => onDelete(transaction.id)} className="delete-btn">x</button>
    </li>
  ))}
</ul>

      {/* Message si la recherche ne donne rien ou si la liste est vide */}
      {filteredTransactions.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#888', marginTop: '10px' }}>
          {transactions.length === 0 ? "Aucune transaction enregistrée." : "Aucun résultat pour cette recherche."}
        </p>
      )}
    </>
  );
}