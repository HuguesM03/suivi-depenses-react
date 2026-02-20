import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import Balance from './components/Balance';
import IncomeExpense from './components/IncomeExpense';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import ExpenseChart from './components/ExpenseChart';
import Legal from './components/Legal';
import Auth from './components/Auth';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [archiveList, setArchiveList] = useState([]);
  const [currentArchive, setCurrentArchive] = useState(null);
  const [currency, setCurrency] = useState('€');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const cache = useRef({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadAll();
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('realtime-transactions')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'transactions',
        filter: `user_id=eq.${session.user.id}`,
      }, (payload) => {
        const newRow = payload.new;
        const cacheKey = newRow.archive_name ?? null;
        cache.current[cacheKey] = cache.current[cacheKey]
          ? [newRow, ...cache.current[cacheKey]]
          : [newRow];
        const isCurrentView = currentArchive === cacheKey;
        if (isCurrentView) setTransactions(prev => [newRow, ...prev]);
        if (cacheKey && !archiveList.includes(cacheKey)) {
          setArchiveList(prev => [...prev, cacheKey]);
        }
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'transactions',
        filter: `user_id=eq.${session.user.id}`,
      }, (payload) => {
        const id = payload.old.id;
        Object.keys(cache.current).forEach(key => {
          cache.current[key] = cache.current[key].filter(t => t.id !== id);
        });
        setTransactions(prev => prev.filter(t => t.id !== id));
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'transactions',
        filter: `user_id=eq.${session.user.id}`,
      }, (payload) => {
        const updated = payload.new;
        const newKey = updated.archive_name ?? null;
        Object.keys(cache.current).forEach(key => {
          cache.current[key] = cache.current[key].filter(t => t.id !== updated.id);
        });
        cache.current[newKey] = cache.current[newKey]
          ? [updated, ...cache.current[newKey]]
          : [updated];
        if (newKey && !archiveList.includes(newKey)) {
          setArchiveList(prev => [...prev, newKey]);
        }
        if (currentArchive === null) {
          setTransactions(prev => prev.filter(t => t.id !== updated.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session, currentArchive, archiveList]);

  async function loadAll() {
    setInitialLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const newCache = {};
      data.forEach(t => {
        const key = t.archive_name ?? null;
        if (!newCache[key]) newCache[key] = [];
        newCache[key].push(t);
      });
      cache.current = newCache;
      setTransactions(newCache[null] || []);
      const names = Object.keys(newCache).filter(k => k !== null);
      setArchiveList(names);
    }
    setInitialLoading(false);
  }

  const handleSelectArchive = (name) => {
    const key = name ?? null;
    setCurrentArchive(key);
    setTransactions(cache.current[key] || []);
  };

  const addTransaction = async (newT) => {
    let correctedAmount = parseFloat(newT.amount);
    if (newT.type === 'expense' && correctedAmount > 0) correctedAmount = -correctedAmount;
    else if (newT.type === 'income' && correctedAmount < 0) correctedAmount = Math.abs(correctedAmount);

    const { error } = await supabase.from('transactions').insert([{
      text: newT.text,
      amount: correctedAmount,
      category: newT.category,
      type: newT.type,
      user_id: session.user.id,
      archive_name: null
    }]);
    if (error) alert("Erreur Cloud : " + error.message);
  };

  const handleArchiveRequest = async () => {
    if (transactions.length === 0) return;
    const name = prompt("Sous quel nom voulez-vous archiver ces données ? (ex: Janvier 2026)");
    if (!name) return;
    const { error } = await supabase.from('transactions').update({ archive_name: name }).is('archive_name', null);
    if (error) alert("Erreur lors de l'archivage");
    else alert("Données archivées avec succès !");
  };

  const deleteTransaction = async (id) => {
    if (window.confirm("Supprimer définitivement cette transaction ?")) {
      await supabase.from('transactions').delete().eq('id', id);
    }
  };

  const handleClearRequest = async () => {
    if (transactions.length === 0) return;
    const wantsToArchive = window.confirm("Voulez-vous ARCHIVER ces données avant de les supprimer ?\n\n(OK pour Archiver / Annuler pour supprimer définitivement)");
    if (wantsToArchive) { handleArchiveRequest(); return; }
    const target = currentArchive ? `l'archive "${currentArchive}"` : "l'historique actuel";
    if (window.confirm(`⚠️ ATTENTION : Vous allez SUPPRIMER DÉFINITIVEMENT toutes les données de ${target}. Continuer ?`)) {
      let query = supabase.from('transactions').delete();
      query = currentArchive ? query.eq('archive_name', currentArchive) : query.is('archive_name', null);
      await query.neq('id', 0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    cache.current = {};
    setTransactions([]);
    setArchiveList([]);
  };

  if (!session) return <Auth />;

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Synchronisation Cloud...</p>
      </div>
    );
  }

  return (
    <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      <button className="toggle-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>

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
          <button onClick={() => handleSelectArchive(null)} style={{width: '100%', padding: '10px', marginBottom: '10px', backgroundColor: currentArchive === null ? '#2ecc71' : '#34495e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
            🏠 Vue Actuelle
          </button>
          <div style={{maxHeight: '30vh', overflowY: 'auto', marginBottom: '15px'}}>
            {archiveList.map(name => (
              <button key={name} onClick={() => handleSelectArchive(name)} style={{width: '100%', padding: '8px', marginBottom: '5px', backgroundColor: currentArchive === name ? '#3498db' : 'transparent', color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', display: 'block'}}>
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

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="€">Euro (€)</option>
              <option value="$">Dollar ($)</option>
              <option value="FCFA">FCFA</option>
            </select>
          </div>

          <Balance transactions={transactions} currency={currency} />
          <IncomeExpense transactions={transactions} currency={currency} />
          <ExpenseChart transactions={transactions} currency={currency} />
          <TransactionList
            transactions={transactions}
            onDelete={deleteTransaction}
            onClear={handleClearRequest}
            currency={currency}
          />
          {!currentArchive && <AddTransaction onAdd={addTransaction} />}

          <footer style={{ marginTop: '50px', textAlign: 'center', opacity: 0.7 }}>
            <p><em>Propulsé par Supabase © 2026 Expense-Tracker</em> | <strong>Hugues_Manøng 🏴‍☠️</strong></p>
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
