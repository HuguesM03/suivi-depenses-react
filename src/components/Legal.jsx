import React from 'react';

export default function Legal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header style={{ borderBottom: '1px solid #ddd', marginBottom: '15px', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>⚖️ Mentions Légales</h2>
          <span title="Données synchronisées dans le cloud" style={{ fontSize: '1.2rem' }}>☁️</span>
        </header>
        
        <div style={{ maxHeight: '70vh', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
          <h3>1. Confidentialité & Stockage</h3>
          <p>
            Vos données financières sont stockées de manière sécurisée dans une base de données cloud (**Supabase**). 
            Contrairement au stockage local, vos informations sont conservées même si vous videz le cache de votre navigateur ou si vous changez d'appareil.
          </p>

          <h3>2. Éditeur du site</h3>
          <p>
            Cette application est un projet personnel développé par <strong>Hugues_Manøng 🏴‍☠️</strong>.
          </p>

          <h3>3. Sécurité des données</h3>
          <p>
            Bien que les données soient stockées à distance, elles restent liées à votre session actuelle. L'éditeur s'engage à ne pas vendre ni analyser vos données personnelles à des fins commerciales.
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