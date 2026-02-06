import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else if (isSignUp) alert('Vérifiez vos emails pour confirmer l’inscription !');
    setLoading(false);
  };

  return (
    <div className="auth-container" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{isSignUp ? 'Créer un compte' : 'Connexion'}</h2>
      <form onSubmit={handleAuth}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={loading} className="btn-submit">
          {loading ? 'Chargement...' : isSignUp ? 'S’inscrire' : 'Se connecter'}
        </button>
      </form>
      <p onClick={() => setIsSignUp(!isSignUp)} style={{ cursor: 'pointer', color: '#3498db', marginTop: '10px' }}>
        {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
      </p>
    </div>
  );
}