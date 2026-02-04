import { useState, useEffect } from 'react';
import Header from './components/Header';
import Balance from './components/Balance';
import IncomeExpense from './components/IncomeExpense';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import ExpenseChart from './components/ExpenseChart'; 
import Legal from './components/Legal'; // Import du nouveau composant
import './App.css';

function App() {
  // --- ÉTATS (STATES) ---
  const [transactions, setTransactions] = useState(JSON.parse(localStorage.getItem('transactions')) || []);
  const [archives, setArchives] = useState(JSON.parse(localStorage.getItem('archives')) || []);
  const [currency, setCurrency] = useState('€');
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLegalOpen, setIsLegalOpen] = useState(false); // État pour la modale légale

  // --- PERSISTENCE (LOCALSTORAGE) ---
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('archives', JSON.stringify(archives));
  }, [transactions, archives]);

  // --- ACTIONS ---
  const addTransaction = (t) => setTransactions([...transactions, t]);

  const deleteTransaction = (id) => {
    if (window.confirm("Supprimer cette transaction ?")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleClearRequest = () => {
    if (transactions.length === 0) return;
    if (window.confirm("Voulez-vous vraiment vider tout l'historique ?")) {
      const wantToArchive = window.confirm("Souhaitez-vous ARCHIVER ces données avant de supprimer ?");
      if (wantToArchive) {
        const newArchive = {
          id: Date.now(),
          date: new Date().toLocaleString(),
          data: [...transactions],
          totalAmount: transactions.reduce((acc, item) => (acc += item.amount), 0).toFixed(2)
        };
        setArchives([newArchive, ...archives]);
      }
      setTransactions([]);
    }
  };

  const deleteArchive = (id, e) => {
    e.stopPropagation(); 
    if (window.confirm("Supprimer définitivement cette archive ?")) {
      setArchives(archives.filter(a => a.id !== id));
      if (selectedArchive?.id === id) setSelectedArchive(null);
    }
  };

  return (
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      
      {/* BOUTON TOGGLE SIDEBAR */}
      <button className="toggle-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕ Fermer' : '☰ Archives'}
      </button>

      {/* BARRE LATÉRALE (ARCHIVES) */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '50px', paddingBottom: '20px'}}>
           <h3>Archives</h3>
           {selectedArchive && <button onClick={() => setSelectedArchive(null)} className="header-btn" style={{fontSize: '0.7rem'}}>Retour</button>}
        </div>
        {archives.length === 0 ? <p style={{opacity: 0.5, fontSize: '0.8rem'}}>Aucune archive enregistrée.</p> : 
          archives.map(archive => (
            <div key={archive.id} className={`archive-item ${selectedArchive?.id === archive.id ? 'active' : ''}`} onClick={() => setSelectedArchive(archive)}>
              <strong>{archive.date}</strong>
              <p>{archive.data.length} transactions</p>
              <p style={{fontSize: '0.7rem', color: '#2ecc71'}}>Bilan: {archive.totalAmount}{currency}</p>
              <button onClick={(e) => deleteArchive(archive.id, e)} className="delete-archive-btn">×</button>
            </div>
          ))
        }
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="main-content">
        <Header />
        
        <div className="container">
          {selectedArchive ? (
            /* VUE ARCHIVE */
            <div className="archive-view">
              <button onClick={() => setSelectedArchive(null)} className="btn-submit" style={{backgroundColor: '#34495e', marginBottom: '20px'}}>
                ← Retour au suivi actuel
              </button>
              <h3 style={{textAlign: 'center', margin: '20px 0'}}>Archive du {selectedArchive.date}</h3>
              <Balance transactions={selectedArchive.data} currency={currency} />
              <IncomeExpense transactions={selectedArchive.data} currency={currency} />
              <ExpenseChart transactions={selectedArchive.data} />
              <TransactionList transactions={selectedArchive.data} onDelete={() => {}} onClear={() => {}} currency={currency} />
            </div>
          ) : (
            /* VUE ACTUELLE */
            <>
              <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <label style={{marginRight: '10px'}}>Dispositif : </label>
                <select style={{width: 'auto', display: 'inline-block'}} value={currency} onChange={(e) => setCurrency(e.target.value)}>
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

          {/* FOOTER AVEC LIEN LÉGAL */}
          <footer style={{ marginTop: '60px', paddingBottom: '40px', textAlign: 'center', opacity: 0.6 }}>
             <p style={{marginBottom: '10px'}}>Copyright <strong>2026, Hugues_Manøng / ExpenseTracker.</strong></p>
            <button 
              onClick={() => setIsLegalOpen(true)} 
              className="legal-link"
            >
              Mentions Légales & Confidentialité
            </button>
          </footer>
        </div>
      </div>

      {/* COMPOSANT MODALE LÉGALE */}
      <Legal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </div>
  );
}

export default App;