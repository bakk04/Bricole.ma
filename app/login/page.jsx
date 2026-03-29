'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    // États locaux pour remplacer le AuthContext
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showPw, setShowPw] = useState(false);
    const [remember, setRemember] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [logoError, setLogoError] = useState(false);

    // États pour le toast et les champs vides
    const [showToast, setShowToast] = useState(false);
    const [toastClosing, setToastClosing] = useState(false);
    const [emptyFields, setEmptyFields] = useState({ email: false, password: false });

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirection automatique si déjà connecté via NextAuth
    useEffect(() => {
        const syncAndRedirect = async () => {
            if (sessionStatus === 'authenticated' && session?.user?.urlToken) {
                const role = session.user.role;
                const urlToken = session.user.urlToken;
                const bricoleToken = session.user.bricoleToken;
                const targetPath = role === "ARTISAN" ? "/dashboard" : "/profile";

                // SYNCHRONISATION CRITIQUE : On crée le cookie auth_token avant de partir
                if (bricoleToken) {
                    try {
                        await fetch("/api/auth/google-sync", {
                            method: "POST",
                            headers: { "Authorization": `Bearer ${bricoleToken}` },
                            credentials: "include",
                        });
                    } catch (e) {
                        console.error("Erreur sync Google:", e);
                    }
                }

                router.replace(`${targetPath}/${urlToken}`);
            }
        };
        
        syncAndRedirect();
    }, [sessionStatus, session, router]);

    // Gestion de l'affichage du Toast
    useEffect(() => {
        if (error) {
            setShowToast(true);
            setToastClosing(false);

            const timer = setTimeout(() => {
                setToastClosing(true);
                setTimeout(() => {
                    setShowToast(false);
                    setError(null);
                }, 400);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        if (emptyFields[id]) {
            setEmptyFields(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérification des champs vides
        const newEmptyFields = {
            email: !formData.email.trim(),
            password: !formData.password.trim()
        };

        setEmptyFields(newEmptyFields);

        if (newEmptyFields.email || newEmptyFields.password) {
            setError("Veuillez remplir tous les champs pour vous connecter.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok || !data?.success) {
                setError(
                    data?.message ||
                    "Email ou mot de passe incorrect."
                );
                setLoading(false);
                return;
            }

            const role = data.user?.role;
            const urlToken = data.urlToken;

            const targetPath = role === "ARTISAN" ? "/dashboard" : "/profile";
            
            // On attend un peu pour que les cookies soient bien propagés en PWA
            setTimeout(() => {
                router.replace(`${targetPath}/${urlToken}`);
            }, 100);
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError("Erreur serveur lors de la connexion.");
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className={styles.page}>
            {/* TOAST D'ERREUR */}
            {showToast && (
                <div className={`${styles.toastError} ${toastClosing ? styles.closing : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* LOGO */}
            <div className={styles.logoWrap}>
                {!logoError ? (
                    <Link href={'/'}>
                        <img src="/assets/media/images/logo.png" alt="Logo" onError={() => setLogoError(true)} />
                    </Link>
                ) : (
                    <Link href="/" className={styles.logoFallback}>
                        <div className={styles.logoIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                        </div>
                        <span className={styles.logoText}>bricole<span>.ma</span></span>
                    </Link>
                )}
            </div>

            {/* LEFT SIDE */}
            <div className={styles.left}>
                <div className={styles.zelijWrapper}>
                    <div className={styles.zelijBg} />
                    <div className={styles.zelijOverlay} />
                    <div className={styles.glowOrb} />
                    <div className={styles.glowOrb2} />
                </div>

                <div className={`${styles.floatingBadge} ${styles.animateIn} ${styles.delay3}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Artisans Certifiés
                </div>

                <div className={`${styles.floatingBadge2} ${styles.animateIn} ${styles.delay4}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    Disponible 24h/24
                </div>

                <div className={`${styles.leftInner} ${styles.animateUp} ${styles.delay1}`}>
                    <div className={styles.glassCard}>
                        <h1 className={styles.leftTagline}>
                            Bienvenue sur <span>Bricole.ma</span>
                        </h1>
                        <p className={styles.leftSub}>
                            Connectez-vous pour accéder à votre espace et gérer vos projets.
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{
                                    width: '34px', height: '34px', borderRadius: '50%',
                                    border: '2px solid white',
                                    background: `hsl(${210 + i * 12}, 60%, ${70 + i * 3}%)`,
                                    marginLeft: i > 1 ? '-10px' : '0',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }} />
                            ))}
                            <span style={{ marginLeft: '14px', fontSize: '0.83rem', fontWeight: '600', color: '#334155' }}>
                                +12K Professionnels
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE — FORM */}
            <div className={styles.right}>
                <div className={`${styles.formHeader} ${styles.animateUp} ${styles.delay1}`}>
                    <p className={styles.formTitle}>Espace Professionnel</p>
                    <p className={styles.formDesc}>Connectez-vous pour accéder à votre tableau de bord.</p>
                </div>

                <div className={`${styles.animateUp} ${styles.delay2}`}>
                    <button
                        className={styles.btnGoogle}
                        type="button"
                        disabled={loading}
                        onClick={() => {
                            signIn('google', { callbackUrl: '/profile' });
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continuer avec Google
                    </button>

                    <div className={styles.orRow}>
                        <span className={styles.orLine} /><span className={styles.orText}>ou avec votre email</span><span className={styles.orLine} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={`${styles.animateUp} ${styles.delay3}`} autoComplete="off">
                    <div className={styles.field}>
                        <label htmlFor="email">Adresse e-mail</label>
                        <div className={`${styles.inputWrap} ${emptyFields.email ? styles.inputError : ''}`}>
                            <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                            </svg>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="contact@bricole.ma"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="none"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Mot de passe</label>
                        <div className={`${styles.inputWrap} ${emptyFields.password ? styles.inputError : ''}`}>
                            <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <input
                                id="password"
                                name="password"
                                type={showPw ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button type="button" className={styles.toggleEye} onClick={() => setShowPw(!showPw)}>
                                {showPw
                                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                }
                            </button>
                        </div>
                    </div>

                    <div className={styles.optionsRow}>
                        <label className={styles.checkWrap}>
                            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                            <span className={styles.checkBox}>
                                <svg className={styles.checkTick} width="11" height="9" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                            <span>Rester connecté</span>
                        </label>
                        <Link href="#" className={styles.forgot}>Mot de passe oublié ?</Link>
                    </div>

                    <button type="submit" className={`${styles.btnSubmit} ${loading ? styles.loading : ''}`} disabled={loading}>
                        {loading
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                <svg className={styles.spin} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                                Connexion en cours...
                              </span>
                            : 'Se connecter →'
                        }
                    </button>

                    <div className={`${styles.signupDivider} ${styles.animateUp} ${styles.delay5}`}>
                        Vous n'avez pas de compte ?
                        <Link href="/register">Créer un compte</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}