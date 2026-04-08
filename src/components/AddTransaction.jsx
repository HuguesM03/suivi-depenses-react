import { useState, useEffect } from 'react';

const AddTransaction = ({ onAdd, transactions = [] }) => {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Autre 📦'); 
  const [type, setType] = useState('expense');

  const hasIncome = transactions.some(t => t.amount > 0);

  useEffect(() => {
    if (!hasIncome && type === 'expense') {
      setType('income');
      setCategory('Salaire 💰');
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!text || !amount) {
      alert('Veuillez ajouter un titre et un montant');
      return;
    }

    if (!hasIncome && type === 'expense') {
      alert('⚠️ La première transaction doit être un REVENU avant de pouvoir effectuer des dépenses.');
      return;
    }

    if (type === 'expense' && category === 'Salaire 💰') {
      alert('La catégorie "Salaire" n\'est pas compatible avec une dépense. Veuillez sélectionner "Revenu" comme type.');
      return;
    }

    onAdd({
      text,
      amount: parseFloat(amount),
      category,
      type
    });

    setText('');
    setAmount('');
    setCategory('Autre 📦');
  };

  return (
    <div className="add-transaction-container">
      <h3>Ajouter une nouvelle transaction</h3>
      <form onSubmit={onSubmit}>
        <div className="form-control">
          <label htmlFor="text">Titre</label>
          <input 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Ex: Salaire, Course, Loyer..." 
          />
        </div>

        <div className="form-control">
          <label htmlFor="type">Type de transaction</label>
          <select value={type} onChange={(e) => {
            if (e.target.value === 'expense' && !hasIncome) {
              alert('⚠️ La première transaction doit être un REVENU avant de pouvoir effectuer des dépenses.');
              return;
            }
            setType(e.target.value);
            if (e.target.value === 'income') {
              setCategory('Salaire 💰');
            } else {
              setCategory('Autre 📦');
            }
          }}>
            <option value="expense">Dépense 💸</option>
            <option value="income">Revenu 💰</option>
          </select>
        </div>

        <div className="form-control">
          <label htmlFor="category">Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Salaire 💰">Salaire 💰</option>
            <option value="Loisirs 🎮">Loisirs 🎮</option>
            <option value="Canal + 📺">Canal + 📺</option>
            <option value="Netflix 🎬">Netflix 🎬</option>
            <option value="Spotify 🎵">Spotify 🎵</option>
            <option value="Nourriture 🍕">Nourriture 🍕</option>
            <option value="Loyer 🏠">Loyer 🏠</option>
            <option value="Santé 🏥">Santé 🏥</option>
            <option value="Transport 🚗">Transport 🚗</option>
            <option value="Cadeau 🎁">Cadeau 🎁</option>
            <option value="Autre 📦">Autre 📦</option>
          </select>
        </div>

        <div className="form-control">
          <label htmlFor="amount">Montant</label>
          <input 
            type="number" 
            step="0.01"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Entrez le montant..." 
          />
          <small>
            {type === 'expense' 
              ? "💡 Le signe (-) sera ajouté automatiquement." 
              : "💡 Le montant sera enregistré en positif."}
          </small>
        </div>

        <button className="btn-submit">Ajouter la transaction</button>
      </form>
    </div>
  );
};

export default AddTransaction;