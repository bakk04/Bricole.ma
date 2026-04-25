'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import {
    MapPin, Star, ShieldCheck, Heart, Share2,
    MessageCircle, Phone, ArrowLeft,
    CheckCircle2, Clock, Award, Loader2, AlertCircle,
    User, ChevronLeft, ChevronRight, Grid3x3,
    Zap, BadgeCheck, ThumbsUp
} from 'lucide-react';
import { getData } from '@/lib/api';
import styles from './details.module.css';
import FavoriteButton from '@/components/FavoriteButton';

/* ══════════════════════════════
   STAR DISPLAY
══════════════════════════════ */
function Stars({ rating }: { rating: number }) {
    return (
        <span className={styles.stars}>
            {[1,2,3,4,5].map(n => (
                <Star key={n} size={12}
                      fill={n <= Math.round(rating) ? 'currentColor' : 'none'}
                      strokeWidth={2}
                />
            ))}
        </span>
    );
}

/* ══════════════════════════════
   GALLERY MODAL
══════════════════════════════ */
function GalleryModal({ images, startIdx, onClose }: {
    images: string[];
    startIdx: number;
    onClose: () => void;
}) {
    const [idx, setIdx] = useState(startIdx);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
            if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [images.length, onClose]);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.modalClose} onClick={onClose}>✕</button>
                <button className={`${styles.modalNav} ${styles.modalNavLeft}`}
                        onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}>
                    <ChevronLeft size={22} />
                </button>
                <img src={images[idx]} alt="" className={styles.modalImg} />
                <button className={`${styles.modalNav} ${styles.modalNavRight}`}
                        onClick={() => setIdx(i => (i + 1) % images.length)}>
                    <ChevronRight size={22} />
                </button>
                <div className={styles.modalCounter}>{idx + 1} / {images.length}</div>
            </div>
        </div>
    );
}

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
export default function ServiceDetailsPage() {
    const { sid } = useParams();
    const router  = useRouter();

    const [data,       setData]       = useState<any>(null);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState<string|null>(null);
    const [liked,      setLiked]      = useState(false);
    const [activeImg,  setActiveImg]  = useState(0);
    const [modalIdx,   setModalIdx]   = useState<number|null>(null);
    const [scrolled,   setScrolled]   = useState(false);

    const mapRef      = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const leafletRef  = useRef<any>(null);

    /* — scroll shadow for mobile nav — */
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    /* — fetch data — */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await getData(`/products/${sid}`);
                if (res.success) setData(res);
                else setError('Service introuvable');
            } catch { setError('Erreur lors du chargement.'); }
            finally { setLoading(false); }
        })();
    }, [sid]);

    /* — load Leaflet — */
    useEffect(() => {
        import('leaflet').then(L => {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
            leafletRef.current = L;
        });
    }, []);

    /* — init map — */
    useEffect(() => {
        if (loading || !data || !mapRef.current || !leafletRef.current) return;
        if (mapInstance.current) return;

        const L = leafletRef.current;
        const cityCoords: Record<string, [number,number]> = {
            'Casablanca': [33.5731,-7.5898],
            'Rabat':      [34.0209,-6.8416],
            'Marrakech':  [31.6295,-7.9811],
            'Tanger':     [35.7595,-5.8340],
            'Agadir':     [30.4278,-9.5981],
            'Fes':        [34.0181,-5.0078],
        };
        const city   = data.product?.city || data.artisan?.city || 'Casablanca';
        const coords = cityCoords[city] || [33.5731,-7.5898];

        mapInstance.current = L.map(mapRef.current, {
            center: coords, zoom: 13, scrollWheelZoom: false, zoomControl: false,
        });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap',
        }).addTo(mapInstance.current);
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

        const icon = L.divIcon({
            className: '',
            html: `<div class="detail-map-pin"><svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></div>`,
            iconSize:   [42,42],
            iconAnchor: [21,42],
        });
        L.marker(coords, { icon }).addTo(mapInstance.current);

        return () => {
            mapInstance.current?.remove();
            mapInstance.current = null;
        };
    }, [loading, data]);

    /* ── LOADING ── */
    if (loading) return (
        <div className={styles.stateWrap}>
            <div className={styles.spinner}>
                <Loader2 size={28} />
            </div>
            <p>Chargement du service…</p>
        </div>
    );

    /* ── ERROR ── */
    if (error || !data) return (
        <div className={styles.stateWrap}>
            <AlertCircle size={44} className={styles.errorIcon} />
            <h2>Service introuvable</h2>
            <p>{error || 'Une erreur est survenue.'}</p>
            <button className={styles.backBtnAlt} onClick={() => router.back()}>
                <ArrowLeft size={15} /> Retour
            </button>
        </div>
    );

    const { product, artisan, reviews = [], recommendations = [] } = data;
    const images = product.images?.length ? product.images
        : [product.imageUrl || '/media/images/placeholder.jpg'];
    const rating = artisan?.rating || 4.8;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({ title: product.title, url: window.location.href });
        } else {
            navigator.clipboard?.writeText(window.location.href);
        }
    };

    return (
        <div className={styles.page}>

            {/* ══ MODAL ══ */}
            {modalIdx !== null && (
                <GalleryModal images={images} startIdx={modalIdx} onClose={() => setModalIdx(null)} />
            )}

            {/* ══ MOBILE TOPBAR ══ */}
            <div className={`${styles.mobileTopbar} ${scrolled ? styles.mobileTopbarScrolled : ''}`}>
                <button className={styles.iconBtn} onClick={() => router.back()}>
                    <ChevronLeft size={20} />
                </button>
                <div className={styles.mobileTopbarActions}>
                    <button className={styles.iconBtn} onClick={handleShare}><Share2 size={17} /></button>
                    <FavoriteButton 
                        productId={sid as string} 
                        className={styles.iconBtn}
                    />
                </div>
            </div>

            {/* ══ GALLERY ══ */}
            <section className={styles.gallery}>

                {/* Mobile swiper */}
                <div className={styles.galleryMobile}>
                    <div className={styles.galleryMobileTrack}
                         style={{ transform: `translateX(-${activeImg * 100}%)` }}>
                        {images.map((src: string, i: number) => (
                            <img key={i} src={src} alt={product.title} className={styles.galleryMobileImg}
                                 onClick={() => setModalIdx(i)} />
                        ))}
                    </div>
                    {images.length > 1 && (
                        <>
                            <button className={`${styles.galleryArrow} ${styles.galleryArrowL}`}
                                    onClick={() => setActiveImg(i => Math.max(0, i - 1))}>
                                <ChevronLeft size={18} />
                            </button>
                            <button className={`${styles.galleryArrow} ${styles.galleryArrowR}`}
                                    onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}>
                                <ChevronRight size={18} />
                            </button>
                            <div className={styles.galleryDots}>
                                {images.map((_: any, i: number) => (
                                    <button key={i}
                                            className={`${styles.dot} ${i === activeImg ? styles.dotOn : ''}`}
                                            onClick={() => setActiveImg(i)} />
                                ))}
                            </div>
                        </>
                    )}
                    <span className={styles.imgBadge}>{activeImg + 1} / {images.length}</span>
                </div>

                {/* Desktop Airbnb-style grid */}
                <div className={styles.galleryDesktop}>
                    <div className={`${styles.galleryGrid} ${images.length === 1 ? styles.galleryGrid1 : images.length <= 3 ? styles.galleryGrid3 : styles.galleryGrid5}`}>
                        {images.slice(0, 5).map((src: string, i: number) => (
                            <div key={i} className={`${styles.galleryCell} ${i === 0 ? styles.galleryCellMain : ''}`}
                                 onClick={() => setModalIdx(i)}>
                                <img src={src} alt={`${product.title} ${i + 1}`} />
                                <div className={styles.galleryCellOverlay} />
                            </div>
                        ))}
                    </div>
                    <button className={styles.showAllBtn} onClick={() => setModalIdx(0)}>
                        <Grid3x3 size={14} /> Voir toutes les photos
                    </button>
                </div>
            </section>

            {/* ══ CONTENT ══ */}
            <div className={styles.container}>
                <div className={styles.layout}>

                    {/* ── LEFT COLUMN ── */}
                    <div className={styles.left}>

                        {/* Title block */}
                        <div className={styles.titleBlock}>
                            <h1 className={styles.title}>{product.title}</h1>
                            <div className={styles.titleMeta}>
                                <span className={styles.ratingPill}>
                                    <Star size={12} fill="currentColor" />
                                    {rating}
                                </span>
                                <span className={styles.metaDot}>·</span>
                                <button className={styles.metaLink}>{reviews.length} avis</button>
                                {product.isVerified && <>
                                    <span className={styles.metaDot}>·</span>
                                    <span className={styles.verifiedPill}>
                                        <BadgeCheck size={13} /> Vérifié
                                    </span>
                                </>}
                                <span className={styles.metaDot}>·</span>
                                <span className={styles.cityPill}>
                                    <MapPin size={12} />
                                    {product.city || artisan?.city || 'Maroc'}
                                </span>
                            </div>

                            {/* Desktop share/save */}
                            <div className={styles.desktopActions}>
                                <button className={styles.ghostBtn} onClick={handleShare}>
                                    <Share2 size={14} /> Partager
                                </button>
                                <button className={`${styles.ghostBtn} ${liked ? styles.ghostBtnLiked : ''}`}
                                        onClick={() => setLiked(!liked)}>
                                    <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                                    {liked ? 'Enregistré' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>

                        <div className={styles.divider} />

                        {/* Artisan brief */}
                        <div className={styles.artisanRow}>
                            <div className={styles.artisanInfo}>
                                <h2 className={styles.artisanName}>
                                    Service proposé par <strong>{artisan?.name || 'un artisan'}</strong>
                                </h2>
                                <p className={styles.artisanSub}>
                                    {artisan?.speciality || product.categoryName}
                                    {artisan?.experience ? ` · ${artisan.experience} ans d'expérience` : ''}
                                </p>
                            </div>
                            <div className={styles.artisanAvatarWrap}>
                                {artisan?.image
                                    ? <img src={artisan.image} alt={artisan.name} className={styles.artisanAvatar} />
                                    : <div className={styles.artisanAvatarFallback}><User size={22} /></div>
                                }
                                {rating >= 4.9 && <span className={styles.superBadge}>⭐</span>}
                            </div>
                        </div>

                        <div className={styles.divider} />

                        {/* Highlights */}
                        <div className={styles.highlights}>
                            {[
                                { icon: Zap,          title: 'Réponse rapide',     sub: 'Répond généralement en moins de 2h.' },
                                { icon: CheckCircle2, title: 'Déplacement inclus', sub: 'Prix incluant les frais dans sa zone.' },
                                { icon: Award,        title: 'Travail garanti',    sub: 'Garantie satisfaction sur tous les travaux.' },
                            ].map(({ icon: Icon, title, sub }) => (
                                <div key={title} className={styles.highlightItem}>
                                    <Icon size={24} className={styles.highlightIcon} />
                                    <div>
                                        <h4>{title}</h4>
                                        <p>{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.divider} />

                        {/* Description */}
                        <div className={styles.descBlock}>
                            <h3>À propos de ce service</h3>
                            <p>{product.description || 'Aucune description disponible.'}</p>
                        </div>

                        <div className={styles.divider} />

                        {/* Reviews */}
                        <section className={styles.reviewsSection}>
                            <div className={styles.reviewsTop}>
                                <div className={styles.reviewsBig}>
                                    <Star size={22} fill="currentColor" />
                                    <span>{rating}</span>
                                </div>
                                <div className={styles.reviewsCount}>{reviews.length} avis clients</div>
                            </div>

                            {reviews.length > 0 ? (
                                <div className={styles.reviewsGrid}>
                                    {reviews.slice(0, 6).map((r: any) => (
                                        <div key={r.id} className={styles.reviewCard}>
                                            <div className={styles.reviewHead}>
                                                {r.image
                                                    ? <img src={r.image} alt={r.client} className={styles.reviewAvatar} />
                                                    : <div className={styles.reviewAvatarFallback}>
                                                        {(r.client || 'U')[0].toUpperCase()}
                                                    </div>
                                                }
                                                <div>
                                                    <div className={styles.reviewName}>{r.client}</div>
                                                    <div className={styles.reviewDate}>
                                                        {new Date(r.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                                    </div>
                                                </div>
                                                <Stars rating={r.rating || 5} />
                                            </div>
                                            <p className={styles.reviewText}>{r.commentaire}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.noReviews}>
                                    <ThumbsUp size={28} />
                                    <p>Soyez le premier à laisser un avis !</p>
                                </div>
                            )}
                        </section>

                        <div className={styles.divider} />

                        {/* Map */}
                        <section className={styles.mapSection}>
                            <h3>Zone d'intervention</h3>
                            <div ref={mapRef} className={styles.mapBox} />
                            <p className={styles.mapCity}>
                                <MapPin size={13} />
                                {product.city || artisan?.city || 'Maroc'}
                            </p>
                            <p className={styles.mapNote}>
                                La localisation exacte est communiquée après la mise en relation.
                            </p>
                        </section>
                    </div>

                    {/* ── RIGHT COLUMN — Booking card ── */}
                    <div className={styles.right}>
                        <div className={styles.bookCard}>
                            <div className={styles.bookCardHead}>
                                <div className={styles.bookPrice}>
                                    <strong>{product.price}</strong>
                                    <span> DH / intervention</span>
                                </div>
                                <div className={styles.bookRating}>
                                    <Star size={13} fill="currentColor" />
                                    <strong>{rating}</strong>
                                    <span>({reviews.length})</span>
                                </div>
                            </div>

                            <div className={styles.bookActions}>
                                {/* Primary CTA — animated shimmer */}
                                <button className={styles.btnPrimary}>
                                    <span className={styles.btnPrimaryShimmer} />
                                    <span className={styles.btnPrimaryInner}>
                                        Réserver ce service
                                    </span>
                                </button>

                                {/* Support buttons with staggered entrance */}
                                <div className={styles.supportBtns}>
                                    <button
                                        className={styles.supportBtn}
                                        style={{ '--delay': '0ms' } as React.CSSProperties}
                                        onClick={() => window.location.href = `tel:${artisan?.phone || '#'}`}
                                    >
                                        <span className={styles.supportBtnIcon}>
                                            <Phone size={16} />
                                        </span>
                                        <span className={styles.supportBtnLabel}>
                                            <strong>Appeler</strong>
                                            <small>Disponible maintenant</small>
                                        </span>
                                        <span className={styles.supportBtnArrow}>→</span>
                                    </button>

                                    <button
                                        className={styles.supportBtn}
                                        style={{ '--delay': '60ms' } as React.CSSProperties}
                                    >
                                        <span className={styles.supportBtnIcon}>
                                            <MessageCircle size={16} />
                                        </span>
                                        <span className={styles.supportBtnLabel}>
                                            <strong>Message</strong>
                                            <small>Réponse en &lt; 2h</small>
                                        </span>
                                        <span className={styles.supportBtnArrow}>→</span>
                                    </button>

                                    <button
                                        className={`${styles.supportBtn} ${styles.supportBtnWhatsapp}`}
                                        style={{ '--delay': '120ms' } as React.CSSProperties}
                                    >
                                        <span className={styles.supportBtnIcon}>
                                            {/* WhatsApp inline SVG */}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.529 5.862L.057 23.571a.75.75 0 0 0 .92.921l5.813-1.525A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.583-.5-5.078-1.37l-.361-.214-3.754.984.999-3.648-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                                            </svg>
                                        </span>
                                        <span className={styles.supportBtnLabel}>
                                            <strong>WhatsApp</strong>
                                            <small>Chat instantané</small>
                                        </span>
                                        <span className={styles.supportBtnArrow}>→</span>
                                    </button>
                                </div>
                            </div>

                            <p className={styles.bookNote}>Aucun montant ne sera débité maintenant</p>

                            <div className={styles.bookTags}>
                                {product.isVerified && (
                                    <span className={styles.bookTag}><ShieldCheck size={12} /> Artisan vérifié</span>
                                )}
                                <span className={styles.bookTag}><Clock size={12} /> Réponse rapide</span>
                                <span className={styles.bookTag}><Award size={12} /> Garantie satisfaction</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ══ RECOMMENDATIONS — same city / same category ══ */}
                {recommendations.length > 0 && (
                    <section className={styles.recoSection}>
                        {/* Section header with tabs */}
                        <div className={styles.recoHeader}>
                            <div>
                                <h3 className={styles.recoTitle}>Vous aimerez aussi</h3>
                                <p className={styles.recoSubtitle}>
                                    Services similaires à {product.city || 'votre région'}
                                </p>
                            </div>
                            <Link href="/explore" className={styles.recoSeeAll}>
                                Voir tout →
                            </Link>
                        </div>

                        {/* City group */}
                        <div className={styles.recoGroup}>
                            <div className={styles.recoGroupLabel}>
                                <MapPin size={13} />
                                Dans la même ville · {product.city || 'Maroc'}
                            </div>
                            <div className={styles.recoScroll}>
                                {recommendations.slice(0, 6).map((rec: any, i: number) => (
                                    <Link
                                        href={`/explore/details/${rec.id}`}
                                        key={rec.id}
                                        className={styles.recoCard}
                                        style={{ '--reco-delay': `${i * 70}ms` } as React.CSSProperties}
                                    >
                                        <div className={styles.recoThumb}>
                                            <img src={rec.imageUrl || '/media/images/placeholder.jpg'} alt={rec.title} />
                                            <div className={styles.recoOverlay} />
                                            <button className={styles.recoHeart} onClick={e => e.preventDefault()}>
                                                <Heart size={13} />
                                            </button>
                                            {rec.isVerified && (
                                                <span className={styles.recoBadge}>
                                                    <ShieldCheck size={10} /> Pro
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.recoBody}>
                                            <div className={styles.recoRow}>
                                                <span className={styles.recoName}>{rec.title}</span>
                                                <span className={styles.recoRating}>
                                                    <Star size={11} fill="currentColor" /> {rec.rating || 4.8}
                                                </span>
                                            </div>
                                            <span className={styles.recoCity}>
                                                <MapPin size={10} /> {rec.city}
                                            </span>
                                            <span className={styles.recoPrice}>
                                                <strong>{rec.price} DH</strong>
                                                <span> / intervention</span>
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Category group */}
                        <div className={styles.recoGroup}>
                            <div className={styles.recoGroupLabel}>
                                <Award size={13} />
                                Même catégorie · {product.categoryName || 'Services'}
                            </div>
                            <div className={styles.recoScroll}>
                                {[...recommendations].reverse().slice(0, 6).map((rec: any, i: number) => (
                                    <Link
                                        href={`/explore/details/${rec.id}`}
                                        key={`cat-${rec.id}`}
                                        className={styles.recoCard}
                                        style={{ '--reco-delay': `${i * 70}ms` } as React.CSSProperties}
                                    >
                                        <div className={styles.recoThumb}>
                                            <img src={rec.imageUrl || '/media/images/placeholder.jpg'} alt={rec.title} />
                                            <div className={styles.recoOverlay} />
                                            <button className={styles.recoHeart} onClick={e => e.preventDefault()}>
                                                <Heart size={13} />
                                            </button>
                                        </div>
                                        <div className={styles.recoBody}>
                                            <div className={styles.recoRow}>
                                                <span className={styles.recoName}>{rec.title}</span>
                                                <span className={styles.recoRating}>
                                                    <Star size={11} fill="currentColor" /> {rec.rating || 4.8}
                                                </span>
                                            </div>
                                            <span className={styles.recoCity}>
                                                <MapPin size={10} /> {rec.city}
                                            </span>
                                            <span className={styles.recoPrice}>
                                                <strong>{rec.price} DH</strong>
                                                <span> / intervention</span>
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* ══ MOBILE BOTTOM BAR ══ */}
            <div className={styles.mobileBar}>
                <div className={styles.mobileBarPrice}>
                    <strong>{product.price} DH</strong>
                    <span>/ intervention</span>
                </div>
                <div className={styles.mobileBarBtns}>
                    <button className={styles.mobilePhone}
                            onClick={() => window.location.href = `tel:${artisan?.phone || '#'}`}>
                        <Phone size={16} />
                    </button>
                    <button className={styles.mobilePrimary}>Réserver</button>
                </div>
            </div>

            {/* Leaflet map pin global style */}
            <style jsx global>{`
                .detail-map-pin {
                    width: 42px; height: 42px;
                    background: #2563eb;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid #fff;
                    box-shadow: 0 4px 16px rgba(37,99,235,.4);
                    display: flex; align-items: center; justify-content: center;
                }
                .detail-map-pin svg { transform: rotate(45deg); }
            `}</style>
        </div>
    );
}