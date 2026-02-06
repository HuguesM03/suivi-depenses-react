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
  const [archiveList, setArchiveList] = useState([]); // Liste des dossiers d'archives
  const [currentArchive, setCurrentArchive] = useState(null); // Archive sélectionnée
  const [currency, setCurrency] = useState('€');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchiveNames();
    fetchTransactions();
  }, []);

  // 1. Récupérer les noms des archives existantes sur Supabase
  async function fetchArchiveNames() {
    const { data, error } = await supabase
      .from('transactions')
      .select('archive_name')
      .not('archive_name', 'is', null);

    if (!error && data) {
      const uniqueNames = [...new Set(data.map(item => item.archive_name))];
      setArchiveList(uniqueNames);
    }
  }

  // 2. Charger les transactions (Vue actuelle ou Archive spécifique)
  async function fetchTransactions(archiveName = null) {
    setLoading(true);
    let query = supabase.from('transactions').select('*');
    
    if (archiveName) {
      query = query.eq('archive_name', archiveName);
    } else {
      query = query.is('archive_name', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur de chargement:', error.message);
    } else {
      setTransactions(data || []);
      setCurrentArchive(archiveName);
    }
    setLoading(false);
  }

  // 3. Ajouter une transaction (uniquement sur la vue actuelle)
  const addTransaction = async (newT) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([newT]) 
      .select();

    if (error) {
      alert("Erreur : " + error.message);
    } else if (data && !currentArchive) {
      setTransactions([data[0], ...transactions]);
    }
  };

  // 4. Fonction d'archivage (pour la Sidebar et la double confirmation)
  const handleArchiveRequest = async () => {
    if (transactions.length === 0) return;
    const name = prompt("Sous quel nom voulez-vous archiver ces données ? (ex: Janvier 2026)");
    if (!name) return;

    const { error } = await supabase
      .from('transactions')
      .update({ archive_name: name })
      .is('archive_name', null);

    if (error) {
      alert("Erreur lors de l'archivage");
    } else {
      alert("Données archivées avec succès !");
      fetchArchiveNames();
      fetchTransactions(); // On vide la vue actuelle
    }
  };

  const deleteTransaction = async (id) => {
    if (window.confirm("Supprimer définitivement cette transaction ?")) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (!error) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    }
  };

  // 5. La Double Sécurité pour vider l'historique
  const handleClearRequest = async () => {
    if (transactions.length === 0) return;

    // --- ÉTAPE 1 : Proposition d'archivage ---
    const wantsToArchive = window.confirm(
      "Voulez-vous ARCHIVER ces données avant de les supprimer de la vue actuelle ?\n\n" +
      "(OK pour Archiver / Annuler pour passer à la suppression définitive)"
    );

    if (wantsToArchive) {
      handleArchiveRequest(); 
      return;
    }

    // --- ÉTAPE 2 : Confirmation de suppression définitive ---
    const targetLabel = currentArchive ? `l'archive "${currentArchive}"` : "l'historique actuel";
    const isSure = window.confirm(
      `⚠️ ATTENTION : Vous êtes sur le point de SUPPRIMER DÉFINITIVEMENT toutes les données de ${targetLabel} sur le Cloud.\n\n` +
      "Cette action est irréversible. Voulez-vous continuer ?"
    );

    if (isSure) {
      setLoading(true);
      let query = supabase.from('transactions').delete();
      
      if (currentArchive) {
        query = query.eq('archive_name', currentArchive);
      } else {
        query = query.is('archive_name', null);
      }

      const { error } = await query.neq('id', 0); 
      if (!error) {
        setTransactions([]);
        if (currentArchive) {
          fetchArchiveNames();
          setCurrentArchive(null);
          fetchTransactions();
        }
        alert("L'historique a été entièrement vidé.");
      }
      setLoading(false);
    }
  };

  return (
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      <button className="toggle-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* SIDEBAR AVEC ARCHIVES CLOUD */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div style={{marginTop: '60px', padding: '20px'}}>
           <h3 style={{color: '#fff'}}>📂 Archives Cloud</h3>
           
           <button 
             onClick={() => fetchTransactions(null)}
             style={{
               width: '100%', padding: '10px', marginBottom: '10px', 
               backgroundColor: !currentArchive ? '#2ecc71' : '#34495e',
               color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
             }}
           >
             🏠 Vue Actuelle
           </button>

           <div style={{maxHeight: '40vh', overflowY: 'auto', marginBottom: '20px'}}>
             {archiveList.map(name => (
               <button 
                 key={name}
                 onClick={() => fetchTransactions(name)}
                 style={{
                   width: '100%', padding: '8px', marginBottom: '5px', 
                   backgroundColor: currentArchive === name ? '#3498db' : 'transparent',
                   color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', display: 'block'
                 }}
               >
                 📄 {name}
               </button>
             ))}
           </div>

           <button 
             onClick={handleArchiveRequest}
             style={{width: '100%', padding: '10px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
           >
             📥 Archiver le mois actuel
           </button>
           
           <p style={{fontSize: '0.7rem', color: '#2ecc71', marginTop: '20px'}}>● Synchronisation Active</p>
        </div>
      </div>

      <div className="main-content">
        <Header />
        <div className="container">
          {/* TITRE DE LA VUE ACTUELLE */}
          <h2 style={{textAlign: 'center', color: '#3498db', fontSize: '1.2rem', marginBottom: '20px'}}>
            {currentArchive ? `🗂️ Archive : ${currentArchive}` : "📝 Transactions Actuelles"}
          </h2>

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
              {!currentArchive && <AddTransaction onAdd={addTransaction} />}
            </>
          )}
          <footer style={{ marginTop: '50px', textAlign: 'center', opacity: 0.7 }}>
            <p><em>Propulsé par Supabase © 2026 Expense-Tracker</em> | <strong>Hugues_Manøng 🏴‍☠️</strong></p>
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