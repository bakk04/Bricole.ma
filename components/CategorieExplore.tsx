'use client'
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './CategorieExplore.module.css';
import { getData } from '@/lib/api';

import {
    LucideDroplet, LucideZap, LucidePaintbrush, LucideHammer,
    LucideLeaf, LucideWind, LucideLayoutGrid, LucideKey,
    LucideSearch, LucideSlidersHorizontal, LucideHeart,
    LucideStar, LucideMapPin, LucideShieldCheck, LucideX,
    LucideChevronLeft, LucideChevronRight, LucideSparkles
} from 'lucide-react';

interface ListingItem {
    id: string;
    title: string;
    description: string;
    price: number | string;
    city: string;
    imageUrl?: string;
    images?: string[];
    categoryId?: string;
    categoryName?: string;
    isVerified?: boolean;
    createdAt?: string | Date;
}

const DEFAULT_CATEGORIES = [
    { id: 'all', label: 'Tous', Icon: LucideLayoutGrid },
    { id: 'plomberie', label: 'Plomberie', Icon: LucideDroplet },
    { id: 'electricite', label: 'Électricité', Icon: LucideZap },
    { id: 'peinture', label: 'Peinture', Icon: LucidePaintbrush },
    { id: 'menuiserie', label: 'Menuiserie', Icon: LucideHammer },
    { id: 'jardinage', label: 'Jardinage', Icon: LucideLeaf },
    { id: 'clima', label: 'Climatisation', Icon: LucideWind },
    { id: 'maconnerie', label: 'Maçonnerie', Icon: LucideLayoutGrid },
    { id: 'serrurerie', label: 'Serrurerie', Icon: LucideKey },
];

/* ─── Helper: is NEW (< 24h) ─── */
function isNew(createdAt: string | Date | undefined): boolean {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

/* ─── POPUP INSTAGRAM ─── */
interface PopupOverlayProps {
    item: ListingItem;
    liked: boolean;
    onLike: () => void;
    onClose: () => void;
}

const PopupOverlay: React.FC<PopupOverlayProps> = ({ item, liked, onLike, onClose }) => {
    const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl || '/placeholder.jpg'];
    const [imgIdx, setImgIdx] = useState(0);
    const isItemNew = isNew(item.createdAt);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setImgIdx(i => (i + 1) % images.length);
            if (e.key === 'ArrowLeft') setImgIdx(i => (i - 1 + images.length) % images.length);
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose, images.length]);

    return (
        <div className={styles.popupBackdrop} onClick={onClose}>
            <div className={styles.popupCard} onClick={e => e.stopPropagation()}>

                <button className={styles.popupClose} onClick={onClose} aria-label="Fermer">
                    <LucideX size={18} />
                </button>

                {/* LEFT IMAGE */}
                <div className={styles.popupLeft}>
                    <img src={images[imgIdx] || '/placeholder.jpg'} className={styles.popupImg} alt={item.title} />

                    {images.length > 1 && (
                        <>
                            <button className={`${styles.popupNav} ${styles.popupNavL}`}
                                     onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}>
                                <LucideChevronLeft size={18} />
                            </button>
                            <button className={`${styles.popupNav} ${styles.popupNavR}`}
                                     onClick={() => setImgIdx(i => (i + 1) % images.length)}>
                                <LucideChevronRight size={18} />
                            </button>
                            <div className={styles.popupDots}>
                                {images.map((_, i) => (
                                    <span key={i} className={`${styles.popupDot} ${i === imgIdx ? styles.popupDotActive : ''}`} />
                                ))}
                            </div>
                        </>
                    )}

                    {isItemNew && (
                        <div className={styles.popupNewBadge}>
                            <LucideSparkles size={12} />
                            Nouveau
                        </div>
                    )}
                </div>

                {/* RIGHT DETAILS */}
                <div className={styles.popupRight}>
                    <div className={styles.popupHeader}>
                        <span className={styles.popupCategoryPill}>{item.categoryName}</span>
                        {item.isVerified && (
                            <span className={styles.popupVerified}>
                                <LucideShieldCheck size={13} /> Vérifié
                            </span>
                        )}
                    </div>

                    <h2 className={styles.popupTitle}>{item.title}</h2>

                    <div className={styles.popupMeta}>
                        <div className={styles.popupMetaItem}>
                            <LucideMapPin size={14} color="#1a73e8" />
                            <span>{item.city}</span>
                        </div>
                        <div className={styles.popupMetaItem}>
                            <LucideStar size={14} fill="#1a73e8" color="#1a73e8" />
                            <span>4.8 <em>(128 avis)</em></span>
                        </div>
                    </div>

                    {item.description && (
                        <p className={styles.popupDesc}>{item.description}</p>
                    )}

                    <div className={styles.popupDivider} />

                    <div className={styles.popupBottom}>
                        <div className={styles.popupPriceBlock}>
                            <span className={styles.popupPriceLabel}>À partir de</span>
                            <div className={styles.popupPrice}>
                                {item.price} <span>DH</span>
                            </div>
                            <span className={styles.popupPriceUnit}>/ intervention</span>
                        </div>

                        <div className={styles.popupActions}>
                            <button
                                className={`${styles.popupFav} ${liked ? styles.popupFavActive : ''}`}
                                onClick={(e) => { e.preventDefault(); onLike(); }}
                                aria-label="Favori"
                            >
                                <LucideHeart size={20}
                                             fill={liked ? '#1a73e8' : 'none'}
                                             color={liked ? '#1a73e8' : '#222'}
                                             strokeWidth={2} />
                            </button>
                            <Link href={`/explore/details/${item.id}`} className={styles.popupCta}>
                                Voir le service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── CARD ─── */
interface ServiceCardProps {
    item: ListingItem;
    index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ item, index }) => {
    const [liked, setLiked] = useState(false);
    const [imgIdx, setImgIdx] = useState(0);
    const [popup, setPopup] = useState(false);
    const [longPressActive, setLongPressActive] = useState(false);

    // Timers refs
    const hoverTimer = useRef<NodeJS.Timeout | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const touchMoved = useRef(false);

    const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl || '/placeholder.jpg'];
    const isItemNew = isNew(item.createdAt);

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setLiked(p => !p);
    };
    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setImgIdx(i => (i - 1 + images.length) % images.length);
    };
    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setImgIdx(i => (i + 1) % images.length);
    };

    /* ── DESKTOP: hover 2 secondes ── */
    const handleMouseEnter = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 900) return;
        hoverTimer.current = setTimeout(() => setPopup(true), 2000);
    };
    const handleMouseLeave = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };

    /* ── MOBILE: long press 600ms ── */
    const handleTouchStart = () => {
        touchMoved.current = false;
        setLongPressActive(true);
        longPressTimer.current = setTimeout(() => {
            if (!touchMoved.current) {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
                setLongPressActive(false);
                setPopup(true);
            }
        }, 600);
    };

    const handleTouchMove = () => {
        touchMoved.current = true;
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setLongPressActive(false);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setLongPressActive(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (hoverTimer.current) clearTimeout(hoverTimer.current);
            if (longPressTimer.current) clearTimeout(longPressTimer.current);
        };
    }, []);

    return (
        <>
            <Link
                href={`/explore/details/${item.id}`}
                className={`${styles.card} ${longPressActive ? styles.longPressActive : ''}`}
                style={{ '--delay': `${index * 55}ms` } as React.CSSProperties}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={(e) => {
                    if (longPressActive) e.preventDefault();
                }}
            >
                <div className={styles.thumb}>
                    <img src={images[imgIdx] || '/placeholder.jpg'} className={styles.img} alt={item.title} />
                    <div className={styles.imgGradient} />

                    {/* NEW BADGE */}
                    {isItemNew && (
                        <div className={styles.newBadge}>
                            <LucideSparkles size={11} />
                            Nouveau
                        </div>
                    )}

                    {/* FAVORITE */}
                    <button
                        className={`${styles.favoriteBtn} ${liked ? styles.favoriteBtnActive : ''}`}
                        onClick={handleLike}
                        aria-label="Ajouter aux favoris"
                    >
                        <LucideHeart
                            size={18}
                            fill={liked ? '#1a73e8' : 'transparent'}
                            color={liked ? '#1a73e8' : '#fff'}
                            strokeWidth={2.5}
                        />
                    </button>

                    {/* NAV */}
                    {images.length > 1 && (
                        <>
                            <button className={`${styles.imgNav} ${styles.imgNavPrev}`} onClick={handlePrev}>
                                <LucideChevronLeft size={14} />
                            </button>
                            <button className={`${styles.imgNav} ${styles.imgNavNext}`} onClick={handleNext}>
                                <LucideChevronRight size={14} />
                            </button>
                            <div className={styles.imgDots}>
                                {images.map((_, i) => (
                                    <span key={i} className={`${styles.dot} ${i === imgIdx ? styles.dotActive : ''}`} />
                                ))}
                            </div>
                        </>
                    )}

                    {item.isVerified && (
                        <span className={styles.verifiedBadge}>
                            <LucideShieldCheck size={11} /> Vérifié
                        </span>
                    )}
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                        <span className={styles.cardTitle}>{item.title}</span>
                        <div className={styles.rating}>
                            <LucideStar size={12} fill="#1a73e8" color="#1a73e8" />
                            <span>4.8</span>
                        </div>
                    </div>
                    <div className={styles.cardLocation}>
                        <LucideMapPin size={12} /> {item.city}
                    </div>
                    <div className={styles.cardPrice}>
                        <span className={styles.priceAmount}>{item.price} DH</span>
                        <span className={styles.priceUnit}> / service</span>
                    </div>
                </div>
            </Link>

            {popup && (
                <PopupOverlay
                    item={item}
                    liked={liked}
                    onLike={() => setLiked(p => !p)}
                    onClose={() => setPopup(false)}
                />
            )}
        </>
    );
}

interface CategorieExploreProps {
    listingsData?: ListingItem[];
}

/* ─── MAIN ─── */
const CategorieExplore: React.FC<CategorieExploreProps> = ({ listingsData: initialData }) => {
    const [listingsData, setListingsData] = useState<ListingItem[]>(initialData || []);
    const [active, setActive] = useState("all");
    const [loading, setLoading] = useState(!initialData);
    const scrollRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setListingsData(initialData);
            setLoading(false);
            return;
        }
        (async () => {
            try {
                setLoading(true);
                const res = await getData("/products") as any;
                const formatted: ListingItem[] = (res.products || []).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    city: p.city || "Maroc",
                    imageUrl: p.imageUrl,
                    images: p.images,
                    categoryId: p.categoryId,
                    categoryName: p.categoryName,
                    isVerified: p.isVerified,
                    createdAt: p.createdAt,
                }));
                setListingsData(formatted);
            } catch (e) {
                console.error("Erreur:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const categories = useMemo(() => {
        const map = new Map();
        DEFAULT_CATEGORIES.forEach(c => map.set(c.id, c));
        listingsData.forEach(item => {
            if (item.categoryId && !map.has(item.categoryId)) {
                map.set(item.categoryId, { id: item.categoryId, label: item.categoryName || 'Autre', Icon: LucideLayoutGrid });
            }
        });
        return Array.from(map.values());
    }, [listingsData]);

    const filtered = useMemo(() => {
        if (active === "all") return listingsData;
        return listingsData.filter(i => i.categoryId === active);
    }, [listingsData, active]);

    const activeCat = categories.find(c => c.id === active);

    return (
        <section className={styles.section}>
            <div className={styles.container}>

                <div className={styles.header}>
                    <h2 className={styles.titleAnimated}>
                        Explorer les <span>services</span>
                    </h2>
                    <button className={styles.filterBtn}>
                        <LucideSlidersHorizontal size={15} />
                        Filtres
                    </button>
                </div>

                <div className={styles.chipsWrapper}>
                    <div className={styles.chipsScroll} ref={scrollRef}>
                        {categories.map((cat, i) => {
                            const isActive = cat.id === active;
                            return (
                                <button
                                    key={cat.id}
                                    className={`${styles.chip} ${isActive ? styles.active : ''}`}
                                    onClick={() => { setActive(cat.id); if (gridRef.current) gridRef.current.scrollLeft = 0; }}
                                    style={{ animationDelay: `${i * 35}ms` } as React.CSSProperties}
                                >
                                    <cat.Icon size={15} color={isActive ? "#1a73e8" : "#717171"} />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className={styles.chipsFadeRight} />
                </div>

                <div className={styles.gridWrapper} ref={gridRef}>
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className={styles.cardSkeleton}>
                                <div className={styles.skeletonThumb} />
                                <div className={styles.skeletonBody}>
                                    <div className={styles.skeletonLine} style={{ width: '75%' }} />
                                    <div className={styles.skeletonLine} style={{ width: '50%' }} />
                                    <div className={styles.skeletonLine} style={{ width: '38%' }} />
                                </div>
                            </div>
                        ))
                    ) : filtered.length > 0 ? (
                        filtered.map((item, i) => <ServiceCard key={item.id} item={item} index={i} />)
                    ) : (
                        <div className={styles.empty}>
                            <div className={styles.emptyIconWrap}><LucideSearch size={36} /></div>
                            <h4>Aucun service disponible</h4>
                            <p>Pas encore de services pour <b>{activeCat?.label}</b></p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default CategorieExplore;
