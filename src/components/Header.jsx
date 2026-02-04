import { useState, useEffect } from 'react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2>Mon Suivi De Dépenses</h2>
  
<button 
  className="header-btn" 
  onClick={() => setDarkMode(!darkMode)}
  style={{ width: 'auto', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', border: 'none' }}
>
  {darkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
</button>
    </div>
  )
}