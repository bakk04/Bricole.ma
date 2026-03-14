'use client';
import React, { useState, useEffect } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand:      #2563EB;
    --brand-2:    #0EA5E9;
    --brand-glow: rgba(37, 99, 235, 0.18);
    --bg-main:    #F8FAFC;
    --surface:    #FFFFFF;
    --text-dark:  #0F172A;
    --text-mid:   #334155;
    --text-light: #64748B;
    --border:     #E2E8F0;
    --input-bg:   #F1F5F9;
    --radius-lg:  20px;
    --radius-md:  12px;
    --transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  html, body, #root { height: 100%; overflow-x: hidden; }

  .page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 500px;
    font-family: 'Outfit', sans-serif;
    background: var(--bg-main);
    color: var(--text-dark);
  }

  /* ================= ANIMATIONS ================= */
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(28px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50% { transform: translateY(-14px) rotate(1deg); }
  }
  @keyframes floatBadge2 {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.08); }
  }
  @keyframes shimmerBtn {
    0% { left: -100%; }
    100% { left: 150%; }
  }
  @keyframes logoReveal {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes checkPop {
    0% { transform: scale(0.7); opacity: 0; }
    60% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  .animate-up {
    animation: fadeUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .animate-in {
    animation: fadeIn 0.6s ease both;
  }
  .delay-1 { animation-delay: 0.08s; }
  .delay-2 { animation-delay: 0.18s; }
  .delay-3 { animation-delay: 0.28s; }
  .delay-4 { animation-delay: 0.40s; }
  .delay-5 { animation-delay: 0.50s; }

  /* ================= LEFT SIDE ================= */
  .left {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 5vw;
  }

  .zelij-wrapper {
    position: absolute; inset: 0;
    z-index: 0;
  }
  
  .zelij-bg {
    position: absolute; inset: 0;
    background-image: url('assets/media/zelij.jpg');
    background-size: cover;
    background-position: center;
    transform: scale(1.05);
    opacity: 0.35;
  }

  .zelij-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      135deg, 
      rgba(248, 250, 252, 0.97) 0%, 
      rgba(239, 246, 255, 0.82) 45%, 
      rgba(37, 99, 235, 0.25) 100%
    );
  }

  .glow-orb {
    position: absolute;
    width: 640px; height: 640px;
    background: radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(14,165,233,0.12) 40%, transparent 70%);
    top: -15%; left: -15%;
    border-radius: 50%;
    animation: glowPulse 9s infinite alternate;
    z-index: 1;
    filter: blur(50px);
  }

  .glow-orb-2 {
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%);
    bottom: -5%; right: 5%;
    border-radius: 50%;
    animation: glowPulse 7s 2s infinite alternate;
    z-index: 1;
    filter: blur(40px);
  }

  .left-inner {
    position: relative;
    z-index: 2;
    max-width: 580px;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.65);
    border-radius: var(--radius-lg);
    padding: 40px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.07), 0 1px 2px rgba(255,255,255,0.8) inset;
  }

  .left-tagline {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(1.6rem, 2.8vw, 2.8rem);
    font-weight: 800;
    line-height: 1.15;
    color: var(--text-dark);
    margin-bottom: 18px;
    letter-spacing: -0.03em;
  }
  
  .left-tagline span {
    background: linear-gradient(120deg, #2563EB 20%, #0EA5E9 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }

  .left-sub {
    font-size: clamp(0.9rem, 1.1vw, 1.05rem);
    color: var(--text-mid);
    line-height: 1.65;
    margin-bottom: 28px;
  }

  /* Floating Badges */
  .floating-badge {
    position: absolute;
    right: 8%;
    top: 22%;
    background: var(--surface);
    padding: 11px 18px;
    border-radius: 100px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset;
    display: flex; align-items: center; gap: 9px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600; font-size: 0.85rem;
    color: var(--brand);
    animation: floatSlow 6s ease-in-out infinite;
    z-index: 3;
    border: 1px solid rgba(255,255,255,0.85);
  }

  .floating-badge-2 {
    position: absolute;
    right: 12%;
    bottom: 20%;
    background: linear-gradient(135deg, #2563EB, #0EA5E9);
    padding: 10px 16px;
    border-radius: 100px;
    box-shadow: 0 12px 32px rgba(37,99,235,0.25);
    display: flex; align-items: center; gap: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600; font-size: 0.82rem;
    color: white;
    animation: floatBadge2 5s 1s ease-in-out infinite;
    z-index: 3;
  }

  /* ================= RIGHT SIDE (FORM) ================= */
  .right {
    background: var(--surface);
    display: flex; 
    flex-direction: column; 
    justify-content: center;
    padding: 40px 10%;
    position: relative;
    z-index: 5;
    box-shadow: -24px 0 48px rgba(15, 23, 42, 0.04);
  }

  /* LOGO */
  .logo-wrap {
    position: absolute;
    top: 32px;
    left: 40px;
    z-index: 10;
    animation: logoReveal 0.7s cubic-bezier(0.16,1,0.3,1) both;
  }
  .logo-wrap img {
    height: 38px;
    width: auto;
    object-fit: contain;
  }
  /* Fallback logo if image not found */
  .logo-fallback {
    display: flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
  }
  .logo-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #2563EB, #0EA5E9);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(37,99,235,0.3);
  }
  .logo-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    color: var(--text-dark);
    letter-spacing: -0.02em;
  }
  .logo-text span { color: var(--brand); }

  .form-header { margin-bottom: 24px; }

  .form-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(1.4rem, 1.9vw, 1.85rem); 
    font-weight: 700;
    color: var(--text-dark); 
    margin-bottom: 7px; 
    letter-spacing: -0.02em;
  }
  .form-desc { font-size: 0.93rem; color: var(--text-light); }

  /* Fields */
  .field { margin-bottom: 16px; }
  .field label { 
    display: block; font-size: 0.88rem; font-weight: 600; 
    color: var(--text-dark); margin-bottom: 7px; 
  }

  .input-wrap { position: relative; display: flex; align-items: center; }
  .input-icon {
    position: absolute; left: 15px;
    color: #94A3B8; pointer-events: none; transition: var(--transition);
  }

  .field input {
    width: 100%; height: 50px;
    padding: 0 16px 0 44px;
    border: 1.5px solid transparent; 
    border-radius: var(--radius-md);
    background: var(--input-bg);
    font-family: 'Outfit', sans-serif; font-size: 0.95rem;
    color: var(--text-dark); outline: none;
    transition: var(--transition);
  }
  
  .field input:hover { background: #E8EEF6; border-color: #CBD5E1; }
  .field input:focus {
    background: var(--surface);
    border-color: var(--brand);
    box-shadow: 0 0 0 4px var(--brand-glow);
  }
  .input-wrap:focus-within .input-icon { color: var(--brand); }

  .toggle-eye {
    position: absolute; right: 14px;
    background: none; border: none; cursor: pointer;
    color: #94A3B8; display: flex; transition: var(--transition);
    padding: 4px;
    border-radius: 6px;
  }
  .toggle-eye:hover { color: var(--brand); background: var(--brand-glow); }

  /* Options */
  .options-row {
    display: flex; align-items: center; justify-content: space-between;
    margin: 16px 0;
  }
  .check-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
  .check-wrap input { display: none; }
  .check-box {
    width: 20px; height: 20px; border: 1.5px solid #CBD5E1;
    border-radius: 6px; background: var(--surface);
    display: flex; align-items: center; justify-content: center;
    transition: var(--transition); 
    flex-shrink: 0;
  }
  .check-wrap:hover .check-box { border-color: var(--brand); }
  .check-wrap input:checked ~ .check-box { 
    background: var(--brand); border-color: var(--brand); 
    box-shadow: 0 2px 8px var(--brand-glow);
  }
  .check-tick { display: none; }
  .check-wrap input:checked ~ .check-box .check-tick { 
    display: block; 
    animation: checkPop 0.25s cubic-bezier(0.16,1,0.3,1) both;
  }
  .check-wrap span:last-child { font-size: 0.88rem; color: var(--text-mid); }
  
  /* Submit Button */
  .btn-submit {
    width: 100%; height: 52px;
    background: linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%);
    color: var(--surface); border: none;
    border-radius: var(--radius-md);
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.97rem; font-weight: 700;
    cursor: pointer; position: relative; overflow: hidden;
    transition: var(--transition);
    box-shadow: 0 8px 24px rgba(37,99,235,0.28), 0 1px 0 rgba(255,255,255,0.15) inset;
    letter-spacing: 0.01em;
    margin-top: 8px;
  }
  
  .btn-submit::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.22), transparent);
    transform: skewX(-20deg);
    transition: 0s;
  }
  
  .btn-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(37,99,235,0.35), 0 1px 0 rgba(255,255,255,0.2) inset;
  }
  .btn-submit:hover::before { 
    animation: shimmerBtn 0.6s ease forwards;
  }
  .btn-submit:active { transform: translateY(1px); box-shadow: 0 4px 12px rgba(37,99,235,0.2); }

  /* Loading state */
  .btn-submit.loading {
    background: linear-gradient(135deg, #3B82F6, #38BDF8);
    cursor: wait;
  }

  /* Divider for signup */
  .login-divider {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-light);
  }
  .login-divider a {
    color: var(--brand);
    font-weight: 700;
    text-decoration: none;
    margin-left: 4px;
    transition: var(--transition);
    position: relative;
  }
  .login-divider a::after {
    content: '';
    position: absolute;
    left: 0; bottom: -2px;
    width: 0; height: 1.5px;
    background: var(--brand);
    transition: width 0.3s ease;
  }
  .login-divider a:hover::after { width: 100%; }
  .login-divider a:hover { color: #1D4ED8; }

  /* Responsive */
  @media (max-width: 960px) {
    .page { grid-template-columns: 1fr; }
    .left { display: none; }
    .right { padding: 60px 8% 40px; border-left: none; }
    .logo-wrap { left: 24px; top: 24px; }
  }
`;

export default function SigingPage() {
    const [showPw, setShowPw] = useState(false);
    const [showPw2, setShowPw2] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [logoError, setLogoError] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    if (!mounted) return null;

    return (
        <>
            <style>{css}</style>
            <div className="page">

                {/* LOGO — top-left, always visible */}
                <div className="logo-wrap">
                    {!logoError ? (
                        <img
                            src="assets/media/images/logo.png"
                            alt="Logo"
                            onError={() => setLogoError(true)}
                        />
                    ) : (
                        <a href="#" className="logo-fallback">
                            <div className="logo-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                            </div>
                            <span className="logo-text">bricole<span>.ma</span></span>
                        </a>
                    )}
                </div>

                {/* LEFT SIDE */}
                <div className="left">
                    <div className="zelij-wrapper">
                        <div className="zelij-bg" />
                        <div className="zelij-overlay" />
                        <div className="glow-orb" />
                        <div className="glow-orb-2" />
                    </div>

                    <div className="floating-badge animate-in delay-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Inscription Gratuite
                    </div>

                    <div className="floating-badge-2 animate-in delay-4">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Rejoignez +12K Membres
                    </div>

                    <div className="left-inner animate-up delay-1">
                        <div className="glass-card">
                            <h1 className="left-tagline">
                                Rejoignez la <span>communauté</span> des experts marocains.
                            </h1>
                            <p className="left-sub">
                                Créez votre compte en quelques secondes et accédez à un réseau exclusif d'opportunités professionnelles à travers tout le Maroc.
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
                                <span style={{ marginLeft: '14px', fontSize: '0.83rem', fontWeight: '600', color: 'var(--text-mid)' }}>
                                    +12K Professionnels inscrits
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE — FORM */}
                <div className="right">
                    <div className="form-header animate-up delay-1">
                        <p className="form-title">Créer un compte</p>
                        <p className="form-desc">Inscrivez-vous pour commencer à utiliser nos services.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="animate-up delay-2">
                        <div className="field">
                            <label htmlFor="name">Nom complet</label>
                            <div className="input-wrap">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                </svg>
                                <input id="name" type="text" placeholder="e.g. Ahmed Benani" required />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="email">Adresse e-mail</label>
                            <div className="input-wrap">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                                </svg>
                                <input id="email" type="email" placeholder="contact@bricole.ma" required />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="pw">Mot de passe</label>
                            <div className="input-wrap">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <input id="pw" type={showPw ? 'text' : 'password'} placeholder="••••••••" required />
                                <button type="button" className="toggle-eye" onClick={() => setShowPw(!showPw)}>
                                    {showPw
                                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="repw">Confirmer le mot de passe</label>
                            <div className="input-wrap">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <input id="repw" type={showPw2 ? 'text' : 'password'} placeholder="••••••••" required />
                                <button type="button" className="toggle-eye" onClick={() => setShowPw2(!showPw2)}>
                                    {showPw2
                                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        <div className="options-row">
                            <label className="check-wrap">
                                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required />
                                <span className="check-box">
                                    <svg className="check-tick" width="11" height="9" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                                <span>J'accepte les conditions d'utilisation</span>
                            </label>
                        </div>

                        <button type="submit" className={`btn-submit${loading ? ' loading' : ''}`}>
                            {loading
                                ? <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                    Création en cours...
                                  </span>
                                : "S'inscrire →"
                            }
                        </button>

                        {/* Sign in link */}
                        <div className="login-divider animate-up delay-5">
                            Vous avez déjà un compte ?
                            <a href="/login">Se connecter</a>
                        </div>
                    </form>
                </div>

            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}