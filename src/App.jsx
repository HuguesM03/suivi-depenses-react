import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
      console.error('Erreur de chargement:', error.message);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }

  const addTransaction = async (newT) => {
    // Note : On n'envoie PAS d'ID ici.
    const { data, error } = await supabase
      .from('transactions')
      .insert([newT]) // Supabase gère l'ID, created_at, etc.
      .select();

    if (error) {
      console.error("Détails de l'erreur SQL:", error);
      alert("Erreur de base de données : " + error.message);
    } else if (data) {
      setTransactions([data[0], ...transactions]);
    }
  };

  const deleteTransaction = async (id) => {
    if (window.confirm("Supprimer définitivement cette transaction ?")) {
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

  const handleClearRequest = async () => {
    if (transactions.length === 0) return;
    if (window.confirm("Voulez-vous vraiment vider tout l'historique cloud ?")) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .neq('id', 0); 

      if (!error) setTransactions([]);
    }
  };

  return (
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      <button className="toggle-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div style={{marginTop: '60px', padding: '20px'}}>
           <h3>Menu</h3>
           <p style={{fontSize: '0.8rem', color: '#2ecc71'}}>● Cloud Synchronisé</p>
        </div>
      </div>

      <div className="main-content">
        <Header />
        <div className="container">
          {loading ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>Synchronisation...</p>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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
          <footer style={{ marginTop: '50px', textAlign: 'center', opacity: 0.7 }}>
            <p>Propulsé par Supabase | <strong>Hugues_Manøng 🏴‍☠️</strong></p>
            <button onClick={() => setIsLegalOpen(true)} className="legal-link">
              Légal & Contact
            </button>
          </footer>
        </div>
      </div>
      <Legal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </div>
  );
}

export default App;