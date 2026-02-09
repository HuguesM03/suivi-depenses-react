import { useState } from 'react';

const AddTransaction = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Autre 📦'); // Valeur par défaut
  const [type, setType] = useState('expense'); // Par défaut c'est une dépense

  const onSubmit = (e) => {
    e.preventDefault();

    if (!text || !amount) {
      alert('Veuillez ajouter un titre et un montant');
      return;
    }

    // On envoie l'objet complet à App.jsx
    onAdd({
      text,
      amount: parseFloat(amount),
      category,
      type
    });

    // Réinitialisation du formulaire après l'ajout
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
          <select value={type} onChange={(e) => setType(e.target.value)}>
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