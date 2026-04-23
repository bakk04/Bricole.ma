'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
    Search, MapPin, Star, SlidersHorizontal, X,
    ChevronLeft, ChevronRight, Map, List,
    Droplet, Zap, Paintbrush, Hammer, Leaf,
    Thermometer, Lock, Sparkles, Package, Wifi, Wind,
    LayoutGrid, Home, Heart, ArrowRight, Sparkle, LocateFixed
} from 'lucide-react';
import { getData } from '@/lib/api';
import styles from './explore.module.css';

/* ─── MODERN CATEGORY ICONS ─── */
const CAT_ICONS = {
    plomberie:     Droplet,
    electricite:   Zap,
    peinture:      Paintbrush,
    menuiserie:    Hammer,
    jardinage:     Leaf,
    climatisation: Thermometer,
    serrurerie:    Lock,
    renovation:    Home,
    nettoyage:     Sparkles,
    demenagement:  Package,
    internet:      Wifi,
    chauffage:     Wind,
};
const getCatIcon = (slug) => CAT_ICONS[slug?.toLowerCase()] || LayoutGrid;

function isNew(date) {
    if (!date) return false;
    return Date.now() - new Date(date).getTime() < 3 * 24 * 60 * 60 * 1000;
}

/* ─── FALLBACK IMAGES ─── */
const FALLBACK = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=640&q=80',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=640&q=80',
];

/* ══════════════════════════════
   PREMIUM SERVICE CARD
══════════════════════════════ */
function ServiceCard({ item, index, onHover, highlighted }) {
    const [saved, setSaved] = useState(false);
    const image = item.imageUrl || FALLBACK[index % FALLBACK.length];

    return (
        <Link
            href={`/explore/details/${item.id}`}
            className={styles.card}
            onMouseEnter={() => onHover?.(item.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            <div className={styles.cardMedia}>
                <img src={image} alt={item.title} className={styles.cardImg} loading="lazy" />
                <button
                    className={`${styles.save} ${saved ? styles.saveOn : ''}`}
                    onClick={e => { e.preventDefault(); setSaved(!saved); }}
                >
                    <Heart size={16} fill={saved ? "currentColor" : "none"} strokeWidth={2.5} />
                </button>
                {isNew(item.createdAt) && <div className={styles.badgeNew}>Nouveau</div>}
            </div>

            <div className={styles.cardBody}>
                <div className={styles.cardTitleRow}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <div className={styles.cardRating}>
                        <Star size={12} fill="currentColor" />
                        <span>4.9</span>
                    </div>
                </div>
                <div className={styles.cardLoc}>
                    <MapPin size={12} />
                    <span>{item.city || 'Maroc'}</span>
                </div>
                <div className={styles.cardPrice}>
                    <b>{item.price} DH</b><span> / intervention</span>
                </div>
            </div>
        </Link>
    );
}

/* ══════════════════════════════
   EXPLORE PAGE
══════════════════════════════ */
export default function ExplorePage() {
    const [cats, setCats]             = useState([]);
    const [services, setServices]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [activeCat, setActiveCat]   = useState('all');
    const [query, setQuery]           = useState('');
    const [location, setLocation]     = useState('');
    const [showMap, setShowMap]       = useState(true); // Default to true
    const [hoverId, setHoverId]       = useState(null);
    
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef({});

    // City coordinates mapper
    const getCoords = (cityName) => {
        const cities = {
            'rabat': [34.0209, -6.8416],
            'casablanca': [33.5731, -7.5898],
            'marrakech': [31.6295, -7.9811],
            'tanger': [35.7595, -5.8340],
            'agadir': [30.4278, -9.5981],
            'fes': [34.0181, -5.0078],
            'meknes': [33.8935, -5.5473],
            'oujda': [34.6805, -1.9076],
            'kenitra': [34.2610, -6.5802],
            'tetouan': [35.5785, -5.3684]
        };
        return cities[cityName?.toLowerCase()] || [33.5731, -7.5898]; // Default Casablanca
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [cR, pR] = await Promise.all([getData('/categories'), getData('/products')]);
                if (cR.success) setCats(cR.categories);
                if (pR.success) {
                    setServices(pR.products.map((p, i) => {
                        const baseCoords = getCoords(p.city || 'Casablanca');
                        return {
                            ...p,
                            _lat: baseCoords[0] + (Math.random() - 0.5) * 0.05,
                            _lng: baseCoords[1] + (Math.random() - 0.5) * 0.05
                        };
                    }));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = useMemo(() => {
        return services.filter(s => {
            const mc = activeCat === 'all' || s.categoryId === activeCat;
            const q  = query.toLowerCase();
            const l  = location.toLowerCase();
            const ms = !q || [s.title, s.categoryName].some(v => v?.toLowerCase().includes(q));
            const ml = !l || s.city?.toLowerCase().includes(l);
            return mc && ms && ml;
        });
    }, [services, activeCat, query, location]);

    // INTERACTIVE MAP (Leaflet)
    useEffect(() => {
        if (showMap && !loading && typeof window !== 'undefined' && window.L && mapRef.current) {
            if (!mapInstance.current) {
                const L = window.L;
                mapInstance.current = L.map(mapRef.current, {
                    center: [33.5731, -7.5898],
                    zoom: 12,
                    zoomControl: false,
                    scrollWheelZoom: true
                });

                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap'
                }).addTo(mapInstance.current);

                L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
            }

            const L = window.L;
            // Sync Markers
            Object.values(markersRef.current).forEach(m => m.remove());
            markersRef.current = {};

            filtered.forEach(s => {
                const isActive = hoverId === s.id;
                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div class="${styles.markerPrice} ${isActive ? styles.markerActive : ''}">${s.price} DH</div>`,
                    iconSize: [70, 32],
                    iconAnchor: [35, 16]
                });

                const marker = L.marker([s._lat, s._lng], { icon: customIcon })
                    .addTo(mapInstance.current)
                    .on('click', () => {
                        window.location.href = `/explore/details/${s.id}`;
                    });
                
                markersRef.current[s.id] = marker;
            });
            
            if (filtered.length > 0) {
                const group = L.featureGroup(Object.values(markersRef.current));
                mapInstance.current.fitBounds(group.getBounds().pad(0.1));
            }
        }
    }, [showMap, loading, filtered, hoverId]);

    return (
        <div className={styles.root}>
            {/* ── TOP BAR (SEARCH & BUTTONS) ── */}
            <div className={styles.topBar}>
                <div className={styles.topBarInner}>
                    
                    {/* New Buttons */}
                    <button className={styles.aiBtn}>
                        <Sparkles size={16} />
                        <span>AI Search</span>
                    </button>

                    <div className={styles.searchPill}>
                        <div className={styles.searchSection}>
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder="Que cherchez-vous ?"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>
                        <div className={styles.searchDivider} />
                        <div className={styles.searchSection}>
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder="Partout au Maroc"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                        <button className={styles.searchBtn}>
                            <Search size={16} strokeWidth={3} />
                        </button>
                    </div>

                    <button className={styles.proxyBtn}>
                        <LocateFixed size={16} />
                        <span>Proximité</span>
                    </button>

                    <button className={styles.filterBtn} style={{ marginLeft: '10px' }}>
                        <SlidersHorizontal size={16} />
                    </button>
                </div>

                <div className={styles.catBar}>
                    <button
                        className={`${styles.pill} ${activeCat === 'all' ? styles.pillOn : ''}`}
                        onClick={() => setActiveCat('all')}
                    >
                        <LayoutGrid className={styles.pillIcon} size={20} strokeWidth={2} />
                        <span>Tout</span>
                    </button>
                    {cats.map(cat => {
                        const Icon = getCatIcon(cat.slug || cat.nom);
                        return (
                            <button
                                key={cat._id}
                                className={`${styles.pill} ${activeCat === cat._id ? styles.pillOn : ''}`}
                                onClick={() => setActiveCat(cat._id)}
                            >
                                <Icon className={styles.pillIcon} size={20} strokeWidth={2} />
                                <span>{cat.nom}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── BODY (RESULTS & MAP) ── */}
            <div className={`${styles.body} ${showMap ? styles.bodySplit : ''}`}>
                <div className={styles.results}>
                    {loading ? (
                        <div className={styles.grid}>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} style={{height: 250, background: '#f8fafc', borderRadius: 14, animation: 'pulse 1.5s infinite'}} />
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className={styles.grid}>
                            {filtered.map((s, i) => (
                                <ServiceCard
                                    key={s.id}
                                    item={s}
                                    index={i}
                                    onHover={setHoverId}
                                    highlighted={hoverId === s.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', padding: '80px 0'}}>
                            <Search size={40} color="#cbd5e1" style={{marginBottom: 12}} />
                            <h3 style={{fontSize: '16px'}}>Aucun service trouvé</h3>
                        </div>
                    )}
                </div>

                {showMap && (
                    <div className={styles.mapPane}>
                        <div ref={mapRef} className={styles.map} />
                    </div>
                )}
            </div>

            {/* ── FAB ── */}
            <button className={styles.fab} onClick={() => setShowMap(!showMap)}>
                {showMap ? <><List size={16} /> Liste</> : <><Map size={16} /> Carte</>}
            </button>

            <style jsx global>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
