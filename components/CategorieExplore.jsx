'use client'
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    LucideDroplet, LucideZap, LucidePaintbrush, LucideHammer,
    LucideLeaf, LucideWind, LucideLayoutGrid, LucideKey,
    LucideMapPin, LucideStar, LucideShieldCheck, LucideSlidersHorizontal, LucideSearch
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
    { id: 'plomberie',   label: 'Plomberie',      Icon: LucideDroplet },
    { id: 'electricite', label: 'Électricité',    Icon: LucideZap },
    { id: 'peinture',    label: 'Peinture',       Icon: LucidePaintbrush },
    { id: 'menuiserie',  label: 'Menuiserie',     Icon: LucideHammer },
    { id: 'jardinage',   label: 'Jardinage',      Icon: LucideLeaf },
    { id: 'clima',       label: 'Climatisation',  Icon: LucideWind },
    { id: 'maconnerie',  label: 'Maçonnerie',     Icon: LucideLayoutGrid },
    { id: 'serrurerie',  label: 'Serrurerie',     Icon: LucideKey },
];

const CSS = `
.ce-google-section {
    background-color: #ffffff;
    padding: 24px 0 60px;
    font-family: 'Inter', -apple-system, sans-serif;
    color: #202124;
}

.ce-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 16px;
}

/* Header - Alignement Parfait */
.ce-header-minimal {
    display: flex;
    justify-content: space-between;
    align-items: center; /* Centrage vertical strict */
    margin-bottom: 24px;
    height: 40px;
}

.ce-title-text {
    font-size: 20px;
    font-weight: 600;
    color: #202124;
    letter-spacing: -0.02em;
    margin: 0;
    display: flex;
    align-items: center;
}

.ce-title-text span {
    color: #1a73e8;
    margin-left: 6px;
}

.ce-filter-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 1px solid #dadce0;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 500;
    color: #3c4043;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
}
.ce-filter-chip:hover { background: #f8f9fa; border-color: #1a73e8; color: #1a73e8; }

/* Chips Navigation */
.ce-chips-wrapper {
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 100;
    margin: 0 -16px 28px;
    padding: 8px 16px;
    border-bottom: 1px solid transparent;
    transition: border 0.3s;
}

.ce-chips-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;
    padding: 4px 0;
}
.ce-chips-scroll::-webkit-scrollbar { display: none; }

.ce-chip-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 1px solid #dadce0;
    border-radius: 100px;
    white-space: nowrap;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ce-chip-btn.active {
    background: #e8f0fe;
    border-color: #1a73e8;
    color: #1967d2;
}

/* Results Grid */
.ce-results-grid {
    display: grid;
    gap: 24px;
    grid-template-columns: 1fr;
    min-height: 200px;
}

@media (min-width: 600px) { .ce-results-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px) { .ce-results-grid { grid-template-columns: repeat(3, 1fr); } }

.ce-clean-card {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    border-radius: 16px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
    transition: all 0.3s ease;
}
.ce-clean-card:hover {
    border-color: #1a73e8;
    box-shadow: 0 4px 12px rgba(26, 115, 232, 0.08);
}

.ce-card-thumb {
    width: 100%;
    aspect-ratio: 16 / 10;
    background: #f8f9fa;
    overflow: hidden;
}

.ce-thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Empty State Modern - Google Style */
.ce-empty-modern {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.ce-empty-illustration {
    position: relative;
    width: 120px;
    height: 120px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
}

.ce-search-icon-anim {
    color: #dadce0;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-10px) rotate(5deg); }
}

.ce-empty-title {
    font-size: 18px;
    font-weight: 500;
    color: #202124;
    margin: 0 0 8px;
}

.ce-empty-desc {
    font-size: 14px;
    color: #5f6368;
    max-width: 280px;
    line-height: 1.5;
}
`;

export default function CategorieExplore({ listingsData = [] }) {
    const [active, setActive] = useState("");
    const scrollRef = useRef(null);

    const categories = useMemo(() => {
        const catsMap = new Map();
        DEFAULT_CATEGORIES.forEach(c => catsMap.set(c.id, c));
        listingsData.forEach(item => {
            if (item.categoryId && !catsMap.has(item.categoryId)) {
                catsMap.set(item.categoryId, {
                    id: item.categoryId,
                    label: item.categoryName || 'Autre',
                    Icon: LucideLayoutGrid
                });
            }
        });
        return Array.from(catsMap.values());
    }, [listingsData]);

    useEffect(() => {
        if (!active && categories.length > 0) {
            const firstWithData = categories.find(cat => 
                listingsData.some(item => item.categoryId === cat.id)
            );
            setActive(firstWithData ? firstWithData.id : categories[0].id);
        }
    }, [categories, active, listingsData]);

    const filtered = listingsData.filter(i => i.categoryId === active);
    const activeCat = categories.find(c => c.id === active);

    return (
        <section className="ce-google-section">
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <div className="ce-container">
                <div className="ce-header-minimal">
                    <h2 className="ce-title-text">Explorer les <span>services</span></h2>
                    <button className="ce-filter-chip">
                        <LucideSlidersHorizontal size={16} />
                        Filtres
                    </button>
                </div>

                <div className="ce-chips-wrapper">
                    <div className="ce-chips-scroll" ref={scrollRef}>
                        {categories.map(cat => {
                            const isActive = cat.id === active;
                            return (
                                <button
                                    key={cat.id}
                                    className={`ce-chip-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => setActive(cat.id)}
                                >
                                    <cat.Icon size={18} strokeWidth={2} color={isActive ? "#1a73e8" : "#5f6368"} />
                                    <span className="ce-chip-label">{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="ce-results-grid">
                    {filtered.length > 0 ? filtered.map((item) => (
                        <Link href={`/offres/${item.id}`} key={item.id} className="ce-clean-card">
                            <div className="ce-card-thumb">
                                <img className="ce-thumb-img" src={item.imageUrl} alt={item.title} loading="lazy" />
                            </div>
                            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#1a73e8', textTransform: 'uppercase' }}>{activeCat?.label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#5f6368' }}>
                                        <LucideStar size={12} fill="#f9ab00" color="#f9ab00" />
                                        <span>4.8</span>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#202124', margin: '0' }}>{item.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                    <div style={{ fontSize: '13px', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <LucideMapPin size={14} />
                                        {item.city}
                                        {item.isVerified && <LucideShieldCheck size={14} color="#1a73e8" />}
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#202124' }}>{item.price} DH</div>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="ce-empty-modern">
                            <div className="ce-empty-illustration">
                                <LucideSearch size={48} className="ce-search-icon-anim" />
                            </div>
                            <h4 className="ce-empty-title">Aucun expert disponible</h4>
                            <p className="ce-empty-desc">
                                Nous n'avons pas encore d'artisans vérifiés pour <b>{activeCat?.label}</b> à cet endroit.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
