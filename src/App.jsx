import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import Balance from './components/Balance';
import IncomeExpense from './components/IncomeExpense';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import ExpenseChart from './components/ExpenseChart'; 
import Legal from './components/Legal';
import Auth from './components/Auth';
import Profile from './components/Profile'; // Nouveau composant Profil
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [archiveList, setArchiveList] = useState([]);
  const [currentArchive, setCurrentArchive] = useState(null);
  const [currency, setCurrency] = useState('€');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // État pour le Profil
  const [loading, setLoading] = useState(true);

  // 1. Gestion de la session et de l'authentification
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  },);

  // 2. Chargement des données au démarrage si l'utilisateur est connecté
  useEffect(() => {
    if (session) {
      fetchArchiveNames();
      fetchTransactions();
    }
  }, [session, cite, 3]);

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

  async function fetchTransactions(archiveName = null) {
    setLoading(true);
    let query = supabase.from('transactions').select('*');
    
    if (archiveName) {
      query = query.eq('archive_name', archiveName);
    } else {
      query = query.is('archive_name', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error) {
      setTransactions(data || []);
      setCurrentArchive(archiveName);
    }
    setLoading(false);
  }

  const addTransaction = async (newT) => {
    // Liaison automatique à l'utilisateur connecté
    const transactionWithUser = { ...newT, user_id: session.user.id };
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionWithUser]) 
      .select();

    if (error) {
      alert("Erreur : " + error.message);
    } else if (data && !currentArchive) {
      setTransactions([data[0], ...transactions]);
    }
  };

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
      fetchTransactions();
    }
  };

  const deleteTransaction = async (id) => {
    if (window.confirm("Supprimer définitivement cette transaction ?")) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // 3. Double sécurité pour vider l'historique cloud
  const handleClearRequest = async () => {
    if (transactions.length === 0) return;

    const wantsToArchive = window.confirm(
      "Voulez-vous ARCHIVER ces données avant de les supprimer de la vue actuelle ?\n\n(OK pour Archiver / Annuler pour passer à la suppression définitive)"
    );

    if (wantsToArchive) {
      handleArchiveRequest(); 
      return;
    }

    const target = currentArchive ? `l'archive "${currentArchive}"` : "l'historique actuel";
    if (window.confirm(`⚠️ ATTENTION : Vous allez SUPPRIMER DÉFINITIVEMENT toutes les données de ${target}. Continuer ?`)) {
      setLoading(true);
      let query = supabase.from('transactions').delete();
      currentArchive ? query.eq('archive_name', currentArchive) : query.is('archive_name', null);
      
      const { error } = await query.neq('id', 0); 
      if (!error) {
        setTransactions([]);
        if (currentArchive) {
          fetchArchiveNames();
          setCurrentArchive(null);
          fetchTransactions();
        }
        alert("L'historique a été vidé.");
      }
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTransactions([]);
    setArchiveList([]);
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      <button className="toggle-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* SIDEBAR MIS À JOUR */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div style={{marginTop: '60px', padding: '20px'}}>
           <h3 style={{color: '#fff', fontSize: '0.9rem', wordBreak: 'break-all'}}>👤 {session.user.email}</h3>
           
           <button onClick={() => setIsProfileOpen(true)} style={{width: '100%', padding: '8px', marginBottom: '10px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
             ⚙️ Paramètres Profil
           </button>

           <button onClick={handleLogout} style={{width: '100%', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px'}}>
             Déconnexion
           </button>
           
           <hr style={{opacity: 0.3}}/>
           
           <h3 style={{color: '#fff'}}>📂 Archives Cloud</h3>
           <button onClick={() => fetchTransactions(null)} style={{width: '100%', padding: '10px', marginBottom: '10px', backgroundColor: !currentArchive ? '#2ecc71' : '#34495e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
             🏠 Vue Actuelle
           </button>

           <div style={{maxHeight: '30vh', overflowY: 'auto', marginBottom: '15px'}}>
             {archiveList.map(name => (
               <button key={name} onClick={() => fetchTransactions(name)} style={{width: '100%', padding: '8px', marginBottom: '5px', backgroundColor: currentArchive === name ? '#3498db' : 'transparent', color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', display: 'block'}}>
                 📄 {name}
               </button>
             ))}
           </div>

           <button onClick={handleArchiveRequest} style={{width: '100%', padding: '10px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
             📥 Archiver le mois
           </button>
        </div>
      </div>

      <div className="main-content">
        <Header />
        <div className="container">
          <h2 style={{textAlign: 'center', color: '#3498db', fontSize: '1.2rem', marginBottom: '20px'}}>
            {currentArchive ? `🗂️ Archive : ${currentArchive}` : "📝 Transactions Actuelles"}
          </h2>

          {loading ? (
            <p style={{textAlign: 'center', marginTop: '20px'}}>Synchronisation Cloud...</p>
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
            <p><em>Propulsé par Supabase © 2026</em> | <strong>Hugues_Manøng 🏴‍☠️</strong></p>
            <button onClick={() => setIsLegalOpen(true)} className="legal-link">Légal & Contact</button>
          </footer>
        </div>
      </div>
      <Legal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
      {isProfileOpen && <Profile session={session} onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}

export default App;