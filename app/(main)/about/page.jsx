"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
    ChevronDown,
    ShieldCheck,
    CreditCard,
    CalendarCheck,
    UserCog,
    Sparkles,
    LifeBuoy,
    MessageSquare,
    CheckCircle2,
    ArrowRight,
    Star,
    Mail
} from "lucide-react";

/* ─── SCROLL REVEAL HOOK ── */
function useInView(threshold = 0.12) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setInView(true); },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

function Reveal({ children, delay = 0, y = 20, className = "" }) {
    const { ref, inView } = useInView();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : `translateY(${y}px)`,
                transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

/* ─── DATA ── */
const helpCategories = [
    {
        icon: <CalendarCheck style={{ width: "20px", height: "20px" }} />,
        title: "Réservations",
        desc: "Gérer, annuler ou modifier un rendez-vous avec un artisan.",
    },
    {
        icon: <CreditCard style={{ width: "20px", height: "20px" }} />,
        title: "Paiements & Tarifs",
        desc: "Factures, remboursements et fonctionnement des prix.",
    },
    {
        icon: <ShieldCheck style={{ width: "20px", height: "20px" }} />,
        title: "Sécurité & Garanties",
        desc: "Assurances, vérification des profils et litiges.",
    },
    {
        icon: <UserCog style={{ width: "20px", height: "20px" }} />,
        title: "Compte & Profil",
        desc: "Gérer vos informations, mots de passe et notifications.",
    },
];

const stats = [
    { value: "50 000+", label: "Artisans vérifiés" },
    { value: "4.9 / 5", label: "Note moyenne" },
    { value: "48 villes", label: "Couverture Maroc" },
    { value: "7j/7", label: "Support dédié" },
];

const faqs = [
    {
        q: "Comment l'IA sélectionne-t-elle les artisans ?",
        a: "Notre algorithme analyse votre requête en langage naturel (darija, français, arabe) et la croise avec les données de Google Places. Il prend en compte la distance, les avis vérifiés et la disponibilité en temps réel.",
    },
    {
        q: "Que couvre la garantie Bricole.ma ?",
        a: "Chaque intervention réservée et payée via notre plateforme est couverte par notre assurance partenaire. En cas de malfaçon ou de dommage, nous prenons en charge les réparations jusqu'à un plafond défini dans nos CGV.",
    },
    {
        q: "Puis-je modifier l'heure de mon rendez-vous ?",
        a: "Oui, vous pouvez modifier l'heure d'une intervention gratuitement jusqu'à 12h avant l'arrivée prévue de l'artisan, directement depuis la section « Mes Réservations ».",
    },
    {
        q: "Comment signaler un problème avec un artisan ?",
        a: "Si une intervention ne s'est pas déroulée comme prévu, vous disposez de 48h pour ouvrir un litige via le bouton « Signaler un problème » dans les détails de votre réservation. Notre équipe de médiation prendra le relais.",
    },
];

/* ─── FAQ ITEM ── */
function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: "1px solid #f3f4f6" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "28px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "16px",
                }}
                aria-expanded={open}
            >
                <span style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: open ? "#2563eb" : "#111827",
                    lineHeight: "1.5",
                    transition: "color 0.2s",
                    fontFamily: "inherit",
                }}>
                    {q}
                </span>
                <span style={{
                    flexShrink: 0,
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: open ? "1px solid #2563eb" : "1px solid #e5e7eb",
                    background: open ? "#2563eb" : "#fff",
                    color: open ? "#fff" : "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                }}>
                    <ChevronDown style={{
                        width: "14px",
                        height: "14px",
                        transition: "transform 0.3s ease",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    }} />
                </span>
            </button>
            <div style={{
                maxHeight: open ? "240px" : "0",
                opacity: open ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
                paddingBottom: open ? "28px" : "0",
            }}>
                <p style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    lineHeight: "1.8",
                    fontWeight: "300",
                    paddingRight: "48px",
                    fontFamily: "inherit",
                    margin: 0,
                }}>
                    {a}
                </p>
            </div>
        </div>
    );
}

/* ─── PAGE ── */
export default function AboutHelpPage() {
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

                /* Strip all link decorations globally inside this page */
                .bm-root a {
                    text-decoration: none;
                    color: inherit;
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

                .lift {
                    transition: box-shadow 0.28s ease, transform 0.28s ease;
                }
                .lift:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 40px -10px rgba(0,0,0,0.10);
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .au { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
                .d1 { animation-delay: 80ms; }
                .d2 { animation-delay: 180ms; }
                .d3 { animation-delay: 280ms; }
                .d4 { animation-delay: 380ms; }

                @media (max-width: 768px) {
                    .mission-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
                    .img-col { order: -1; }
                    .stats-grid { grid-template-columns: 1fr 1fr !important; }
                    .cat-grid { grid-template-columns: 1fr 1fr !important; }
                    .support-grid { grid-template-columns: 1fr !important; }
                    .faq-wrap { padding: 8px 24px !important; }
                }
                @media (max-width: 480px) {
                    .cat-grid { grid-template-columns: 1fr !important; }
                    .stats-grid { grid-template-columns: 1fr 1fr !important; }
                }

                .about-hero {
                    width: 100%;
                    padding: 100px 0 80px;
                    background: #ffffff;
                    position: relative;
                    overflow: hidden;
                }
                .about-hero::before {
                    content: ''; position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
                    width: 80%; height: 60%; background: radial-gradient(circle, rgba(0,123,255,0.05) 0%, rgba(255,255,255,0) 70%);
                    pointer-events: none; z-index: 0;
                }
                .about-hero::after {
                    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background-image: url('/assets/media/zelij.jpg');
                    background-repeat: repeat;
                    background-size: 280px;
                    opacity: 0.12;
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%);
                    -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%);
                    pointer-events: none; z-index: 0;
                }
            `}</style>

            <main className="bm-root">

                {/* ══════════════════════════════
                    1. HERO
                ══════════════════════════════ */}
                <section className="about-hero">
                    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

                        {/* Badge */}
                        <div className="au" style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                            <span className="badge">
                                <LifeBuoy style={{ width: "11px", height: "11px" }} />
                                Aide & À propos
                            </span>
                        </div>

                        {/* Headline */}
                        <h1
                            className="lora au d1"
                            style={{
                                textAlign: "center",
                                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                                fontWeight: "600",
                                color: "#111827",
                                lineHeight: "1.18",
                                letterSpacing: "-0.015em",
                                marginBottom: "20px",
                            }}
                        >
                            Comment pouvons-nous<br />
                            <em style={{ fontStyle: "italic", color: "#2563eb" }}>vous aider</em> aujourd'hui ?
                        </h1>

                        {/* Subline */}
                        <p
                            className="au d2"
                            style={{
                                textAlign: "center",
                                fontSize: "16px",
                                color: "#6b7280",
                                fontWeight: "300",
                                lineHeight: "1.75",
                                maxWidth: "500px",
                                margin: "0 auto 40px",
                            }}
                        >
                            Trouvez rapidement des réponses ou découvrez comment Bricole.ma modernise l'artisanat marocain.
                        </p>

                        {/* CTA row */}
                        <div className="au d3" style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                            <Link
                                href="#aide"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    background: "#2563eb",
                                    color: "#fff",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    padding: "14px 28px",
                                    borderRadius: "12px",
                                    transition: "background 0.2s, transform 0.2s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                Parcourir l'aide <ArrowRight style={{ width: "15px", height: "15px" }} />
                            </Link>
                            <Link
                                href="#faq"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    background: "#fff",
                                    color: "#374151",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    padding: "13px 28px",
                                    borderRadius: "12px",
                                    border: "1.5px solid #e5e7eb",
                                    transition: "border-color 0.2s, color 0.2s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
                            >
                                Questions fréquentes
                            </Link>
                        </div>

                        {/* Stats bar */}
                        <div
                            className="au d4 stats-grid"
                            style={{
                                marginTop: "64px",
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                borderRadius: "20px",
                                overflow: "hidden",
                                border: "1px solid #f3f4f6",
                            }}
                        >
                            {stats.map((s, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: "28px 20px",
                                        textAlign: "center",
                                        background: "#fafafa",
                                        borderRight: i < stats.length - 1 ? "1px solid #f3f4f6" : "none",
                                    }}
                                >
                                    <div
                                        className="lora"
                                        style={{ fontSize: "26px", fontWeight: "700", color: "#111827", letterSpacing: "-0.02em" }}
                                    >
                                        {s.value}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px", fontWeight: "500" }}>
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* ══════════════════════════════
                    2. HELP CATEGORIES
                ══════════════════════════════ */}
                <section id="aide" style={{ background: "#f9fafb", padding: "72px 0" }}>
                    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

                        <Reveal>
                            <div style={{ marginBottom: "40px" }}>
                                <span className="badge" style={{ marginBottom: "14px" }}>Catégories</span>
                                <h2
                                    className="lora"
                                    style={{
                                        fontSize: "clamp(1.7rem, 2.8vw, 2.2rem)",
                                        fontWeight: "600",
                                        color: "#111827",
                                        letterSpacing: "-0.01em",
                                        marginTop: "10px",
                                    }}
                                >
                                    Trouver de l'aide rapidement
                                </h2>
                            </div>
                        </Reveal>

                        <div
                            className="cat-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: "16px",
                            }}
                        >
                            {helpCategories.map((cat, i) => (
                                <Reveal key={i} delay={i * 60}>
                                    <Link
                                        href={`/help/${cat.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                                        className="lift"
                                        style={{
                                            display: "block",
                                            background: "#fff",
                                            borderRadius: "18px",
                                            padding: "28px 24px",
                                            border: "1px solid #e5e7eb",
                                            height: "100%",
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#bfdbfe"; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                                    >
                                        <div style={{
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "12px",
                                            background: "#eff6ff",
                                            color: "#2563eb",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "18px",
                                        }}>
                                            {cat.icon}
                                        </div>
                                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>
                                            {cat.title}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.65", marginBottom: "16px" }}>
                                            {cat.desc}
                                        </div>
                                        <div style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            color: "#2563eb",
                                        }}>
                                            Voir les articles <ArrowRight style={{ width: "12px", height: "12px" }} />
                                        </div>
                                    </Link>
                                </Reveal>
                            ))}
                        </div>

                    </div>
                </section>

                {/* ══════════════════════════════
                    3. MISSION (editorial split)
                ══════════════════════════════ */}
                <section style={{ background: "#fff", padding: "88px 0" }}>
                    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

                        <div
                            className="mission-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "72px",
                                alignItems: "center",
                            }}
                        >
                            {/* Text */}
                            <Reveal>
                                <div>
                                    <span className="badge" style={{ marginBottom: "20px" }}>Notre mission</span>

                                    <h2
                                        className="lora"
                                        style={{
                                            fontSize: "clamp(1.9rem, 3vw, 2.6rem)",
                                            fontWeight: "600",
                                            color: "#111827",
                                            lineHeight: "1.22",
                                            letterSpacing: "-0.015em",
                                            marginBottom: "24px",
                                        }}
                                    >
                                        L'artisanat marocain,{" "}
                                        <em style={{ fontStyle: "italic", color: "#2563eb" }}>enfin structuré.</em>
                                    </h2>

                                    <p style={{
                                        fontSize: "15px",
                                        color: "#6b7280",
                                        lineHeight: "1.8",
                                        fontWeight: "300",
                                        marginBottom: "14px",
                                    }}>
                                        Bricole.ma connecte les particuliers aux meilleurs artisans de leur région grâce à une IA qui comprend le darija, le français et l'arabe.
                                    </p>
                                    <p style={{
                                        fontSize: "15px",
                                        color: "#6b7280",
                                        lineHeight: "1.8",
                                        fontWeight: "300",
                                        marginBottom: "36px",
                                    }}>
                                        Chaque profil est vérifié. Chaque intervention est garantie. Chaque échange est transparent.
                                    </p>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {[
                                            "Profils artisans vérifiés et notés",
                                            "Transparence totale sur les tarifs",
                                            "Support et médiation 7j/7",
                                        ].map((item, idx) => (
                                            <div key={idx} style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                fontSize: "14px",
                                                color: "#374151",
                                                fontWeight: "500",
                                            }}>
                                                <CheckCircle2 style={{ width: "17px", height: "17px", color: "#2563eb", flexShrink: 0 }} />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>

                            {/* Image */}
                            <Reveal delay={140} className="img-col">
                                <div style={{ position: "relative" }}>
                                    <div style={{
                                        borderRadius: "24px",
                                        overflow: "hidden",
                                        aspectRatio: "4/5",
                                        background: "#f3f4f6",
                                        position: "relative",
                                    }}>
                                        <Image
                                            src="/assets/media/images/about-img-1.png"
                                            alt="Artisan Bricole.ma"
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>

                                    {/* Float card bottom-left */}
                                    <div style={{
                                        position: "absolute",
                                        bottom: "20px",
                                        left: "-16px",
                                        background: "#fff",
                                        borderRadius: "16px",
                                        padding: "14px 18px",
                                        boxShadow: "0 8px 28px -4px rgba(0,0,0,0.12)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}>
                                        <div style={{
                                            width: "38px",
                                            height: "38px",
                                            borderRadius: "50%",
                                            background: "#2563eb",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}>
                                            <Sparkles style={{ width: "15px", height: "15px", color: "#fff" }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "400" }}>Analyse IA</div>
                                            <div style={{ fontSize: "13px", color: "#111827", fontWeight: "700" }}>Darija & Français</div>
                                        </div>
                                    </div>

                                    {/* Float card top-right */}
                                    <div style={{
                                        position: "absolute",
                                        top: "20px",
                                        right: "-16px",
                                        background: "#fff",
                                        borderRadius: "16px",
                                        padding: "14px 18px",
                                        boxShadow: "0 8px 28px -4px rgba(0,0,0,0.12)",
                                    }}>
                                        <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "400", marginBottom: "2px" }}>Satisfaction</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <Star style={{ width: "13px", height: "13px", color: "#f59e0b", fill: "#f59e0b" }} />
                                            <span style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>4.9 / 5</span>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>

                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════
                    4. FAQ — minimal clean
                ══════════════════════════════ */}
                <section id="faq" style={{ background: "#f9fafb", padding: "80px 0" }}>
                    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>

                        <Reveal>
                            <div style={{ textAlign: "center", marginBottom: "48px" }}>
                                <span className="badge" style={{ marginBottom: "16px" }}>FAQ</span>
                                <h2
                                    className="lora"
                                    style={{
                                        fontSize: "clamp(1.7rem, 2.8vw, 2.2rem)",
                                        fontWeight: "600",
                                        color: "#111827",
                                        letterSpacing: "-0.01em",
                                        marginBottom: "10px",
                                    }}
                                >
                                    Questions fréquentes
                                </h2>
                                <p style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "300" }}>
                                    Tout ce que vous devez savoir sur Bricole.ma.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={80}>
                            <div
                                className="faq-wrap"
                                style={{
                                    background: "#fff",
                                    borderRadius: "20px",
                                    padding: "8px 36px",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                {faqs.map((faq, i) => (
                                    <FaqItem key={i} q={faq.q} a={faq.a} />
                                ))}
                            </div>
                        </Reveal>

                    </div>
                </section>

                {/* ══════════════════════════════
                    5. SUPPORT — all white, no dark
                ══════════════════════════════ */}
                <section style={{ background: "#fff", padding: "80px 0 96px" }}>
                    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

                        <Reveal>
                            <div style={{ textAlign: "center", marginBottom: "48px" }}>
                                <span className="badge" style={{ marginBottom: "16px" }}>Support</span>
                                <h2
                                    className="lora"
                                    style={{
                                        fontSize: "clamp(1.7rem, 2.8vw, 2.2rem)",
                                        fontWeight: "600",
                                        color: "#111827",
                                        letterSpacing: "-0.01em",
                                        marginBottom: "10px",
                                    }}
                                >
                                    Nous sommes là pour vous
                                </h2>
                                <p style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "300", maxWidth: "360px", margin: "0 auto" }}>
                                    Notre équipe répond à toutes vos demandes, 7 jours sur 7.
                                </p>
                            </div>
                        </Reveal>

                        <div
                            className="support-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "20px",
                                maxWidth: "680px",
                                margin: "0 auto",
                            }}
                        >
                            {/* Card 1 — Blue (primary) */}
                            <Reveal delay={0}>
                                <div
                                    className="lift"
                                    style={{
                                        background: "#2563eb",
                                        borderRadius: "20px",
                                        padding: "36px 32px",
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "14px",
                                        background: "rgba(255,255,255,0.15)",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 18px",
                                    }}>
                                        <MessageSquare style={{ width: "20px", height: "20px" }} />
                                    </div>
                                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "6px" }}>
                                        Chat en direct
                                    </div>
                                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginBottom: "24px", fontWeight: "300" }}>
                                        Réponse en moins de 5 minutes.
                                    </div>
                                    <Link
                                        href="/contact"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            background: "rgba(255,255,255,0.2)",
                                            color: "#fff",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            padding: "10px 20px",
                                            borderRadius: "10px",
                                            transition: "background 0.2s",
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                                    >
                                        Démarrer un chat <ArrowRight style={{ width: "13px", height: "13px" }} />
                                    </Link>
                                </div>
                            </Reveal>

                            {/* Card 2 — White (ghost) */}
                            <Reveal delay={100}>
                                <div
                                    className="lift"
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "20px",
                                        padding: "36px 32px",
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "14px",
                                        background: "#eff6ff",
                                        color: "#2563eb",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 18px",
                                    }}>
                                        <Mail style={{ width: "20px", height: "20px" }} />
                                    </div>
                                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>
                                        Envoyer un e-mail
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "24px", fontWeight: "300" }}>
                                        Nous répondons sous 24h.
                                    </div>
                                    <Link
                                        href="mailto:support@bricole.ma"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            background: "#f3f4f6",
                                            color: "#374151",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            padding: "10px 20px",
                                            borderRadius: "10px",
                                            transition: "background 0.2s, color 0.2s",
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#374151"; }}
                                    >
                                        support@bricole.ma <ArrowRight style={{ width: "13px", height: "13px" }} />
                                    </Link>
                                </div>
                            </Reveal>

                        </div>

                        {/* Bottom note */}
                        <Reveal delay={200}>
                            <p style={{
                                textAlign: "center",
                                fontSize: "13px",
                                color: "#d1d5db",
                                marginTop: "36px",
                                fontWeight: "300",
                            }}>
                                Vous pouvez aussi consulter nos{" "}
                                <Link
                                    href="/guidelines"
                                    style={{ color: "#9ca3af", fontWeight: "500" }}
                                    onMouseEnter={e => { e.currentTarget.style.color = "#2563eb"; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = "#9ca3af"; }}
                                >
                                    directives et conditions d'utilisation
                                </Link>
                                .
                            </p>
                        </Reveal>

                    </div>
                </section>

            </main>
        </>
    );
}