'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Vérification de votre compte en cours...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Jeton de vérification manquant.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await axios.get(`/api/auth/verify?token=${token}`);
                if (res.data.success) {
                    setStatus('success');
                    setMessage('Votre compte a été activé avec succès !');
                } else {
                    setStatus('error');
                    setMessage(res.data.message || 'Échec de la vérification.');
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Une erreur est survenue lors de la vérification.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '20px',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                maxWidth: '450px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ color: '#3b82f6', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                        bricole<span style={{ color: '#1e293b' }}>.ma</span>
                    </h1>
                </div>

                {status === 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Loader2 size={48} color="#3b82f6" className="animate-spin" style={{ marginBottom: '16px' }} />
                        <p style={{ color: '#4b5563', fontSize: '18px' }}>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ backgroundColor: '#dcfce7', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                            <CheckCircle2 size={48} color="#22c55e" />
                        </div>
                        <h2 style={{ color: '#1e293b', fontSize: '22px', marginBottom: '8px' }}>Félicitations !</h2>
                        <p style={{ color: '#4b5563', fontSize: '16px', marginBottom: '32px' }}>{message}</p>
                        <Link href="/login" style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}>
                            Se connecter <ArrowRight size={18} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                            <XCircle size={48} color="#ef4444" />
                        </div>
                        <h2 style={{ color: '#1e293b', fontSize: '22px', marginBottom: '8px' }}>Oups !</h2>
                        <p style={{ color: '#4b5563', fontSize: '16px', marginBottom: '32px' }}>{message}</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Link href="/" style={{
                                backgroundColor: '#f1f5f9',
                                color: '#4b5563',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Home size={18} /> Accueil
                            </Link>
                            <Link href="/register" style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}>
                                Réessayer
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 2s linear infinite;
                }
            `}</style>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
