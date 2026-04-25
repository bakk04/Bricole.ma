'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ color: '#ef4444' }}>Erreur d'authentification</h1>
      <p style={{ margin: '15px 0', fontSize: '1.1rem' }}>
        {error === 'AccessDenied'
          ? "L'accès a été refusé. Cela peut arriver si vous avez annulé la connexion ou si une erreur est survenue lors de la création de votre compte."
          : "Une erreur est survenue lors de la tentative de connexion."}
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link href="/login" style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: '500'
        }}>
          Retour à la page de connexion
        </Link>
      </div>
      <p style={{ marginTop: '30px', color: '#64748b', fontSize: '0.875rem' }}>
        Code d'erreur: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{error}</code>
      </p>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
