import { useState } from 'react';

export default function AddTransaction({ onAdd }) {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();

    if (text.trim() === '' || amount === 0 || amount === '') {
      alert("Veuillez entrer un nom et un montant valide");
      return;
    }

    // LOGIQUE SMART : On définit quelles catégories sont des dépenses par défaut
    const expenseCategories = ['Nourriture', 'Loyer', 'Loisirs', 'Transport', 'Santé', 'Netflix', 'Canal+', 'Amazon/prime', 'Spotify', 'Internet',];
    
    let finalAmount = parseFloat(amount);

    // Si la catégorie est une dépense et que l'utilisateur a oublié le signe "-"
    if (expenseCategories.includes(category) && finalAmount > 0) {
      finalAmount = -finalAmount;
    }

   const newTransaction = {
      text,
      amount: parseFloat(amount), // Conversion impérative en nombre
      category: 'Divers' // Optionnel : tu pourras ajouter un select plus tard
    };

    onAdd(newTransaction);
    setText('');
    setAmount('');
  };

  return (
    <>
      <h3>Ajouter une transaction</h3>
      <form onSubmit={onSubmit}>
        <div className="form-control">
          <label htmlFor="text">Nom de la transaction</label>
          <input 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Ex: Salaire, Courses..." 
          />
        </div>

        <div className="form-control">
          <label htmlFor="category">Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
           
            <option value="Nourriture">Nourriture 🍔</option>
            <option value="Loyer">Loyer 🏠</option>
            <option value="Salaire">Salaire 💰</option>
            <option value="Canal+">Canal+📺</option>
            <option value="Loyer">Netflix 📺</option>
            <option value="Amazon/prime">Amazon/prime 📦</option>
            <option value="Spotify">Spotify 🎵</option>
            <option value="Internet">Internet 🌐</option>
            <option value="Autre">Autre</option>
            <option value="Loisirs">Loisirs 🎮</option>
            <option value="Transport">Transport 🚗</option>
            <option value="Santé">Santé 💊</option>
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
          <p className="helper-text">
            💡 <strong>Indice :</strong> Il est important de mettre le signe (-) devant les montants des dépenses ex: (-150.50) pour une dépense de 150,50€.
            <br />
            💡 <strong>Auto-correction :</strong> Les catégories comme Loyer , Loisirs ou Nourriture seront enregistrées en négatif automatiquement.
          </p>
        </div>
        <button className="btn">Ajouter la transaction</button>
      </form>
    </>
  );
}