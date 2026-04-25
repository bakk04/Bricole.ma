"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    MapPin, Star, BadgeCheck, Phone, MessageCircle,
    ArrowLeft, Award, Clock, ShieldCheck, 
    Zap, Share2, Grid, List, Search
} from "lucide-react";
import { getData } from "@/lib/api";

/* ══════════════════════════════
   STAR DISPLAY
══════════════════════════════ */
function Stars({ rating, count, size = 14 }: { rating: number, count?: number, size?: number }) {
    const full = Math.floor(rating || 0);
    const half = (rating || 0) % 1 >= 0.5;
    
    return (
        <div className="d-flex align-items-center gap-1">
            <div className="d-flex align-items-center gap-0.5">
                {[...Array(5)].map((_, i) => {
                    if (i < full) return <Star key={i} size={size} fill="#fcd34d" color="#fcd34d" />;
                    if (i === full && half) return (
                        <span key={i} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
                            <Star size={size} color="#e2e8f0" />
                            <span style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
                                <Star size={size} fill="#fcd34d" color="#fcd34d" />
                            </span>
                        </span>
                    );
                    return <Star key={i} size={size} color="#e2e8f0" />;
                })}
            </div>
            <span className="fw-black text-dark ms-1" style={{ fontSize: size + 2 }}>{(rating || 0).toFixed(1)}</span>
            {count !== undefined && <span className="text-muted small">({count})</span>}
        </div>
    );
}

export default function ArtisanPublicProfile() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        
        // Validation basique de l'ID (MongoDB ObjectId est une chaîne de 24 hex)
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
                else setError(res.message || "Artisan introuvable");
            } catch (err) {
                console.error("Load error:", err);
                setError("Désolé, nous ne parvenons pas à charger ce profil pour le moment.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted fw-medium">Chargement de la carte pro...</p>
        </div>
    );

    if (error || !data) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light p-4 text-center">
            <div className="bg-white p-5 rounded-4 shadow-sm">
                <h2 className="text-dark fw-bold mb-2">Oups !</h2>
                <p className="text-muted mb-4">{error || "Une erreur est survenue."}</p>
                <button onClick={() => router.back()} className="btn btn-primary px-4 py-2 rounded-pill">
                    <ArrowLeft size={16} className="me-2" /> Retour
                </button>
            </div>
        </div>
    );

    const { artisan, products = [], reviews = [] } = data;

    return (
        <div className="min-vh-100 bg-light py-5">
            <div className="container">
                
                {/* Header Actions */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button onClick={() => router.back()} className="btn btn-white shadow-sm rounded-pill px-3 py-2 border-0">
                        <ArrowLeft size={18} className="me-2" /> Retour
                    </button>
                    <button className="btn btn-white shadow-sm rounded-pill px-3 py-2 border-0">
                        <Share2 size={18} className="me-2" /> Partager
                    </button>
                </div>

                <div className="row g-4">
                    {/* LEFT: Artisan Card */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden position-sticky" style={{ top: '20px' }}>
                            <div className="bg-primary py-5 position-relative">
                                <div style={{ position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)' }}>
                                    <div className="position-relative">
                                        <img 
                                            src={artisan.image || "https://res.cloudinary.com/dr2fjkaye/image/upload/v1/default-avatar.png"} 
                                            alt={artisan.name}
                                            className="rounded-circle border border-4 border-white shadow"
                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        />
                                        {artisan.isVerified && (
                                            <div className="position-absolute" style={{ bottom: '5px', right: '5px' }}>
                                                <BadgeCheck size={28} fill="#1478f1" color="#fff" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                                <div className="card-body pt-5 mt-4 text-center pb-4">
                                    <h3 className="fw-black text-dark mb-1">{artisan.name}</h3>
                                    <p className="text-primary fw-bold mb-3 uppercase tracking-wider small">{artisan.speciality}</p>
                                    
                                    <div className="mb-4 d-flex justify-content-center">
                                        <Stars rating={artisan.rating} count={reviews.length} size={16} />
                                    </div>

                                    <div className="d-flex justify-content-center gap-3 mb-4">
                                    <div className="text-center">
                                        <div className="fw-black text-dark">{artisan.rating}</div>
                                        <div className="text-muted small">Note</div>
                                    </div>
                                    <div className="vr text-secondary opacity-25"></div>
                                    <div className="text-center">
                                        <div className="fw-black text-dark">{products.length}</div>
                                        <div className="text-muted small">Services</div>
                                    </div>
                                    <div className="vr text-secondary opacity-25"></div>
                                    <div className="text-center">
                                        <div className="fw-black text-dark">{artisan.experience}+</div>
                                        <div className="text-muted small">Exp.</div>
                                    </div>
                                </div>

                                <div className="d-grid gap-2 px-3">
                                    <a href={`tel:${artisan.phone}`} className="btn btn-primary rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
                                        <Phone size={18} /> Appeler maintenant
                                    </a>
                                    <button className="btn btn-outline-primary rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
                                        <MessageCircle size={18} /> Envoyer un message
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 border-top bg-white">
                                <div className="d-flex align-items-center gap-2 text-muted mb-3">
                                    <MapPin size={16} /> <span>{artisan.city}, Maroc</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted mb-3">
                                    <ShieldCheck size={16} color="var(--bs-success)" /> <span>Identité vérifiée</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted mb-3">
                                    <Clock size={16} /> <span>Réponse moyenne : 2h</span>
                                </div>
                                <hr />
                                <h6 className="fw-bold text-dark mb-2">À propos</h6>
                                <p className="text-muted small lh-base">{artisan.bio}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Catalog */}
                    <div className="col-lg-8">
                        <div className="mb-4">
                            <h2 className="fw-black text-dark mb-1">Catalogue de services</h2>
                            <p className="text-muted">Découvrez les prestations proposées par {artisan.name.split(' ')[0]}.</p>
                        </div>

                        {products.length > 0 ? (
                            <div className="row g-4">
                                {products.map((p: any) => (
                                    <div key={p.id} className="col-md-6">
                                        <Link href={`/explore/details/${p.id}`} className="text-decoration-none group">
                                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-transform hover-translate-up">
                                                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                                    <img 
                                                        src={p.imageUrl || "/media/images/placeholder.jpg"} 
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover-scale-110" 
                                                        alt={p.title} 
                                                    />
                                                    <div className="position-absolute bottom-0 start-0 p-3 w-100 bg-gradient-to-t from-black/60 to-transparent">
                                                        <span className="badge bg-white text-dark rounded-pill px-2 py-1 small fw-bold">
                                                            {p.categoryName}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="card-body p-4">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h5 className="fw-bold text-dark mb-0 group-hover-text-primary">{p.title}</h5>
                                                        <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                                            <Star size={10} fill="#fcd34d" color="#fcd34d" />
                                                            <span className="fw-black">4.8</span>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                                        <div className="fw-black text-primary fs-5">{p.price} DH</div>
                                                        <div className="btn btn-light btn-sm rounded-pill px-3 fw-bold" style={{ fontSize: '0.75rem' }}>Détails</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-4 p-5 text-center shadow-sm">
                                <Grid size={48} className="text-muted mb-3 opacity-25" />
                                <h4 className="fw-bold text-dark">Aucun service</h4>
                                <p className="text-muted">Cet artisan n'a pas encore publié de services dans son catalogue.</p>
                            </div>
                        )}

                        {/* Reviews Section */}
                        {reviews.length > 0 && (
                            <div className="mt-5 pt-4">
                                <h3 className="fw-black text-dark mb-4">Avis clients ({reviews.length})</h3>
                                <div className="space-y-4">
                                    {reviews.map((r: any) => (
                                        <div key={r.id} className="bg-white rounded-4 p-4 shadow-sm mb-3">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <img 
                                                        src={r.image || "https://res.cloudinary.com/dr2fjkaye/image/upload/v1/default-avatar.png"} 
                                                        className="rounded-circle" 
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                                        alt="" 
                                                    />
                                                    <div>
                                                        <div className="fw-bold text-dark">{r.client}</div>
                                                        <div className="text-muted small">{new Date(r.date).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center gap-1 bg-amber-50 text-amber-500 px-2 py-1 rounded-pill small fw-black">
                                                    <Star size={12} fill="currentColor" /> {r.note}
                                                </div>
                                            </div>
                                            <p className="text-muted small mb-0">{r.commentaire}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .fw-black { font-weight: 900; }
                .tracking-wider { letter-spacing: 0.05em; }
                .hover-translate-up { transition: transform 0.3s ease; }
                .hover-translate-up:hover { transform: translateY(-8px); }
                .group:hover .group-hover-scale-110 { transform: scale(1.1); }
                .group:hover .group-hover-text-primary { color: var(--bs-primary) !important; }
                .bg-gradient-to-t { background: linear-gradient(to top, var(--tw-gradient-stops)); }
            `}</style>
        </div>
    );
}
