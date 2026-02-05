import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // On importe la connexion
import Header from './components/Header';
import Balance from './components/Balance';
import IncomeExpense from './components/IncomeExpense';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import ExpenseChart from './components/ExpenseChart'; 
import Legal from './components/Legal';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState('€');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- CHARGEMENT INITIAL (Lecture BDD) ---
  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase:', error.message);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }

  // --- AJOUTER UNE TRANSACTION ---
  const addTransaction = async (newT) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ 
        text: newT.text, 
        amount: newT.amount,
        category: newT.category || 'Divers' 
      }])
      .select();

    if (error) {
      alert("Erreur lors de l'envoi : " + error.message);
    } else {
      setTransactions([data[0], ...transactions]);
    }
  };

  // --- SUPPRIMER UNE TRANSACTION ---
  const deleteTransaction = async (id) => {
    if (window.confirm("Supprimer définitivement de la base de données ?")) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Erreur lors de la suppression");
      } else {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    }
  };

  // --- VIDER TOUT ---
  const handleClearRequest = async () => {
    if (transactions.length === 0) return;
    if (window.confirm("Voulez-vous vraiment vider TOUTES les données du cloud ?")) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .neq('id', 0); // Supprime tout

      if (!error) setTransactions([]);
    }
  };

  return (
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      
      <button className="toggle-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕ Fermer' : '☰ Archives'}
      </button>

      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div style={{marginTop: '50px', padding: '20px'}}>
           <h3>Menu</h3>
           <p style={{fontSize: '0.8rem', color: '#2ecc71'}}>● Connecté au Cloud</p>
        </div>
      </div>

      <div className="main-content">
        <Header />
        
        <div className="container">
          {loading ? (
            <div style={{textAlign: 'center', padding: '20px'}}>
              <p>Chargement de vos finances sécurisées...</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <label>Devise : </label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="€">Euro (€)</option>
                  <option value="$">Dollar ($)</option>
                  <option value="FCFA">FCFA</option>
                </select>
              </div>

              <Balance transactions={transactions} currency={currency} />
              <IncomeExpense transactions={transactions} currency={currency} />
              <ExpenseChart transactions={transactions} />
              <TransactionList 
                transactions={transactions} 
                onDelete={deleteTransaction} 
                onClear={handleClearRequest} 
                currency={currency} 
              />
              <AddTransaction onAdd={addTransaction} />
            </>
          )}

          <footer style={{ marginTop: '60px', paddingBottom: '40px', textAlign: 'center', opacity: 0.6 }}>
            <p>Propulsé par Supabase | Créé par <strong>Hugues_Manøng 🏴‍☠️</strong></p>
            <button onClick={() => setIsLegalOpen(true)} className="legal-link">
              Mentions Légales
            </button>
          </footer>
        </div>
      </div>

      <Legal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </div>
  );
}

export default App;