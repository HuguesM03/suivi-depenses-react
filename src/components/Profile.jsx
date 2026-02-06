import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Profile({ session, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) alert(error.message);
    else {
      alert('Mot de passe mis à jour avec succès !');
      setNewPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>👤 Mon Profil</h2>
        <p><strong>Email :</strong> {session.user.email}</p>
        
        <hr style={{ margin: '20px 0', opacity: 0.2 }} />
        
        <h3>Modifier le mot de passe</h3>
        <form onSubmit={handleUpdatePassword}>
          <input 
            type="password" 
            placeholder="Nouveau mot de passe" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button disabled={loading} className="btn-submit">
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </form>
        
        <button onClick={onClose} className="btn-secondary" style={{ marginTop: '20px', width: '100%' }}>
          Fermer
        </button>
      </div>
    </div>
  );
}