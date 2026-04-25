'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import {
    Search, MapPin, Star, SlidersHorizontal,
    Map, List,
    Droplet, Zap, Paintbrush, Hammer, Leaf,
    Thermometer, Lock, Sparkles, Package, Wifi, Wind,
    LayoutGrid, Home, Heart, LocateFixed, ChevronDown
} from 'lucide-react';
import { getData } from '@/lib/api';
import styles from './explore.module.css';

/* ─── CATEGORY ICONS ─── */
const CAT_ICONS: Record<string, React.ElementType> = {
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
const getCatIcon = (slug?: string): React.ElementType =>
    CAT_ICONS[slug?.toLowerCase() ?? ''] || LayoutGrid;

function isNew(date?: string) {
    if (!date) return false;
    return Date.now() - new Date(date).getTime() < 3 * 24 * 60 * 60 * 1000;
}

const FALLBACK = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=640&q=80',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=640&q=80',
];

import FavoriteButton from '@/components/FavoriteButton';

/* ══════════════════════
   SERVICE CARD
══════════════════════ */
interface ServiceItem {
    id: string;
    title: string;
    city?: string;
    price: number;
    imageUrl?: string;
    createdAt?: string;
    categoryId?: string;
    categoryName?: string;
    _lat?: number;
    _lng?: number;
}

function ServiceCard({
                         item, index, onHover
                     }: {
    item: ServiceItem;
    index: number;
    onHover: (id: string | null) => void;
}) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const image = item.imageUrl || FALLBACK[index % FALLBACK.length];

    return (
        <Link
            href={`/explore/details/${item.id}`}
            className={styles.card}
            style={{ animationDelay: `${index * 60}ms` }}
            onMouseEnter={() => onHover(item.id)}
            onMouseLeave={() => onHover(null)}
        >
            <div className={styles.cardMedia}>
                <img
                    src={image}
                    alt={item.title}
                    className={`${styles.cardImg} ${imgLoaded ? styles.imgLoaded : ''}`}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                />
                <div className={styles.cardImgOverlay} />
                <FavoriteButton 
                    productId={item.id} 
                    className={styles.save}
                />
                {isNew(item.createdAt) && (
                    <span className={styles.badgeNew}>Nouveau</span>
                )}
            </div>

            <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                    <span className={styles.cardLoc}>
                        <MapPin size={11} />
                        {item.city || 'Maroc'}
                    </span>
                    <span className={styles.cardRating}>
                        <Star size={11} fill="currentColor" />
                        4.9
                    </span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardFooter}>
                    <span className={styles.cardPrice}>
                        <strong>{item.price}</strong> DH
                    </span>
                    <span className={styles.cardCta}>Voir →</span>
                </div>
            </div>
        </Link>
    );
}

/* ══════════════════════
   SKELETON CARD
══════════════════════ */
function SkeletonCard({ delay = 0 }: { delay?: number }) {
    return (
        <div className={styles.skeleton} style={{ animationDelay: `${delay}ms` }}>
            <div className={styles.skeletonImg} />
            <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} style={{ width: '60%' }} />
                <div className={styles.skeletonLine} style={{ width: '85%', height: 14 }} />
                <div className={styles.skeletonLine} style={{ width: '40%' }} />
            </div>
        </div>
    );
}

/* ══════════════════════
   EXPLORE PAGE
══════════════════════ */
export default function ExplorePage() {
    const searchParams = useSearchParams();
    const [cats, setCats]           = useState<any[]>([]);
    const [services, setServices]   = useState<ServiceItem[]>([]);
    const [loading, setLoading]     = useState(true);
    const [activeCat, setActiveCat] = useState<string>(searchParams.get('category') || 'all');
    const [query, setQuery]         = useState(searchParams.get('q') || '');
    const [location, setLocation]   = useState(searchParams.get('location') || '');
    const [showMap, setShowMap]     = useState(false);
    const [hoverId, setHoverId]     = useState<string | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);

    const mapRef      = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef  = useRef<Record<string, any>>({});
    const catBarRef   = useRef<HTMLDivElement>(null);
    const leafletRef  = useRef<any>(null);

    // Sync state when URL changes
    useEffect(() => {
        const q = searchParams.get('q');
        const loc = searchParams.get('location');
        const cat = searchParams.get('category');
        if (q !== null) setQuery(q);
        if (loc !== null) setLocation(loc);
        if (cat !== null) setActiveCat(cat);
    }, [searchParams]);

    const getCoords = (cityName?: string): [number, number] => {
        const cities: Record<string, [number, number]> = {
            'rabat':       [34.0209, -6.8416],
            'casablanca':  [33.5731, -7.5898],
            'marrakech':   [31.6295, -7.9811],
            'tanger':      [35.7595, -5.8340],
            'agadir':      [30.4278, -9.5981],
            'fes':         [34.0181, -5.0078],
            'meknes':      [33.8935, -5.5473],
            'oujda':       [34.6805, -1.9076],
            'kenitra':     [34.2610, -6.5802],
            'tetouan':     [35.5785, -5.3684],
        };
        return cities[cityName?.toLowerCase() ?? ''] || [33.5731, -7.5898];
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [cR, pR] = await Promise.all([
                    getData('/categories'),
                    getData('/products'),
                ]);
                if (cR.success) setCats(cR.categories);
                if (pR.success) {
                    setServices(pR.products.map((p: any) => {
                        const base = getCoords(p.city);
                        return {
                            ...p,
                            _lat: base[0] + (Math.random() - 0.5) * 0.05,
                            _lng: base[1] + (Math.random() - 0.5) * 0.05,
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

    // Load Leaflet dynamically (SSR-safe)
    useEffect(() => {
        import('leaflet').then(L => {
            // Fix default marker icon paths broken by webpack
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
            leafletRef.current = L;
        });
    }, []);

    // Sync map when showMap / filtered / hoverId change
    useEffect(() => {
        const L = leafletRef.current;
        if (!showMap || !L || !mapRef.current) return;

        // Small delay so the mapPane has finished rendering/sizing
        const init = setTimeout(() => {
            if (!mapInstance.current) {
                mapInstance.current = L.map(mapRef.current!, {
                    center:          [33.5731, -7.5898],
                    zoom:            12,
                    zoomControl:     false,
                    scrollWheelZoom: true,
                });
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap',
                }).addTo(mapInstance.current);
                L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
            } else {
                mapInstance.current.invalidateSize();
            }

            // Clear old markers
            Object.values(markersRef.current).forEach((m: any) => m.remove());
            markersRef.current = {};

            if (filtered.length === 0) return;

            filtered.forEach(s => {
                if (!s._lat || !s._lng) return;
                const isActive = hoverId === s.id;
                const icon = L.divIcon({
                    className:  '',
                    html:       `<div class="map-pill${isActive ? ' map-pill--active' : ''}">${s.price}&nbsp;DH</div>`,
                    iconSize:   [72, 30],
                    iconAnchor: [36, 15],
                });
                const marker = L.marker([s._lat, s._lng], { icon })
                    .addTo(mapInstance.current)
                    .on('click', () => { window.location.href = `/explore/details/${s.id}`; });
                markersRef.current[s.id] = marker;
            });

            const group = L.featureGroup(Object.values(markersRef.current));
            if (Object.keys(markersRef.current).length > 0) {
                mapInstance.current.fitBounds(group.getBounds().pad(0.15));
            }
        }, 80);

        return () => clearTimeout(init);
    }, [showMap, filtered, hoverId]);

    // Destroy map when hidden so it can re-init cleanly
    useEffect(() => {
        if (!showMap && mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
            markersRef.current = {};
        }
    }, [showMap]);

    const countLabel = loading ? '…' : `${filtered.length} service${filtered.length !== 1 ? 's' : ''}`;

    return (
        <div className={styles.root}>

            {/* ══ HEADER ZONE ══ */}
            <div className={styles.headerZone} style={{ marginTop: '70px' }}>
                <div className={styles.heroBg} aria-hidden="true" />

                {/* Search pill */}
                <div className={styles.searchWrap}>
                    <div className={styles.searchPill}>
                        <div className={styles.searchField}>
                            <Search size={15} className={styles.searchIcon} />
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder="Service, métier…"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>
                        <span className={styles.searchSep} />
                        <div className={styles.searchField}>
                            <MapPin size={15} className={styles.searchIcon} />
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder="Ville ou région"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                        <button className={styles.searchBtn}>
                            <Search size={15} strokeWidth={2.8} />
                            <span>Chercher</span>
                        </button>
                    </div>

                    <div className={styles.searchActions}>
                        <button className={styles.actionPill} onClick={() => setFilterOpen(!filterOpen)}>
                            <SlidersHorizontal size={14} />
                            <span>Filtres</span>
                            <ChevronDown size={13} className={filterOpen ? styles.chevronUp : ''} />
                        </button>
                        <button className={styles.actionPill}>
                            <LocateFixed size={14} />
                            <span>Proximité</span>
                        </button>
                        <button className={styles.actionPill} onClick={() => setShowMap(!showMap)}>
                            {showMap ? <List size={14} /> : <Map size={14} />}
                            <span>{showMap ? 'Liste' : 'Carte'}</span>
                        </button>
                    </div>
                </div>

                {/* Category bar */}
                <div className={styles.catScroll} ref={catBarRef}>
                    <button
                        className={`${styles.catPill} ${activeCat === 'all' ? styles.catPillOn : ''}`}
                        onClick={() => setActiveCat('all')}
                    >
                        <LayoutGrid size={17} strokeWidth={2} />
                        <span>Tout</span>
                    </button>
                    {cats.map(cat => {
                        const Icon = getCatIcon(cat.slug || cat.nom);
                        return (
                            <button
                                key={cat._id}
                                className={`${styles.catPill} ${activeCat === cat._id ? styles.catPillOn : ''}`}
                                onClick={() => setActiveCat(cat._id)}
                            >
                                <Icon size={17} strokeWidth={2} />
                                <span>{cat.nom}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ══ BODY ══ */}
            <div className={`${styles.body} ${showMap ? styles.bodySplit : ''}`}>

                {/* Results panel */}
                <div className={styles.resultsPanel}>
                    <div className={styles.resultsHeader}>
                        <span className={styles.countLabel}>{countLabel} trouvés</span>
                    </div>

                    {loading ? (
                        <div className={styles.grid}>
                            {[...Array(8)].map((_, i) => (
                                <SkeletonCard key={i} delay={i * 50} />
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
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <Search size={36} />
                            <p>Aucun service trouvé</p>
                            <span>Modifiez vos critères de recherche</span>
                        </div>
                    )}
                </div>

                {/* Map panel */}
                {showMap && (
                    <div className={styles.mapPane}>
                        <div ref={mapRef} className={styles.map} />
                    </div>
                )}
            </div>

            {/* Global map pill styles */}
            <style jsx global>{`
                .map-pill {
                    background: #fff;
                    color: #1e3a5f;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 5px 10px;
                    border-radius: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,.18);
                    border: 1.5px solid #e2e8f0;
                    cursor: pointer;
                    transition: all .2s;
                    white-space: nowrap;
                }
                .map-pill--active {
                    background: #2563eb;
                    color: #fff;
                    border-color: #2563eb;
                    transform: scale(1.08);
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position:  400px 0; }
                }
            `}</style>
        </div>
    );
}