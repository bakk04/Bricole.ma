"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    MapPin, Phone, MessageCircle, ArrowLeft,
    Clock, ShieldCheck, Share2, Grid,
    Star, BadgeCheck, Zap,
} from "lucide-react";
import { getData } from "@/lib/api";
import s from "./ArtisanPublicProfile.module.css";

/* ═══════════════════════
   STAR RATING
═══════════════════════ */
function Stars({
                   rating,
                   count,
                   size = 13,
               }: {
    rating: number;
    count?: number;
    size?: number;
}) {
    const full = Math.floor(rating ?? 0);
    const half = (rating ?? 0) % 1 >= 0.5;

    return (
        <div className={s.starsRow}>
            <div className={s.stars}>
                {[...Array(5)].map((_, i) => {
                    const filled = i < full;
                    const halfFilled = i === full && half;
                    return (
                        <span
                            key={i}
                            style={{ position: "relative", display: "inline-block", lineHeight: 0 }}
                        >
              {halfFilled ? (
                  <>
                      <Star size={size} color="#e2e8f0" />
                      <span
                          style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "50%",
                              overflow: "hidden",
                              display: "inline-block",
                          }}
                      >
                    <Star size={size} fill="#fbbf24" color="#fbbf24" />
                  </span>
                  </>
              ) : (
                  <Star
                      size={size}
                      fill={filled ? "#fbbf24" : "none"}
                      color={filled ? "#fbbf24" : "#e2e8f0"}
                  />
              )}
            </span>
                    );
                })}
            </div>
            <span className={s.ratingNum}>{(rating ?? 0).toFixed(1)}</span>
            {count !== undefined && (
                <span className={s.reviewCount}>({count} avis)</span>
            )}
        </div>
    );
}

/* ═══════════════════════
   AVATAR HELPER
═══════════════════════ */
function ArtisanAvatar({ name, image }: { name: string; image?: string }) {
    const [broken, setBroken] = useState(false);
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    if (!image || broken) {
        return <div className={s.avatarFallback}>{initials}</div>;
    }
    return (
        <img
            src={image}
            alt={name}
            className={s.avatarImg}
            onError={() => setBroken(true)}
        />
    );
}

/* ═══════════════════════
   REVIEWER AVATAR
═══════════════════════ */
function ReviewerAvatar({ name, image }: { name: string; image?: string }) {
    const [broken, setBroken] = useState(false);
    const initials = name?.[0]?.toUpperCase() ?? "?";

    if (!image || broken) {
        return <div className={s.reviewerAvatarFallback}>{initials}</div>;
    }
    return (
        <img
            src={image}
            alt={name}
            className={s.reviewerAvatar}
            onError={() => setBroken(true)}
        />
    );
}

/* ═══════════════════════
   MAIN PAGE
═══════════════════════ */
export default function ArtisanPublicProfile() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const isValidId = /^[0-9a-fA-F]{24}$/.test(id as string);
        if (!isValidId) {
            setError("Identifiant d'artisan invalide.");
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const res = await getData(`/artisans/${id}`);
                if (res.success) setData(res);
                else setError(res.message || "Artisan introuvable.");
            } catch (err) {
                console.error(err);
                setError("Impossible de charger ce profil pour le moment.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    /* ── LOADING ── */
    if (loading)
        return (
            <div className={s.fullScreen}>
                <div className={s.loadingDots}>
                    <span /><span /><span />
                </div>
                <p className={s.loadingText}>Chargement de la carte pro…</p>
            </div>
        );

    /* ── ERROR ── */
    if (error || !data)
        return (
            <div className={s.fullScreen}>
                <div className={s.errorCard}>
                    <h2 className={s.errorTitle}>Oups&nbsp;!</h2>
                    <p className={s.errorMsg}>{error ?? "Une erreur est survenue."}</p>
                    <button onClick={() => router.back()} className={s.btnGhost}>
                        <ArrowLeft size={15} /> Retour
                    </button>
                </div>
            </div>
        );

    const { artisan, products = [], reviews = [] } = data;

    return (
        <div className={s.root}>
            <div className={s.page}>
                <div className={s.container}>

                    {/* ── TOP ACTIONS ── */}
                    <div className={s.headerActions}>
                        <button onClick={() => router.back()} className={s.btnGhost}>
                            <ArrowLeft size={15} /> Retour
                        </button>
                        <button className={s.btnGhost}>
                            <Share2 size={15} /> Partager
                        </button>
                    </div>

                    {/* ── TWO-COLUMN LAYOUT ── */}
                    <div className={s.layout}>

                        {/* ════════════════════════
                SIDEBAR
            ════════════════════════ */}
                        <aside className={s.sidebar}>

                            {/* Profile Card */}
                            <div className={s.profileCard}>
                                <div className={s.profileBanner}>
                                    <div className={s.avatarWrap}>
                                        <div className={s.avatarRing}>
                                            <ArtisanAvatar name={artisan.name} image={artisan.image} />
                                        </div>
                                        {artisan.isVerified && (
                                            <div className={s.verifiedBadge} title="Identité vérifiée">
                                                <BadgeCheck size={13} color="white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={s.profileBody}>
                                    <h1 className={s.artisanName}>{artisan.name}</h1>
                                    <p className={s.artisanSpeciality}>{artisan.speciality}</p>
                                    <Stars rating={artisan.rating} count={reviews.length} size={13} />

                                    {/* Stats */}
                                    <div className={s.statsRow}>
                                        <div className={s.statItem}>
                                            <div className={s.statValue}>{artisan.rating?.toFixed(1)}</div>
                                            <div className={s.statLabel}>Note</div>
                                        </div>
                                        <div className={s.statDivider} />
                                        <div className={s.statItem}>
                                            <div className={s.statValue}>{products.length}</div>
                                            <div className={s.statLabel}>Services</div>
                                        </div>
                                        <div className={s.statDivider} />
                                        <div className={s.statItem}>
                                            <div className={s.statValue}>{artisan.experience}+</div>
                                            <div className={s.statLabel}>Ans exp.</div>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className={s.ctaGroup}>
                                        <a href={`tel:${artisan.phone}`} className={s.btnPrimary}>
                                            <Phone size={15} /> Appeler maintenant
                                        </a>
                                        <button className={s.btnOutline}>
                                            <MessageCircle size={15} /> Envoyer un message
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className={s.infoCard}>
                                <p className={s.infoTitle}>Informations</p>

                                <div className={s.infoItem}>
                                    <div className={s.infoIconWrap}>
                                        <MapPin size={13} color="var(--blue-600)" />
                                    </div>
                                    {artisan.city}, Maroc
                                </div>

                                <div className={s.infoItem}>
                                    <div className={s.infoIconWrap}>
                                        <ShieldCheck size={13} color="var(--blue-600)" />
                                    </div>
                                    Identité vérifiée
                                </div>

                                <div className={s.infoItem}>
                                    <div className={s.infoIconWrap}>
                                        <Clock size={13} color="var(--blue-600)" />
                                    </div>
                                    Réponse moyenne&nbsp;: 2h
                                </div>

                                <div className={s.infoItem} style={{ border: "none" }}>
                                    <div className={s.infoIconWrap}>
                                        <Zap size={13} color="var(--blue-600)" />
                                    </div>
                                    Disponible maintenant
                                </div>
                            </div>

                            {/* Bio Card */}
                            {artisan.bio && (
                                <div className={s.infoCard}>
                                    <p className={s.infoTitle}>À propos</p>
                                    <p className={s.bioText}>{artisan.bio}</p>
                                </div>
                            )}
                        </aside>

                        {/* ════════════════════════
                MAIN
            ════════════════════════ */}
                        <main className={s.mainContent}>

                            {/* Services */}
                            <section>
                                <div className={s.sectionHeader}>
                                    <h2 className={s.sectionTitle}>Catalogue de services</h2>
                                    <p className={s.sectionSub}>
                                        Prestations proposées par{" "}
                                        {artisan.name.split(" ")[0]}
                                    </p>
                                </div>

                                {products.length > 0 ? (
                                    <div className={s.servicesGrid}>
                                        {products.map((p: any) => (
                                            <Link
                                                key={p.id}
                                                href={`/explore/details/${p.id}`}
                                                className={s.serviceCard}
                                            >
                                                <div className={s.serviceImgWrap}>
                                                    <img
                                                        src={p.imageUrl || "/media/images/placeholder.jpg"}
                                                        alt={p.title}
                                                        className={s.serviceImgInner}
                                                    />
                                                    <div className={s.serviceImgOverlay} />
                                                    {p.categoryName && (
                                                        <span className={s.serviceBadge}>{p.categoryName}</span>
                                                    )}
                                                    <div className={s.serviceRating}>
                                                        <Star size={10} fill="#fbbf24" color="#fbbf24" />
                                                        4.8
                                                    </div>
                                                </div>

                                                <div className={s.serviceBody}>
                                                    <h3 className={s.serviceTitle}>{p.title}</h3>
                                                    <div className={s.serviceFooter}>
                                                        <div>
                                                            <span className={s.servicePrice}>{p.price} DH</span>
                                                            <span className={s.servicePriceSub}> / prestation</span>
                                                        </div>
                                                        <span className={s.btnDetails}>Détails →</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={s.emptyState}>
                                        <div className={s.emptyStateIcon}>
                                            <Grid size={22} />
                                        </div>
                                        <h3 className={s.emptyStateTitle}>Aucun service publié</h3>
                                        <p className={s.emptyStateSub}>
                                            Cet artisan n'a pas encore ajouté de services à son catalogue.
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Reviews */}
                            {reviews.length > 0 && (
                                <section>
                                    <div className={s.sectionHeader}>
                                        <h2 className={s.sectionTitle}>
                                            Avis clients{" "}
                                            <span style={{ color: "var(--blue-500)" }}>({reviews.length})</span>
                                        </h2>
                                        <p className={s.sectionSub}>Ce que disent les clients</p>
                                    </div>

                                    <div className={s.reviewsWrap}>
                                        {reviews.map((r: any) => (
                                            <div key={r.id} className={s.reviewCard}>
                                                <div className={s.reviewHeader}>
                                                    <div className={s.reviewerWrap}>
                                                        <ReviewerAvatar name={r.client} image={r.image} />
                                                        <div>
                                                            <div className={s.reviewerName}>{r.client}</div>
                                                            <div className={s.reviewDate}>
                                                                {new Date(r.date).toLocaleDateString("fr-FR", {
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    year: "numeric",
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={s.reviewScore}>
                                                        <Star size={11} fill="#fbbf24" color="#fbbf24" />
                                                        {r.note}
                                                    </div>
                                                </div>
                                                <p className={s.reviewText}>{r.commentaire}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}