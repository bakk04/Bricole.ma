import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    LucideDroplet, LucideZap, LucidePaintbrush, LucideHammer,
    LucideLeaf, LucideWind, LucideLayoutGrid, LucideKey,
    LucideInbox, LucideMapPin, LucideArrowUpRight,
    LucideChevronLeft, LucideChevronRight
} from 'lucide-react';

const CATEGORIES = [
    { id: 'plomberie',   label: 'Plomberie',      Icon: LucideDroplet,    bg: '#dbeafe', ink: '#1d4ed8' },
    { id: 'electricite', label: 'Électricité',    Icon: LucideZap,        bg: '#fef9c3', ink: '#a16207' },
    { id: 'peinture',    label: 'Peinture',       Icon: LucidePaintbrush, bg: '#fce7f3', ink: '#be185d' },
    { id: 'menuiserie',  label: 'Menuiserie',     Icon: LucideHammer,     bg: '#ffedd5', ink: '#c2410c' },
    { id: 'jardinage',   label: 'Jardinage',      Icon: LucideLeaf,       bg: '#dcfce7', ink: '#15803d' },
    { id: 'clima',       label: 'Climatisation',  Icon: LucideWind,       bg: '#e0f2fe', ink: '#0369a1' },
    { id: 'maconnerie',  label: 'Maçonnerie',     Icon: LucideLayoutGrid, bg: '#f3f4f6', ink: '#374151' },
    { id: 'serrurerie',  label: 'Serrurerie',     Icon: LucideKey,        bg: '#ede9fe', ink: '#6d28d9' },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.ce-section {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background-color: #ffffff;
    padding: 40px 0 80px;
    --primary: #0052FF;
    --text-main: #0f172a;
    --text-muted: #475569;
    --border-light: #e2e8f0;
    --card-bg: #ffffff;
}

/* Header & Typography Refined */
.ce-container { max-width: 1280px; margin: 0 auto; padding: 0 20px; }

.ce-header {
    display: flex; flex-direction: column; gap: 12px;
    margin-bottom: 32px;
}
@media (min-width: 768px) {
    .ce-header { flex-direction: row; align-items: flex-end; justify-content: space-between; margin-bottom: 40px; }
}

.ce-tag {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--primary); margin-bottom: 8px;
}
.ce-tag span { width: 20px; height: 2px; background: var(--primary); border-radius: 2px; }

.ce-title {
    font-size: clamp(20px, 3.5vw, 28px); font-weight: 700;
    color: var(--text-main); margin: 0; line-height: 1.25; letter-spacing: -0.01em;
}

.ce-desc { 
    font-size: 14px; color: var(--text-muted); 
    margin: 6px 0 0; line-height: 1.6; font-weight: 400;
}

.ce-link-all {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 14px; font-weight: 600; color: var(--text-main);
    text-decoration: none; padding-bottom: 4px;
    border-bottom: 1.5px solid transparent;
    transition: all 0.2s ease;
    align-self: flex-start;
}
.ce-link-all:hover { color: var(--primary); border-color: var(--primary); }

/* Animation Typewriter Premium */
.ce-typewriter-wrapper { 
    color: var(--primary); display: inline-block; min-width: 150px; 
    transition: opacity 0.3s ease;
}
.ce-cursor { 
    display: inline-block;
    width: 2px; height: 1em; background-color: var(--primary);
    vertical-align: text-bottom; margin-left: 4px;
    animation: blink 0.8s step-end infinite; 
}
@keyframes blink { 50% { opacity: 0; } }

/* Navigation Categories & Hover Arrows */
.ce-nav-wrapper { position: relative; margin-bottom: 40px; }
.ce-scroll-fade {
    position: relative;
    mask-image: linear-gradient(to right, black 85%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
}
@media (min-width: 1024px) {
    .ce-scroll-fade { mask-image: none; -webkit-mask-image: none; }
}

.ce-scroll {
    display: flex; gap: 12px; overflow-x: auto;
    padding: 4px 20px 16px 0;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.ce-scroll::-webkit-scrollbar { display: none; }

.ce-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 18px 8px 8px; border-radius: 100px;
    border: 1px solid var(--border-light); background: var(--card-bg);
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
    font-family: inherit; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.ce-chip:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,82,255,0.06); }
.ce-chip.active { background: var(--text-main); border-color: var(--text-main); box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12); }
.ce-chip.active .ce-chip-lbl { color: #ffffff; }

.ce-chip-ico {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.3s ease;
}
.ce-chip-lbl { font-size: 14px; font-weight: 600; color: var(--text-main); transition: color 0.3s ease; }

/* Arrows with Hover Effect */
.ce-arr {
    position: absolute; top: 50%; 
    width: 40px; height: 40px; 
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-light); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 10;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
    color: var(--text-muted);
    opacity: 0; pointer-events: none; /* Caché par défaut */
}

/* Affichage au survol de la zone de navigation */
.ce-nav-wrapper:hover .ce-arr { opacity: 1; pointer-events: auto; }

.ce-arr.left { left: -15px; transform: translateY(-60%) translateX(10px); }
.ce-nav-wrapper:hover .ce-arr.left { transform: translateY(-60%) translateX(0); }

.ce-arr.right { right: -15px; transform: translateY(-60%) translateX(-10px); }
.ce-nav-wrapper:hover .ce-arr.right { transform: translateY(-60%) translateX(0); }

.ce-arr:hover { 
    background: #fff; color: var(--primary); border-color: var(--primary); 
    transform: translateY(-60%) scale(1.08) !important; 
    box-shadow: 0 6px 20px rgba(0,82,255,0.12);
}
@media (max-width: 1024px) { .ce-arr { display: none !important; } }

/* Grid & Cards (Restent quasi identiques, ombres adoucies) */
.ce-grid {
    display: grid; gap: 20px;
    grid-template-columns: repeat(1, 1fr);
}
@media (min-width: 560px) { .ce-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 860px) { .ce-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1100px) { .ce-grid { grid-template-columns: repeat(4, 1fr); } }

.ce-card {
    display: flex; flex-direction: column; text-decoration: none; color: inherit;
    background: var(--card-bg); border-radius: 14px; border: 1px solid var(--border-light);
    overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    height: 100%; position: relative;
}
.ce-card:hover { 
    transform: translateY(-4px); 
    box-shadow: 0 10px 22px -6px rgba(0, 0, 0, 0.08); 
    border-color: #cbd5e1; 
}
.ce-card-img-wrapper { position: relative; aspect-ratio: 4/3; overflow: hidden; background: #f1f5f9; }
.ce-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.ce-card:hover .ce-card-img { transform: scale(1.04); }

.ce-card-body { padding: 16px; display: flex; flex-direction: column; flex: 1; }
.ce-card-title { font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0 0 6px; line-height: 1.4; }
.ce-card-loc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); margin-bottom: 14px; }
.ce-card-footer { margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; }
.ce-card-price { font-size: 16px; font-weight: 700; color: var(--primary); }
.ce-card-action { font-size: 12px; font-weight: 600; color: var(--text-main); background: #f1f5f9; padding: 6px 10px; border-radius: 6px; transition: background 0.2s; }
.ce-card:hover .ce-card-action { background: var(--primary); color: #fff; }

.ce-empty {
    grid-column: 1 / -1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 20px; text-align: center;
    background: #f8fafc; border-radius: 14px; border: 1px dashed var(--border-light);
}
.ce-empty-icon {
    width: 56px; height: 56px; border-radius: 50%; background: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
}
.ce-empty h4 { font-size: 18px; font-weight: 700; color: var(--text-main); margin: 0 0 8px; }
.ce-empty p { font-size: 14px; color: var(--text-muted); max-width: 360px; line-height: 1.5; margin: 0; }
`;

function DynamicTitle() {
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loop, setLoop] = useState(0);

    const words = useMemo(() => ["près de vous", "à Casablanca", "à Marrakech", "vérifiés"], []);

    useEffect(() => {
        let timer;
        const i = loop % words.length;
        const fullText = words[i];

        const handleType = () => {
            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            if (!isDeleting && text === fullText) {
                // Pause avant d'effacer
                timer = setTimeout(() => setIsDeleting(true), 2500);
            } else if (isDeleting && text === "") {
                // Mot effacé, passer au suivant
                setIsDeleting(false);
                setLoop((prev) => prev + 1);
                // Petite pause avant d'écrire le nouveau mot
                timer = setTimeout(() => {}, 400);
            } else {
                // Vitesse d'écriture (50ms) et d'effacement (30ms) pour faire "pro"
                const typingSpeed = isDeleting ? 30 : 60;
                timer = setTimeout(handleType, typingSpeed);
            }
        };

        timer = setTimeout(handleType, 60);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loop, words]);

    return (
        <span className="ce-typewriter-wrapper">
            {text}<span className="ce-cursor" />
        </span>
    );
}

export default function CategorieExplore({ listingsData = [] }) {
    const [active, setActive] = useState(CATEGORIES[0].id);
    const scrollRef = useRef(null);

    const filtered = listingsData.filter(i => i.categoryId === active);
    const activeCat = CATEGORIES.find(c => c.id === active);

    const scroll = (direction) => {
        const amount = direction === 'left' ? -350 : 350;
        scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
    };

    return (
        <section className="ce-section">
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            <div className="ce-container">
                {/* Header affiné */}
                <header className="ce-header">
                    <div>
                        <div className="ce-tag"><span />Nos services</div>
                        <h2 className="ce-title">
                            Trouvez un expert <DynamicTitle />
                        </h2>
                        <p className="ce-desc">Des artisans de confiance, sélectionnés au Maroc.</p>
                    </div>
                    <Link href="/categories" className="ce-link-all">
                        Explorer tout <LucideArrowUpRight size={16} />
                    </Link>
                </header>

                {/* Navigation avec flèches au survol */}
                <div className="ce-nav-wrapper">
                    <button className="ce-arr left" onClick={() => scroll('left')} aria-label="Défiler à gauche">
                        <LucideChevronLeft size={20} strokeWidth={2.5} />
                    </button>

                    <div className="ce-scroll-fade">
                        <div className="ce-scroll" ref={scrollRef} role="tablist">
                            {CATEGORIES.map(cat => {
                                const isActive = cat.id === active;
                                return (
                                    <button
                                        key={cat.id}
                                        role="tab"
                                        aria-selected={isActive}
                                        className={`ce-chip ${isActive ? 'active' : ''}`}
                                        onClick={() => setActive(cat.id)}
                                    >
                                        <span
                                            className="ce-chip-ico"
                                            style={{ background: isActive ? 'rgba(255,255,255,0.15)' : cat.bg }}
                                        >
                                            <cat.Icon size={16} color={isActive ? '#ffffff' : cat.ink} strokeWidth={2.5} />
                                        </span>
                                        <span className="ce-chip-lbl">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button className="ce-arr right" onClick={() => scroll('right')} aria-label="Défiler à droite">
                        <LucideChevronRight size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="ce-grid">
                    {filtered.length > 0 ? filtered.map((item) => (
                        <Link href={`/offres/${item.id}`} key={item.id} className="ce-card">
                            <div className="ce-card-img-wrapper">
                                <img
                                    className="ce-card-img"
                                    src={item.imageUrl || '/assets/media/listing-img/popularity-img-1.webp'}
                                    alt={`Image de ${item.title}`}
                                    loading="lazy"
                                />
                            </div>
                            <div className="ce-card-body">
                                <h3 className="ce-card-title">{item.title}</h3>
                                <div className="ce-card-loc">
                                    <LucideMapPin size={12} /> {item.city}
                                </div>
                                <div className="ce-card-footer">
                                    <span className="ce-card-price">{item.price} DH</span>
                                    <span className="ce-card-action">Voir l'offre</span>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="ce-empty">
                            <div className="ce-empty-icon">
                                <LucideInbox size={24} color="var(--text-muted)" strokeWidth={2} />
                            </div>
                            <h4>Aucun résultat</h4>
                            <p>Les artisans pour la catégorie <b>{activeCat?.label}</b> arrivent très prochainement.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}