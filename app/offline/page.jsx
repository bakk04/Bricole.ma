'use client';

export default function OfflinePage() {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 text-center px-4">
      <div className="mb-4">
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-muted"
        >
          <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
        </svg>
      </div>
      <h2 className="fw-bold mb-3">Oups ! Vous êtes hors-ligne</h2>
      <p className="text-muted mb-4">
        Il semble que vous n'ayez pas de connexion Internet. 
        Vérifiez votre réseau et réessayez.
      </p>
      <button 
        className="btn btn-primary rounded-pill px-5 fw-bold"
        onClick={() => window.location.reload()}
      >
        Réessayer
      </button>
      
      <div className="mt-5 small text-muted">
        <p>Bricole.ma - Votre plateforme des artisans au Maroc</p>
      </div>
    </div>
  );
}
