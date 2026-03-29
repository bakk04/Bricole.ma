'use client'
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
    Search, MapPin, Star, SlidersHorizontal, X,
    ChevronLeft, ChevronRight, Map, List,
    Droplet, Zap, Paintbrush, Hammer, Leaf,
    Thermometer, Lock, Sparkles, Package, Wifi, Wind,
    LayoutGrid, Home, ArrowRight, ShieldCheck
} from 'lucide-react';
import { getData } from '@/lib/api';
import styles from './explore.module.css';

/* ─── UNIQUE SVG ICONS PER CATEGORY ─── */
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
const getCatIcon = (slug) => CAT_ICONS[slug?.toLowerCase()] || Hammer;

function isNew(date) {
    if (!date) return false;
    return Date.now() - new Date(date).getTime() < 48 * 3600 * 1000;
}

/* ─── ILLUSTRATION SVG BACKGROUNDS PER CATEGORY ─── */
const CAT_ILLUSTRATIONS = {
    plomberie: (
        <svg viewBox="0 0 320 200" className="w-full h-full">
            <defs>
                <linearGradient id="g-pl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DBEAFE"/><stop offset="100%" stopColor="#EFF6FF"/>
                </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#g-pl)"/>
            <rect x="30" y="88" width="260" height="22" rx="6" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1"/>
            <rect x="140" y="22" width="22" height="88" rx="6" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1"/>
            <rect x="140" y="110" width="22" height="68" rx="6" fill="#93C5FD" stroke="#60A5FA" strokeWidth="1"/>
            <circle cx="151" cy="99" r="15" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5"/>
            <circle cx="151" cy="99" r="7" fill="#BFDBFE"/>
            <ellipse cx="151" cy="187" rx="5" ry="7" fill="#3B82F6" opacity=".7"/>
            <ellipse cx="143" cy="177" rx="3.5" ry="5" fill="#60A5FA" opacity=".5"/>
        </svg>
    ),
    electricite: (
        <svg viewBox="0 0 320 200" className="w-full h-full">
            <defs>
                <linearGradient id="g-el" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FEF9C3"/><stop offset="100%" stopColor="#FFFBEB"/>
                </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#g-el)"/>
            <rect x="95" y="32" width="130" height="136" rx="10" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5"/>
            <rect x="108" y="45" width="104" height="110" rx="6" fill="#FFFBEB"/>
            <rect x="118" y="58" width="36" height="16" rx="4" fill="#F59E0B"/>
            <rect x="162" y="58" width="36" height="16" rx="4" fill="#FCD34D"/>
            <rect x="118" y="82" width="36" height="16" rx="4" fill="#FCD34D"/>
            <rect x="162" y="82" width="36" height="16" rx="4" fill="#F59E0B"/>
            <rect x="118" y="106" width="80" height="16" rx="4" fill="#2563EB"/>
            <polygon points="172,130 163,148 171,148 162,168 180,148 170,148" fill="#F59E0B"/>
        </svg>
    ),
    jardinage: (
        <svg viewBox="0 0 320 200" className="w-full h-full">
            <defs>
                <linearGradient id="g-jr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D1FAE5"/><stop offset="100%" stopColor="#ECFDF5"/>
                </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#g-jr)"/>
            <rect x="146" y="132" width="26" height="48" rx="5" fill="#92400E"/>
            <ellipse cx="160" cy="130" rx="52" ry="38" fill="#059669"/>
            <ellipse cx="160" cy="106" rx="40" ry="30" fill="#10B981"/>
            <ellipse cx="160" cy="84" rx="28" ry="22" fill="#34D399"/>
            <rect x="226" y="102" width="38" height="26" rx="5" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5"/>
            <path d="M264 115 Q282 109 284 119" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <circle cx="282" cy="125" r="2" fill="#60A5FA"/>
            <circle cx="278" cy="131" r="1.5" fill="#93C5FD"/>
        </svg>
    ),
    default: (
        <svg viewBox="0 0 320 200" className="w-full h-full">
            <defs>
                <linearGradient id="g-def" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DBEAFE"/><stop offset="100%" stopColor="#EFF6FF"/>
                </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#g-def)"/>
            <rect x="80" y="40" width="160" height="120" rx="16" fill="#BFDBFE"/>
            <rect x="100" y="60" width="120" height="80" rx="10" fill="#93C5FD"/>
            <rect x="120" y="80" width="80" height="40" rx="7" fill="#2563EB"/>
            <circle cx="160" cy="160" r="12" fill="#1D4ED8"/>
        </svg>
    ),
};
const getCatIllustration = (slug) =>
    CAT_ILLUSTRATIONS[slug?.toLowerCase()] || CAT_ILLUSTRATIONS.default;

/* ── FALLBACK IMAGES ── */
const FALLBACK = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=640&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=640&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=640&h=400&fit=crop&auto=format',
];
const pickImg = (item, i) => item.imageUrl || FALLBACK[i % FALLBACK.length];

/* ══════════════════════════════
   SERVICE CARD
══════════════════════════════ */
function ServiceCard({ item, index, onHover, highlighted }) {
    const [saved, setSaved] = useState(false);
    const CatIcon = getCatIcon(item.categorySlug || item.categoryName);
    const slug = item.categorySlug?.toLowerCase();

    return (
        <Link
            href={`/offres/${item.id}`}
            className={`${styles.card} ${highlighted ? styles.cardHL : ''}`}
            onMouseEnter={() => onHover?.(item.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            <div className={styles.cardMedia}>
                {/* SVG illustration or real image */}
                {item.imageUrl ? (
                    <img
                        src={pickImg(item, index)}
                        alt={item.title}
                        className={styles.cardImg}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.cardIllustration}>
                        {getCatIllustration(slug)}
                    </div>
                )}

                {/* Save */}
                <button
                    className={`${styles.save} ${saved ? styles.saveOn : ''}`}
                    onClick={e => { e.preventDefault(); setSaved(v => !v); }}
                    aria-label={saved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                    <svg width="15" height="15" fill={saved ? '#F43F5E' : 'none'} stroke={saved ? '#F43F5E' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>

                {/* Badges */}
                <div className={styles.badges}>
                    {isNew(item.createdAt) && (
                        <span className={styles.badgeNew}>
              <svg width="8" height="8" fill="white" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Nouveau
            </span>
                    )}
                    {item.isVerified && (
                        <span className={styles.badgeVerif}>
              <svg width="8" height="8" fill="none" stroke="#059669" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Vérifié
            </span>
                    )}
                </div>

                {/* Category tag on hover */}
                <div className={styles.catTag}>
                    <CatIcon size={10} strokeWidth={2.5}/>
                    {item.categoryName}
                </div>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
          <span className={styles.cardCity}>
            <MapPin size={11} strokeWidth={2}/>
              {item.city || 'Maroc'}
          </span>
                    <span className={styles.cardRating}>
            <Star size={11} fill="#0F172A" color="#0F172A" strokeWidth={0}/>
            4.8 <span className={styles.cardRatingCount}>(24)</span>
          </span>
                </div>

                <p className={styles.cardName}>{item.title}</p>
                <p className={styles.cardSub}>{item.categoryName}</p>

                <div className={styles.cardFooter}>
                    <p className={styles.cardPrice}>
                        <strong>{item.price} DH</strong>
                        <span> / intervention</span>
                    </p>
                    <button className={styles.cardBtn} onClick={e => e.preventDefault()}>
                        Voir
                        <ArrowRight size={11} strokeWidth={2.5}/>
                    </button>
                </div>
            </div>
        </Link>
    );
}

/* ══════════════════════════════
   CATEGORY PILL
══════════════════════════════ */
function CatPill({ cat, active, onClick }) {
    const Icon = getCatIcon(cat.slug || cat.nom);
    return (
        <button
            className={`${styles.pill} ${active ? styles.pillOn : ''}`}
            onClick={onClick}
        >
            <div className={styles.pillIcon}>
                <Icon size={18} strokeWidth={1.8}/>
            </div>
            <span>{cat.nom}</span>
        </button>
    );
}

/* ══════════════════════════════
   FILTER MODAL
══════════════════════════════ */
function FilterModal({ onClose }) {
    const [min, setMin]       = useState(0);
    const [max, setMax]       = useState(5000);
    const [tags, setTags]     = useState([]);
    const [rating, setRating] = useState('');
    const [opts, setOpts]     = useState({});

    const tog    = (arr, set, v) => set(a => a.includes(v) ? a.filter(x => x !== v) : [...a, v]);
    const togOpt = k => setOpts(o => ({ ...o, [k]: !o[k] }));
    const reset  = () => { setMin(0); setMax(5000); setTags([]); setRating(''); setOpts({}); };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHead}>
                    <button className={styles.modalClose} onClick={onClose} aria-label="Fermer">
                        <X size={15} strokeWidth={2.5}/>
                    </button>
                    <span className={styles.modalTitle}>Filtres</span>
                    <button className={styles.modalReset} onClick={reset}>Tout effacer</button>
                </div>

                <div className={styles.modalBody}>
                    <section className={styles.fSec}>
                        <h3>Fourchette de prix</h3>
                        <p className={styles.fSub}>Prix par intervention, en DH marocain</p>
                        <div className={styles.priceRow}>
                            <label className={styles.priceBox}>
                                <span>Minimum</span>
                                <div className={styles.priceField}>
                                    <span>DH</span>
                                    <input type="number" value={min} onChange={e => setMin(+e.target.value)} min={0}/>
                                </div>
                            </label>
                            <div className={styles.priceDash}/>
                            <label className={styles.priceBox}>
                                <span>Maximum</span>
                                <div className={styles.priceField}>
                                    <span>DH</span>
                                    <input type="number" value={max} onChange={e => setMax(+e.target.value)} min={0}/>
                                </div>
                            </label>
                        </div>
                    </section>

                    <section className={styles.fSec}>
                        <h3>Type de service</h3>
                        <div className={styles.tagGrid}>
                            {['Urgence 24h','Devis gratuit','Garantie incluse','Sur rendez-vous','Déplacement inclus','Facture fournie'].map(t => (
                                <button
                                    key={t}
                                    className={`${styles.tag} ${tags.includes(t) ? styles.tagOn : ''}`}
                                    onClick={() => tog(tags, setTags, t)}
                                >{t}</button>
                            ))}
                        </div>
                    </section>

                    <section className={styles.fSec}>
                        <h3>Note minimale</h3>
                        <div className={styles.ratingRow}>
                            {['Tout','3+','4+','4.5+','5'].map(r => (
                                <button
                                    key={r}
                                    className={`${styles.ratingBtn} ${rating === r ? styles.ratingOn : ''}`}
                                    onClick={() => setRating(r)}
                                >
                                    {r !== 'Tout' && (
                                        <Star size={10} fill={rating === r ? '#fff' : '#0F172A'} color={rating === r ? '#fff' : '#0F172A'} strokeWidth={0}/>
                                    )}
                                    {r}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className={styles.fSec}>
                        <h3>Profil de l&apos;artisan</h3>
                        {[
                            ['v', 'Artisan vérifié'],
                            ['f', 'Intervention rapide (< 2h)'],
                            ['r', 'Plus de 50 avis'],
                            ['p', 'Photos avant / après'],
                        ].map(([k, l]) => (
                            <label key={k} className={styles.togRow}>
                                <span>{l}</span>
                                <div className={`${styles.tog} ${opts[k] ? styles.togOn : ''}`} onClick={() => togOpt(k)} role="switch" aria-checked={!!opts[k]}>
                                    <div className={styles.togKnob}/>
                                </div>
                            </label>
                        ))}
                    </section>
                </div>

                <div className={styles.modalFoot}>
                    <button className={styles.applyBtn} onClick={onClose}>
                        Afficher les résultats
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════
   MAP PIN
══════════════════════════════ */
function PricePin({ item, active, onClick }) {
    return (
        <button
            className={`${styles.pin} ${active ? styles.pinOn : ''}`}
            style={{ left: `${item._mx || 50}%`, top: `${item._my || 50}%` }}
            onClick={onClick}
            aria-label={`${item.price} DH — ${item.title}`}
        >
            {item.price} DH
        </button>
    );
}

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
export default function ExplorePage() {
    const [cats, setCats]             = useState([]);
    const [services, setServices]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [activeCat, setActiveCat]   = useState('all');
    const [query, setQuery]           = useState('');
    const [showMap, setShowMap]       = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [hoverId, setHoverId]       = useState(null);
    const [pinId, setPinId]           = useState(null);
    const [sortBy, setSortBy]         = useState('recent');
    const catRef  = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [cR, pR] = await Promise.all([getData('/categories'), getData('/products')]);
                if (cR.success) setCats(cR.categories);
                if (pR.success) setServices(pR.products.map((p, i) => ({
                    ...p, _mx: 12 + (i * 19) % 74, _my: 12 + (i * 13) % 72,
                })));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = useMemo(() => {
        let list = services.filter(s => {
            const mc = activeCat === 'all' || s.categoryId === activeCat;
            const q  = query.toLowerCase();
            const ms = !q || [s.title, s.categoryName, s.city].some(v => v?.toLowerCase().includes(q));
            return mc && ms;
        });
        if (sortBy === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
        return list;
    }, [services, activeCat, query, sortBy]);

    const pinItem = filtered.find(s => s.id === pinId);
    const sc = dir => catRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
    const activeCatName = cats.find(c => c._id === activeCat)?.nom;
    const activeFiltersCount = (activeCat !== 'all' ? 1 : 0) + (query ? 1 : 0);

    return (
        <div className={styles.root}>

            {/* ── TOP BAR ── */}
            <div className={styles.topBar}>
                <div className={styles.topBarInner}>

                    {/* Compound search */}
                    <div className={styles.searchWrap}>
                        {/* Service segment */}
                        <div className={styles.searchSegment}>
                            <Search size={15} strokeWidth={2} className={styles.searchIco}/>
                            <input
                                ref={searchRef}
                                className={styles.searchInput}
                                type="text"
                                placeholder="Service, artisan..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                aria-label="Rechercher"
                            />
                            {query && (
                                <button
                                    className={styles.clearBtn}
                                    onClick={() => { setQuery(''); searchRef.current?.focus(); }}
                                >
                                    <X size={11} strokeWidth={3}/>
                                </button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className={styles.searchDivider}/>

                        {/* Location segment */}
                        <div className={styles.locationSegment}>
                            <MapPin size={13} strokeWidth={2.5} className={styles.locationIco}/>
                            <span className={styles.locationText}>Casablanca</span>
                        </div>
                    </div>

                    {/* Sort */}
                    <select
                        className={styles.sortSel}
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="recent">Récent</option>
                        <option value="price-asc">Prix ↑</option>
                        <option value="price-desc">Prix ↓</option>
                    </select>

                    {/* Filter */}
                    <button className={styles.filterBtn} onClick={() => setShowFilter(true)}>
                        <SlidersHorizontal size={14} strokeWidth={2.5}/>
                        <span>Filtres</span>
                        {activeFiltersCount > 0 && (
                            <span className={styles.filterCount}>{activeFiltersCount}</span>
                        )}
                    </button>
                </div>

                {/* ── CATEGORY PILLS ── */}
                <div className={styles.catBar}>
                    <button className={styles.catArrow} onClick={() => sc(-1)} aria-label="Précédent">
                        <ChevronLeft size={13} strokeWidth={2.5}/>
                    </button>

                    <div className={styles.catScroll} ref={catRef}>
                        {/* Tout */}
                        <button
                            className={`${styles.pill} ${activeCat === 'all' ? styles.pillOn : ''}`}
                            onClick={() => setActiveCat('all')}
                        >
                            <div className={styles.pillIcon}>
                                <LayoutGrid size={17} strokeWidth={1.8}/>
                            </div>
                            <span>Tout</span>
                        </button>

                        {cats.map(cat => (
                            <CatPill
                                key={cat._id}
                                cat={cat}
                                active={activeCat === cat._id}
                                onClick={() => setActiveCat(cat._id)}
                            />
                        ))}
                    </div>

                    <button className={styles.catArrow} onClick={() => sc(1)} aria-label="Suivant">
                        <ChevronRight size={13} strokeWidth={2.5}/>
                    </button>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className={`${styles.body} ${showMap ? styles.bodySplit : ''}`}>

                <div className={styles.results}>

                    {/* Count + chips */}
                    {!loading && (
                        <div className={styles.countBar}>
                            <p className={styles.count}>
                                <strong>{filtered.length}</strong>{' '}
                                service{filtered.length !== 1 ? 's' : ''} disponibles
                                {activeCatName && <> · {activeCatName}</>}
                            </p>

                            {(activeCat !== 'all' || query) && (
                                <div className={styles.chips}>
                                    {query && (
                                        <button className={styles.chip} onClick={() => setQuery('')}>
                                            &ldquo;{query}&rdquo;
                                            <span className={styles.chipX}>✕</span>
                                        </button>
                                    )}
                                    {activeCat !== 'all' && (
                                        <button className={styles.chip} onClick={() => setActiveCat('all')}>
                                            {activeCatName}
                                            <span className={styles.chipX}>✕</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Skeleton */}
                    {loading ? (
                        <div className={styles.grid}>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className={styles.skel}>
                                    <div className={styles.skelThumb}/>
                                    <div className={styles.skelBody}>
                                        <div className={styles.skelLine} style={{ width: '42%' }}/>
                                        <div className={styles.skelLine} style={{ width: '78%', height: 13 }}/>
                                        <div className={styles.skelLine} style={{ width: '58%' }}/>
                                        <div className={styles.skelLine} style={{ width: '34%' }}/>
                                    </div>
                                </div>
                            ))}
                        </div>

                        /* Cards */
                    ) : filtered.length > 0 ? (
                        <div className={`${styles.grid} ${showMap ? styles.gridSm : ''}`}>
                            {filtered.map((s, i) => (
                                <div
                                    key={s.id}
                                    className={styles.cardAnim}
                                    style={{ animationDelay: `${i * 28}ms` }}
                                >
                                    <ServiceCard
                                        item={s}
                                        index={i}
                                        onHover={setHoverId}
                                        highlighted={hoverId === s.id}
                                    />
                                </div>
                            ))}
                        </div>

                        /* Empty */
                    ) : (
                        <div className={styles.empty}>
                            <div className={styles.emptyIllustration}>
                                <Search size={28} strokeWidth={1.5}/>
                            </div>
                            <h3>Aucun résultat</h3>
                            <p>Essayez d&apos;élargir votre recherche ou de modifier les filtres.</p>
                            <button className={styles.emptyBtn} onClick={() => { setActiveCat('all'); setQuery(''); }}>
                                Voir tous les services
                            </button>
                        </div>
                    )}
                </div>

                {/* Map */}
                {showMap && (
                    <div className={styles.mapPane}>
                        <iframe
                            title="map"
                            className={styles.mapFrame}
                            loading="lazy"
                            allowFullScreen
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d215424!2d-7.6026!3d33.5883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sma!4v1680000000000!5m2!1sfr!2sma"
                        />
                        <div className={styles.pinsLayer}>
                            {filtered.map(item => (
                                <PricePin
                                    key={item.id}
                                    item={item}
                                    active={hoverId === item.id || pinId === item.id}
                                    onClick={() => setPinId(pinId === item.id ? null : item.id)}
                                />
                            ))}
                        </div>

                        {pinItem && (
                            <div className={styles.pinPopup}>
                                <button className={styles.pinClose} onClick={() => setPinId(null)}>
                                    <X size={12} strokeWidth={2.5}/>
                                </button>
                                <img src={pickImg(pinItem, 0)} alt={pinItem.title} className={styles.pinImg}/>
                                <div className={styles.pinInfo}>
                                    <p className={styles.pinName}>{pinItem.title}</p>
                                    <p className={styles.pinMeta}>
                                        <MapPin size={10}/>
                                        {pinItem.city} · <Star size={10} fill="#0F172A" color="#0F172A" strokeWidth={0}/> 4.8
                                    </p>
                                    <p className={styles.pinPrice}>
                                        <strong>{pinItem.price} DH</strong> / intervention
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── FAB ── */}
            <button className={styles.fab} onClick={() => setShowMap(v => !v)}>
                {showMap
                    ? <><List size={15} strokeWidth={2.5}/> Liste</>
                    : <><Map size={15} strokeWidth={2.5}/> Voir sur la carte</>
                }
            </button>

            {showFilter && <FilterModal onClose={() => setShowFilter(false)}/>}
        </div>
    );
}