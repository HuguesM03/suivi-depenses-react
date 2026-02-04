import React from 'react';

export default function Legal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header style={{ borderBottom: '1px solid #ddd', marginBottom: '15px', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>⚖️ Mentions Légales</h2>
        </header>
        
        <div style={{ maxHeight: '70vh', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
          <h3>1. Confidentialité</h3>
          <p>
            Toutes vos données financières sont stockées exclusivement dans le <strong>localStorage</strong> de votre navigateur. 
            Aucune information n'est transmise à un serveur tiers ou au créateur de l'application.
          </p>

          <h3>2. Éditeur du site</h3>
          <p>
            Cette application est un projet personnel développé par <strong>Hugues_Manøng 🏴‍☠️</strong>.
          </p>

          <h3>3. Responsabilité</h3>
          <p>
            L'utilisateur est responsable de la gestion de ses données. La suppression du cache du navigateur entraînera la perte définitive des transactions enregistrées.
          </p>

          
          <h3>4. Contact</h3>
<p>
  Pour toute question ou suggestion : <br />
  📧 <a 
       href="mailto:huguesmanong23@gmail.com?subject=Contact%20Suivi%20de%20Dépenses" 
       style={{ 
         color: 'var(--primary-color)', 
         fontWeight: 'bold',
         textDecoration: 'none' 
       }}
     >
       huguesmanong23@gmail.com
     </a>
</p>
        </div>

        <button className="btn-submit" onClick={onClose} style={{ marginTop: '20px' }}>
          Fermer
        </button>
      </div>
    </div>
  );
}