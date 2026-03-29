'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    MapPin, Star, ShieldCheck, Heart, Share2, 
    MessageCircle, Phone, Calendar, ArrowLeft, 
    CheckCircle2, Clock, Info, User, ChevronRight,
    StarHalf, Award, Verified, Loader2, AlertCircle
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

    if (loading) return (
        <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={40} />
            <p>Chargement des détails...</p>
        </div>
    );

    if (error || !data) return (
        <div className={styles.errorContainer}>
            <AlertCircle size={48} color="#ea4335" />
            <h2>Oups !</h2>
            <p>{error || "Une erreur est survenue."}</p>
            <button onClick={() => router.back()} className={styles.backBtn}>
                <ArrowLeft size={18} /> Retour
            </button>
        </div>
    );

    const { product, artisan, reviews, recommendations } = data;

    return (
        <div className={styles.page}>
            {/* TOP BAR / NAVIGATION */}
            <nav className={styles.topNav}>
                <div className={styles.container}>
                    <button onClick={() => router.back()} className={styles.navBack}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className={styles.navBreadcrumb}>
                        <Link href="/explore">Explorer</Link>
                        <ChevronRight size={14} />
                        <span>{product.categoryName}</span>
                    </div>
                    <div className={styles.navActions}>
                        <button className={styles.actionBtn}><Share2 size={18} /></button>
                        <button 
                            className={`${styles.actionBtn} ${liked ? styles.liked : ''}`}
                            onClick={() => setLiked(!liked)}
                        >
                            <Heart size={18} fill={liked ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className={styles.container}>
                <div className={styles.mainLayout}>
                    
                    {/* LEFT CONTENT */}
                    <div className={styles.contentLeft}>
                        {/* Gallery */}
                        <section className={styles.gallery}>
                            <div className={styles.mainImage}>
                                <img src={product.imageUrl || '/media/images/placeholder.jpg'} alt={product.title} />
                                {isNew(product.createdAt) && <span className={styles.badgeNew}>Nouveau</span>}
                            </div>
                            {product.images?.length > 1 && (
                                <div className={styles.thumbnails}>
                                    {product.images.map((img, i) => (
                                        <div key={i} className={styles.thumb}>
                                            <img src={img} alt={`${product.title} - ${i}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Title & Info */}
                        <section className={styles.headerInfo}>
                            <div className={styles.catRow}>
                                <span className={styles.categoryPill}>{product.categoryName}</span>
                                {product.isVerified && <span className={styles.verified}><ShieldCheck size={14} /> Artisan Vérifié</span>}
                            </div>
                            <h1 className={styles.title}>{product.title}</h1>
                            <div className={styles.meta}>
                                <div className={styles.metaItem}>
                                    <MapPin size={16} />
                                    <span>{product.city || artisan?.city}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <Star size={16} fill="#ffb400" color="#ffb400" />
                                    <span>{artisan?.rating || 4.8} <b>({reviews.length} avis)</b></span>
                                </div>
                            </div>
                        </section>

                        <div className={styles.divider} />

                        {/* Description */}
                        <section className={styles.description}>
                            <h3>À propos de ce service</h3>
                            <p>{product.description}</p>
                            
                            <div className={styles.features}>
                                <div className={styles.feature}>
                                    <CheckCircle2 size={18} />
                                    <span>Déplacement inclus</span>
                                </div>
                                <div className={styles.feature}>
                                    <Clock size={18} />
                                    <span>Réponse rapide (moins de 2h)</span>
                                </div>
                                <div className={styles.feature}>
                                    <Award size={18} />
                                    <span>Garantie satisfaction</span>
                                </div>
                            </div>
                        </section>

                        <div className={styles.divider} />

                        {/* Reviews */}
                        <section className={styles.reviewsSection}>
                            <div className={styles.sectionHeader}>
                                <h3>Avis des clients <span>({reviews.length})</span></h3>
                                <button className={styles.writeReviewBtn}>Laisser un avis</button>
                            </div>
                            
                            {reviews.length > 0 ? (
                                <div className={styles.reviewList}>
                                    {reviews.map(review => (
                                        <div key={review.id} className={styles.reviewCard}>
                                            <div className={styles.reviewHeader}>
                                                <div className={styles.reviewerAvatar}>
                                                    {review.image ? <img src={review.image} alt={review.client} /> : <span>{review.client?.[0]}</span>}
                                                </div>
                                                <div className={styles.reviewerInfo}>
                                                    <span className={styles.reviewerName}>{review.client}</span>
                                                    <div className={styles.reviewMeta}>
                                                        <div className={styles.stars}>
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} fill={i < review.note ? "#ffb400" : "none"} color="#ffb400" />
                                                            ))}
                                                        </div>
                                                        <span className={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className={styles.reviewText}>{review.commentaire}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noReviews}>Aucun avis pour le moment. Soyez le premier à en laisser un !</p>
                            )}
                        </section>
                    </div>

                    {/* RIGHT SIDEBAR (Sticky) */}
                    <aside className={styles.contentRight}>
                        <div className={styles.bookingCard}>
                            <div className={styles.priceContainer}>
                                <span className={styles.priceLabel}>Tarif indicatif</span>
                                <div className={styles.price}>
                                    {product.price} <span>DH</span>
                                </div>
                            </div>

                            <div className={styles.bookingActions}>
                                <button className={styles.btnCall}>
                                    <Phone size={18} /> Appeler l'artisan
                                </button>
                                <button className={styles.btnMessage}>
                                    <MessageCircle size={18} /> Envoyer un message
                                </button>
                                <button className={styles.btnQuote}>
                                    Demander un devis gratuit
                                </button>
                            </div>

                            <p className={styles.secureText}>
                                <Verified size={14} /> Paiement sécurisé via Bricole.ma
                            </p>
                        </div>

                        {/* Artisan Profile Card */}
                        <div className={styles.artisanCard}>
                            <div className={styles.artisanHeader}>
                                <div className={styles.artisanAvatar}>
                                    <img src={artisan?.image || '/media/images/placeholder.jpg'} alt={artisan?.name} />
                                    <div className={styles.artisanStatus} />
                                </div>
                                <div className={styles.artisanMeta}>
                                    <h4>{artisan?.name}</h4>
                                    <span className={styles.artisanTitle}>{artisan?.speciality || product.categoryName}</span>
                                </div>
                            </div>
                            <div className={styles.artisanStats}>
                                <div className={styles.aStat}>
                                    <b>{artisan?.experience || '5+'}</b>
                                    <span>Expérience</span>
                                </div>
                                <div className={styles.aStat}>
                                    <b>{artisan?.rating || '4.8'}</b>
                                    <span>Note</span>
                                </div>
                            </div>
                            <p className={styles.artisanBio}>{artisan?.bio || "Cet artisan s'engage à fournir un travail de qualité pour tous vos besoins de bricolage."}</p>
                            <Link href={`/profile/${artisan?.id}`} className={styles.viewProfile}>
                                Voir le profil complet <ChevronRight size={14} />
                            </Link>
                        </div>
                    </aside>
                </div>

                {/* RECOMMENDATIONS */}
                {recommendations.length > 0 && (
                    <section className={styles.recommendations}>
                        <h3 className={styles.sectionTitle}>Services similaires</h3>
                        <div className={styles.recGrid}>
                            {recommendations.map(rec => (
                                <Link href={`/explore/details/${rec.id}`} key={rec.id} className={styles.recCard}>
                                    <div className={styles.recThumb}>
                                        <img src={rec.imageUrl || '/media/images/placeholder.jpg'} alt={rec.title} />
                                    </div>
                                    <div className={styles.recInfo}>
                                        <h4>{rec.title}</h4>
                                        <div className={styles.recMeta}>
                                            <span className={styles.recPrice}>{rec.price} DH</span>
                                            <span className={styles.recCity}><MapPin size={10} /> {rec.city}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Bottom Mobile Bar */}
            <div className={styles.mobileActions}>
                <div className={styles.mobilePrice}>
                    <span>{product.price} DH</span>
                </div>
                <button className={styles.mobileBtn}>Contacter l'artisan</button>
            </div>
        </div>
    );
}

function isNew(date) {
    if (!date) return false;
    return Date.now() - new Date(date).getTime() < 4 * 24 * 60 * 60 * 1000;
}
