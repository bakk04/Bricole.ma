"use client";

import { useState } from "react";
import { 
    Mail, 
    MessageSquare, 
    Phone, 
    MapPin, 
    Send, 
    CheckCircle2,
    ArrowRight,
    LifeBuoy,
    Sparkles
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    const [status, setStatus] = useState(null); // 'sending', 'success', 'error'
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error("Submit Error:", error);
            setStatus('error');
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

                .bm-root {
                    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                    color: #111827;
                    background: #ffffff;
                    -webkit-font-smoothing: antialiased;
                }

                .bm-root * {
                    box-sizing: border-box;
                }

                .lora { font-family: 'Lora', Georgia, serif; }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #2563eb;
                    background: #eff6ff;
                    border-radius: 100px;
                    padding: 6px 14px;
                }

                /* HERO STYLE FROM ABOUT PAGE */
                .contact-hero {
                    width: 100%;
                    padding: 100px 0 80px;
                    background: #ffffff;
                    position: relative;
                    overflow: hidden;
                }
                .contact-hero::before {
                    content: ''; position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
                    width: 80%; height: 60%; background: radial-gradient(circle, rgba(0,123,255,0.05) 0%, rgba(255,255,255,0) 70%);
                    pointer-events: none; z-index: 0;
                }
                .contact-hero::after {
                    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background-image: url('/assets/media/zelij.jpg');
                    background-repeat: repeat;
                    background-size: 280px;
                    opacity: 0.12;
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%);
                    -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%);
                    pointer-events: none; z-index: 0;
                }

                .input-group {
                    margin-bottom: 20px;
                }

                .input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                }

                .input-group input, 
                .input-group textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    background: #f9fafb;
                    font-family: inherit;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .input-group input:focus, 
                .input-group textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }

                .btn-submit {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    background: #2563eb;
                    color: #fff;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .btn-submit:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                }

                .btn-submit:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                }

                @media (max-width: 768px) {
                    .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
                    .info-col { order: 1; }
                }
            `}</style>

            <main className="bm-root">
                <section className="contact-hero">
                    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
                        <div style={{ textAlign: "center", marginBottom: "60px" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                                <span className="badge">
                                    <Sparkles style={{ width: "11px", height: "11px" }} />
                                    Support & Contact
                                </span>
                            </div>
                            <h1 className="lora" style={{ 
                                fontSize: "clamp(2rem, 4vw, 2.8rem)", 
                                fontWeight: "600",
                                color: "#111827",
                                lineHeight: "1.18",
                                letterSpacing: "-0.015em",
                                marginBottom: "20px",
                            }}>
                                Parlons de votre <em style={{ color: "#2563eb", fontStyle: "italic" }}>projet</em>
                            </h1>
                            <p style={{ 
                                fontSize: "16px",
                                color: "#6b7280",
                                fontWeight: "300",
                                lineHeight: "1.75",
                                maxWidth: "500px",
                                margin: "0 auto",
                            }}>
                                Vous avez une question, une suggestion ou besoin d'assistance ? Notre équipe est à votre écoute.
                            </p>
                        </div>

                        <div className="contact-grid" style={{ 
                            display: "grid", 
                            gridTemplateColumns: "1fr 1.2fr", 
                            gap: "60px",
                            alignItems: "start"
                        }}>
                            {/* Info Column */}
                            <div className="info-col">
                                <div style={{ marginBottom: "40px" }}>
                                    <h3 className="lora" style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px" }}>Nos coordonnées</h3>
                                    
                                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                        <div style={{ display: "flex", gap: "16px" }}>
                                            <div style={{ 
                                                width: "44px", height: "44px", borderRadius: "12px", background: "#eff6ff",
                                                display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0
                                            }}>
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>E-mail</div>
                                                <div style={{ fontSize: "15px", fontWeight: "600" }}>contact@bricole.ma</div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "16px" }}>
                                            <div style={{ 
                                                width: "44px", height: "44px", borderRadius: "12px", background: "#eff6ff",
                                                display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0
                                            }}>
                                                <Phone size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>Téléphone</div>
                                                <div style={{ fontSize: "15px", fontWeight: "600" }}>+212 5XX XX XX XX</div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "16px" }}>
                                            <div style={{ 
                                                width: "44px", height: "44px", borderRadius: "12px", background: "#eff6ff",
                                                display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0
                                            }}>
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>Siège social</div>
                                                <div style={{ fontSize: "15px", fontWeight: "600" }}>Casablanca, Maroc</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ 
                                    background: "#f9fafb", 
                                    borderRadius: "20px", 
                                    padding: "30px",
                                    border: "1px solid #f3f4f6"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                        <LifeBuoy size={20} color="#2563eb" />
                                        <span style={{ fontWeight: "700", fontSize: "14px" }}>Support 7j/7</span>
                                    </div>
                                    <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.6", fontWeight: "300" }}>
                                        Notre équipe de support est disponible tous les jours pour répondre à vos questions et vous accompagner.
                                    </p>
                                    <Link href="/about#faq" style={{ 
                                        display: "inline-flex", alignItems: "center", gap: "6px", 
                                        fontSize: "13px", color: "#2563eb", fontWeight: "600", marginTop: "16px" 
                                    }}>
                                        Consulter la FAQ <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>

                            {/* Form Column */}
                            <div style={{ 
                                background: "#fff", 
                                borderRadius: "24px", 
                                padding: "40px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
                            }}>
                                {status === 'success' ? (
                                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                                        <div style={{ 
                                            width: "60px", height: "60px", borderRadius: "50%", background: "#dcfce7",
                                            display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a",
                                            margin: "0 auto 24px"
                                        }}>
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="lora" style={{ fontSize: "24px", fontWeight: "600", marginBottom: "12px" }}>Message envoyé !</h3>
                                        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "30px" }}>
                                            Merci de nous avoir contactés. Nous reviendrons vers vous dans les plus brefs délais.
                                        </p>
                                        <button 
                                            onClick={() => setStatus(null)}
                                            style={{ 
                                                background: "#f3f4f6", color: "#374151", border: "none", 
                                                padding: "10px 24px", borderRadius: "10px", fontWeight: "600", cursor: "pointer"
                                            }}
                                        >
                                            Envoyer un autre message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        {status === 'error' && (
                                            <div style={{ 
                                                padding: "12px", background: "#fef2f2", border: "1px solid #fee2e2", 
                                                borderRadius: "8px", color: "#b91c1c", fontSize: "13px", marginBottom: "20px" 
                                            }}>
                                                Une erreur est survenue lors de l'envoi. Veuillez réessayer.
                                            </div>
                                        )}
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                            <div className="input-group">
                                                <label>Prénom</label>
                                                <input 
                                                    type="text" 
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    placeholder="Mohammed" 
                                                    required 
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>Nom</label>
                                                <input 
                                                    type="text" 
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    placeholder="El Amrani" 
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>E-mail</label>
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="mohammed@exemple.com" 
                                                required 
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Sujet</label>
                                            <input 
                                                type="text" 
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="Comment pouvons-nous vous aider ?" 
                                                required 
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Message</label>
                                            <textarea 
                                                rows={5} 
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Votre message ici..." 
                                                required 
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="btn-submit"
                                            disabled={status === 'sending'}
                                        >
                                            {status === 'sending' ? "Envoi en cours..." : (
                                                <>
                                                    Envoyer le message <Send size={16} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
