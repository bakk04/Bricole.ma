'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MapPin, Star, ShieldCheck, Heart, Share2,
    MessageCircle, Phone, ArrowLeft,
    CheckCircle2, Clock, Award, Loader2, AlertCircle,
    User, ChevronLeft, Upload, Grid
} from 'lucide-react';
import { getData } from '@/lib/api';
import styles from './details.module.css';

export default function ServiceDetailsPage() {
    const { sid } = useParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const res = await getData(`/products/${sid}`);
                if (res.success) {
                    setData(res);
                } else {
                    setError("Service introuvable");
                }
            } catch (err) {
                console.error("Erreur chargement détails:", err);
                setError("Erreur lors du chargement des informations.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [sid]);

    // Leaflet Map
    useEffect(() => {
        if (!loading && data && mapRef.current && typeof window !== 'undefined' && window.L) {
            if (mapInstance.current) return;
            const L = window.L;
            const cityCoords = {
                'Casablanca': [33.5731, -7.5898],
                'Rabat': [34.0209, -6.8416],
                'Marrakech': [31.6295, -7.9811],
                'Tanger': [35.7595, -5.8340],
                'Agadir': [30.4278, -9.5981]
            };
            const city = data.product.city || data.artisan?.city || 'Casablanca';
            const coords = cityCoords[city] || [33.5731, -7.5898];

            mapInstance.current = L.map(mapRef.current, {
                center: coords, zoom: 13, scrollWheelZoom: false
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(mapInstance.current);

            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background:#ff385c;width:36px;height:36px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.25)"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg></div>`,
                iconSize: [36, 36], iconAnchor: [18, 36]
            });
            L.marker(coords, { icon: customIcon }).addTo(mapInstance.current);
        }
        return () => {
            if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
        };
    }, [loading, data]);

    if (loading) return (
        <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={32} />
            <p>Chargement...</p>
        </div>
    );

    if (error || !data) return (
        <div className={styles.errorContainer}>
            <AlertCircle size={40} color="#ea4335" />
            <h2>Oups !</h2>
            <p>{error || "Une erreur est survenue."}</p>
            <button onClick={() => router.back()} className={styles.backBtn}>
                <ArrowLeft size={16} /> Retour
            </button>
        </div>
    );

    const { product, artisan, reviews, recommendations } = data;
    const images = product.images?.length > 0 ? product.images : [product.imageUrl || '/media/images/placeholder.jpg'];

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({ title: product.title, url: window.location.href });
        }
    };

    return (
        <div className={styles.page}>

            {/* MOBILE TOP NAV */}
            <div className={styles.mobileNav}>
                <button className={styles.mobileNavBtn} onClick={() => router.back()}>
                    <ChevronLeft size={20} />
                </button>
                <div className={styles.mobileNavRight}>
                    <button className={styles.mobileNavBtn} onClick={handleShare}><Share2 size={18} /></button>
                    <button className={`${styles.mobileNavBtn} ${liked ? styles.likedBtn : ''}`} onClick={() => setLiked(!liked)}>
                        <Heart size={18} fill={liked ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            {/* GALLERY */}
            <section className={styles.gallery}>
                {/* Mobile: swipeable single image */}
                <div className={styles.galleryMobile}>
                    <img src={images[activeImg]} alt={product.title} className={styles.galleryMobileImg} />
                    {images.length > 1 && (
                        <div className={styles.galleryDots}>
                            {images.map((_, i) => (
                                <button key={i} className={`${styles.dot} ${i === activeImg ? styles.dotActive : ''}`}
                                        onClick={() => setActiveImg(i)} />
                            ))}
                        </div>
                    )}
                    <span className={styles.imgCounter}>{activeImg + 1} / {images.length}</span>
                </div>

                {/* Desktop: grid like Airbnb */}
                <div className={styles.galleryDesktop}>
                    {images.length >= 5 ? (
                        <div className={styles.galleryGrid5}>
                            <div className={styles.galleryMain}><img src={images[0]} alt={product.title} /></div>
                            <div className={styles.gallerySide}>
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={styles.galleryThumb}>
                                        <img src={images[i] || images[0]} alt={`${product.title} ${i}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : images.length >= 3 ? (
                        <div className={styles.galleryGrid3}>
                            <div className={styles.galleryMain}><img src={images[0]} alt={product.title} /></div>
                            <div className={styles.gallerySide2}>
                                {[1,2].map(i => (
                                    <div key={i} className={styles.galleryThumb}>
                                        <img src={images[i] || images[0]} alt={`${product.title} ${i}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.gallerySingle}>
                            <img src={images[0]} alt={product.title} />
                        </div>
                    )}
                    <button className={styles.showAllBtn}>
                        <Grid size={14} /> Voir toutes les photos
                    </button>
                </div>
            </section>

            <div className={styles.container}>

                {/* HEADER INFO */}
                <section className={styles.headerSection}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.title}>{product.title}</h1>
                        <div className={styles.headerMeta}>
                            <div className={styles.ratingChip}>
                                <Star size={12} fill="currentColor" />
                                <span>{artisan?.rating || 4.8}</span>
                            </div>
                            <span className={styles.dot2}>·</span>
                            <span className={styles.reviewLink}>{reviews.length} avis</span>
                            {product.isVerified && <>
                                <span className={styles.dot2}>·</span>
                                <div className={styles.verifiedChip}>
                                    <ShieldCheck size={12} color="#34a853" />
                                    <span>Vérifié</span>
                                </div>
                            </>}
                            <span className={styles.dot2}>·</span>
                            <div className={styles.locationChip}>
                                <MapPin size={12} />
                                <span>{product.city || artisan?.city || 'Maroc'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop share/save */}
                    <div className={styles.headerActions}>
                        <button className={styles.actionBtn} onClick={handleShare}>
                            <Share2 size={14} /> Partager
                        </button>
                        <button className={`${styles.actionBtn} ${liked ? styles.liked : ''}`} onClick={() => setLiked(!liked)}>
                            <Heart size={14} fill={liked ? "currentColor" : "none"} />
                            {liked ? 'Enregistré' : 'Enregistrer'}
                        </button>
                    </div>
                </section>

                {/* MAIN LAYOUT */}
                <div className={styles.mainLayout}>

                    {/* LEFT COLUMN */}
                    <div className={styles.contentLeft}>

                        {/* Artisan brief */}
                        <div className={styles.artisanBrief}>
                            <div>
                                <h2>Service proposé par <strong>{artisan?.name || 'un artisan'}</strong></h2>
                                <p>{artisan?.speciality || product.categoryName} · {artisan?.experience || '5+'} ans d'expérience</p>
                            </div>
                            <div className={styles.artisanAvatar}>
                                {artisan?.image
                                    ? <img src={artisan.image} alt={artisan.name} />
                                    : <div className={styles.avatarPlaceholder}><User size={20} /></div>
                                }
                                {artisan?.rating >= 4.9 && <span className={styles.superhost}>⭐</span>}
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className={styles.highlights}>
                            <div className={styles.highlightItem}>
                                <Clock size={22} className={styles.highlightIcon} />
                                <div>
                                    <h4>Réponse rapide</h4>
                                    <p>Répond généralement en moins de 2 heures.</p>
                                </div>
                            </div>
                            <div className={styles.highlightItem}>
                                <CheckCircle2 size={22} className={styles.highlightIcon} />
                                <div>
                                    <h4>Déplacement inclus</h4>
                                    <p>Prix incluant les frais de déplacement dans sa zone.</p>
                                </div>
                            </div>
                            <div className={styles.highlightItem}>
                                <Award size={22} className={styles.highlightIcon} />
                                <div>
                                    <h4>Travail garanti</h4>
                                    <p>Garantie satisfaction sur tous les travaux.</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className={styles.descriptionSection}>
                            <p>{product.description}</p>
                        </div>

                        {/* Reviews */}
                        <section className={styles.reviewsSection}>
                            <div className={styles.reviewsHeader}>
                                <Star size={18} fill="currentColor" />
                                <span>{artisan?.rating || 4.8} · {reviews.length} avis</span>
                            </div>

                            <div className={styles.reviewsGrid}>
                                {reviews.length > 0 ? reviews.slice(0, 6).map(review => (
                                    <div key={review.id} className={styles.reviewCard}>
                                        <div className={styles.reviewUser}>
                                            <div className={styles.reviewAvatar}>
                                                {review.image
                                                    ? <img src={review.image} alt={review.client} />
                                                    : <div className={styles.reviewAvatarPlaceholder}>{(review.client || 'U')[0].toUpperCase()}</div>
                                                }
                                            </div>
                                            <div>
                                                <div className={styles.reviewName}>{review.client}</div>
                                                <div className={styles.reviewDate}>
                                                    {new Date(review.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                        <p className={styles.reviewContent}>{review.commentaire}</p>
                                    </div>
                                )) : (
                                    <p className={styles.noReviews}>Aucun avis pour le moment.</p>
                                )}
                            </div>
                        </section>

                        {/* Map */}
                        <section className={styles.mapSection}>
                            <h3>Zone d'intervention</h3>
                            <div ref={mapRef} className={styles.mapWrapper}></div>
                            <p className={styles.mapCity}>{product.city || artisan?.city}, Maroc</p>
                            <p className={styles.mapNote}>La zone exacte sera communiquée après la mise en relation.</p>
                        </section>
                    </div>

                    {/* RIGHT COLUMN — Sticky Booking Card */}
                    <div className={styles.contentRight}>
                        <div className={styles.bookingCard}>
                            <div className={styles.bookingCardHeader}>
                                <div>
                                    <span className={styles.cardPrice}>{product.price} DH</span>
                                    <span className={styles.cardPriceSub}> / intervention</span>
                                </div>
                                <div className={styles.cardRating}>
                                    <Star size={12} fill="currentColor" />
                                    <span>{artisan?.rating || 4.8}</span>
                                    <span className={styles.cardReviewCount}>({reviews.length})</span>
                                </div>
                            </div>

                            <div className={styles.bookingActions}>
                                <button className={styles.btnPrimary}>
                                    Réserver ce service
                                </button>
                                <button className={styles.btnSecondary} onClick={() => window.location.href = `tel:${artisan?.phone || '#'}`}>
                                    <Phone size={15} /> Appeler l'artisan
                                </button>
                                <button className={styles.btnSecondary}>
                                    <MessageCircle size={15} /> Envoyer un message
                                </button>
                            </div>

                            <p className={styles.bookingFooter}>Aucun montant ne sera débité maintenant</p>

                            <div className={styles.bookingDivider} />
                            <div className={styles.bookingTags}>
                                {product.isVerified && <span className={styles.tag}><ShieldCheck size={11} /> Artisan vérifié</span>}
                                <span className={styles.tag}><Clock size={11} /> Réponse rapide</span>
                                <span className={styles.tag}><Award size={11} /> Garantie satisfaction</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RECOMMENDATIONS */}
                {recommendations?.length > 0 && (
                    <section className={styles.recommendations}>
                        <h3 className={styles.sectionTitle}>Services similaires</h3>
                        <div className={styles.recGrid}>
                            {recommendations.slice(0, 4).map(rec => (
                                <Link href={`/explore/details/${rec.id}`} key={rec.id} className={styles.recCard}>
                                    <div className={styles.recThumb}>
                                        <img src={rec.imageUrl || '/media/images/placeholder.jpg'} alt={rec.title} />
                                        <button className={styles.recHeart} onClick={e => e.preventDefault()}>
                                            <Heart size={14} />
                                        </button>
                                    </div>
                                    <div className={styles.recInfo}>
                                        <div className={styles.recTop}>
                                            <span className={styles.recTitle}>{rec.title}</span>
                                            <span className={styles.recRating}><Star size={11} fill="currentColor" /> {rec.rating || 4.8}</span>
                                        </div>
                                        <span className={styles.recMeta}>{rec.city}</span>
                                        <span className={styles.recPrice}>{rec.price} DH <span>/ intervention</span></span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* MOBILE BOTTOM BAR */}
            <div className={styles.mobileBar}>
                <div>
                    <div className={styles.mobileBarPrice}>{product.price} <span>DH</span></div>
                    <div className={styles.mobileBarSub}>/ intervention</div>
                </div>
                <div className={styles.mobileBarActions}>
                    <button className={styles.mobileBtnSecondary} onClick={() => window.location.href = `tel:${artisan?.phone || '#'}`}>
                        <Phone size={16} />
                    </button>
                    <button className={styles.mobileBtnPrimary}>Réserver</button>
                </div>
            </div>
        </div>
    );
}