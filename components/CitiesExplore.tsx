'use client'
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    LucideMapPin,
    LucideArrowRight,
    LucideBell,
    LucideStar
} from 'lucide-react';
import { ListingItem } from './CategorieExplore';

interface CityInfo {
    id: string;
    label: string;
    desc: string;
}

interface CitiesExploreProps {
    listingsData?: ListingItem[];
}

import FavoriteButton from '@/components/FavoriteButton';

const BASE_CITIES: CityInfo[] = [
    { id: 'casablanca', label: 'Casablanca', desc: 'Capitale Économique' },
    { id: 'marrakech',  label: 'Marrakech',  desc: 'Ville Ocre' },
    { id: 'rabat',      label: 'Rabat',      desc: 'Capitale Administrative' },
    { id: 'tanger',     label: 'Tanger',     desc: 'Porte du Nord' },
    { id: 'agadir',     label: 'Agadir',     desc: 'Perle du Sud' },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

.city-section {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background-color: #ffffff;
    padding: 60px 0;
    --c-blue: #0052FF;
    --c-blue-light: #f0f5ff;
    --c-black: #0f172a;
    --c-gray: #475569;
    --c-border: #e2e8f0;
}

.city-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* En-tête plus fin et élégant */
.city-header { text-align: center; margin-bottom: 40px; }
.city-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 700; text-transform: uppercase;
    color: var(--c-blue); letter-spacing: 0.1em; margin-bottom: 12px;
    background: var(--c-blue-light); padding: 6px 14px; border-radius: 100px;
}
.city-title {
    font-size: clamp(24px, 3vw, 32px); font-weight: 700;
    color: var(--c-black); margin: 0 0 10px; line-height: 1.2;
}
.city-desc { font-size: 14px; color: var(--c-gray); max-width: 500px; margin: 0 auto; }

/* Navigation par onglets (Pills) design moderne */
.city-nav {
    display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;
    margin-bottom: 40px; padding: 0 10px;
}
.city-pill {
    display: flex; align-items: center; gap: 8px;
    background: #ffffff; border: 1px solid var(--c-border);
    padding: 8px 16px; border-radius: 100px;
    cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: inherit; font-size: 14px; font-weight: 600; color: var(--c-black);
}
.city-pill:hover {
    border-color: var(--c-blue); background: var(--c-blue-light); color: var(--c-blue);
    transform: translateY(-2px);
}
.city-pill.active {
    background: var(--c-blue); border-color: var(--c-blue); color: #ffffff;
    box-shadow: 0 8px 16px rgba(0, 82, 255, 0.25);
}

.city-pill-count {
    background: #f1f5f9; color: var(--c-gray);
    font-size: 11px; padding: 2px 8px; border-radius: 20px; transition: all 0.3s;
}
.city-pill:hover .city-pill-count { background: #ffffff; color: var(--c-blue); }
.city-pill.active .city-pill-count { background: rgba(255,255,255,0.2); color: #ffffff; }

/* Animation d'apparition des résultats */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}
.city-animate { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

/* Grille de cartes compactes */
.city-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px;
}

.city-card {
    background: #ffffff; border: 1px solid var(--c-border); border-radius: 16px;
    overflow: hidden; text-decoration: none; color: inherit;
    transition: all 0.3s ease; display: flex; flex-direction: column;
}
.city-card:hover {
    border-color: #cbd5e1; transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 82, 255, 0.12); /* Ombre bleutée pro */
}

.city-card-img { position: relative; aspect-ratio: 4/3; overflow: hidden; }
.city-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.city-card:hover .city-card-img img { transform: scale(1.08); }

/* Badge de prix superposé sur l'image */
.city-card-price {
    position: absolute; bottom: 12px; right: 12px;
    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px);
    padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 14px;
    color: var(--c-blue); box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.city-card-body { padding: 16px; display: flex; flex-direction: column; flex: 1; }
.city-card-cat { font-size: 11px; font-weight: 700; color: var(--c-gray); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
.city-card-title { font-size: 15px; font-weight: 700; color: var(--c-black); margin: 0 0 12px; line-height: 1.4; }

.city-card-footer {
    margin-top: auto; display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid #f1f5f9;
}
.city-card-rating { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--c-black); }
.city-card-link { 
    font-size: 13px; font-weight: 600; color: var(--c-blue); 
    display: flex; align-items: center; gap: 4px; transition: gap 0.2s;
}
.city-card:hover .city-card-link { gap: 8px; } /* L'icône se déplace légèrement au survol */

/* Empty state raffiné */
.city-empty {
    text-align: center; padding: 60px 20px; background: var(--c-blue-light);
    border-radius: 20px; border: 1px solid rgba(0, 82, 255, 0.1);
}
.city-empty-icon {
    width: 64px; height: 64px; background: #ffffff; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
    color: var(--c-blue); box-shadow: 0 8px 16px rgba(0, 82, 255, 0.15);
}
.city-empty h4 { font-size: 18px; font-weight: 700; color: var(--c-black); margin: 0 0 8px; }
.city-empty p { font-size: 14px; color: var(--c-gray); max-width: 380px; margin: 0 auto 24px; line-height: 1.5; }

.city-btn {
    display: inline-flex; align-items: center; gap: 8px; background: var(--c-blue);
    color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px;
    border-radius: 10px; text-decoration: none; transition: all 0.3s;
}
.city-btn:hover { background: #0040d1; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0, 82, 255, 0.3); }
`;

const CitiesExplore: React.FC<CitiesExploreProps> = ({ listingsData = [] }) => {
    const [activeTab, setActiveTab] = useState<string>(BASE_CITIES[0].id);

    // Calcul dynamique du nombre d'annonces
    const citiesStats = useMemo(() => {
        return BASE_CITIES.map(city => {
            const count = listingsData.filter(
                l => l.city?.toLowerCase() === city.label.toLowerCase()
            ).length;
            return { ...city, count };
        });
    }, [listingsData]);

    const activeCity = citiesStats.find(c => c.id === activeTab);

    // Annonces filtrées pour la ville active
    const activeListings = useMemo(() => {
        return listingsData.filter(
            l => l.city?.toLowerCase() === activeCity?.label.toLowerCase()
        ).slice(0, 8); // Limiter à 8 résultats pour garder la section propre
    }, [listingsData, activeCity]);

    return (
        <section className="city-section">
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            <div className="city-container">
                {/* En-tête raffiné */}
                <header className="city-header">
                    <div className="city-tag">
                        <LucideMapPin size={14} /> Zones d'intervention
                    </div>
                    <h2 className="city-title">Explorez par ville</h2>
                    <p className="city-desc">Découvrez les meilleurs artisans rigoureusement sélectionnés près de chez vous, prêts à intervenir.</p>
                </header>

                {/* Navigation (Pills interactifs avec couleurs Bleu/Blanc/Noir) */}
                <nav className="city-nav" role="tablist">
                    {citiesStats.map((city) => (
                        <button
                            key={city.id}
                            role="tab"
                            aria-selected={activeTab === city.id}
                            className={`city-pill ${activeTab === city.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(city.id)}
                        >
                            {city.label}
                            <span className="city-pill-count">{city.count}</span>
                        </button>
                    ))}
                </nav>

                {/* Grille de résultats avec animation */}
                <div key={activeTab} className="city-animate">
                    {activeListings.length > 0 ? (
                        <div className="city-grid">
                            {activeListings.map(listing => (
                                <Link href={`/explore/details/${listing.id}`} key={listing.id} className="city-card">
                                    <div className="city-card-img" style={{ position: 'relative', width: '100%', aspectRatio: '4/3', backgroundColor: '#f1f5f9' }}>
                                        <img
                                            src={listing.imageUrl || '/assets/media/listing-img/popularity-img-1.webp'}
                                            alt={listing.title}
                                            loading="lazy"
                                            width={400}
                                            height={300}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                        <div className="city-card-price">{listing.price} DH</div>
                                        <FavoriteButton 
                                            productId={listing.id} 
                                            className="city-fav-btn"
                                            style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }} 
                                        />
                                    </div>
                                    <div className="city-card-body">
                                        <span className="city-card-cat">{listing.categoryId || 'Service'}</span>
                                        <h3 className="city-card-title">{listing.title}</h3>

                                        <div className="city-card-footer">
                                            <div className="city-card-rating">
                                                <LucideStar size={14} fill="#F59E0B" color="#F59E0B" />
                                                {listing.rating || 'Nouveau'}
                                            </div>
                                            <span className="city-card-link">
                                                Consulter <LucideArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="city-empty">
                            <div className="city-empty-icon">
                                <LucideMapPin size={28} />
                            </div>
                            <h4>Le réseau s'agrandit à {activeCity?.label}</h4>
                            <p>Nos équipes certifient actuellement de nouveaux artisans dans la région de <strong>{activeCity?.label}</strong>.</p>
                            <Link href="/contact" className="city-btn">
                                <LucideBell size={16} />
                                M'alerter du lancement
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default CitiesExplore;
