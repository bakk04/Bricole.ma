"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    X, MapPin, Star, Phone, Search, 
    AlertCircle, Navigation,
    Map as MapIcon, Sparkles, ShieldCheck, 
    ExternalLink, RefreshCw, Globe, ArrowRight,
    CheckCircle2, Compass
} from "lucide-react";

interface Artisan {
    id: string;
    name: string;
    category: string;
    address: string;
    rating: number;
    reviewsCount: number;
    phone?: string;
    website?: string;
    imageUrl?: string;
}

interface NearbyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NearbyModal({ isOpen, onClose }: NearbyModalProps) {
    const [loading, setLoading] = useState(false);
    const [artisans, setArtisans] = useState<Artisan[]>([]);
    const [city, setCity] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => {
                setIsMounted(false);
                document.body.style.overflow = "unset";
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchNearbyArtisans = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/nearby");
            const data = await res.json();

            if (data.success) {
                setArtisans(data.artisans);
                setCity(data.city);
            } else {
                setError(data.error || "Impossible de récupérer les artisans.");
            }
        } catch (err) {
            setError("Erreur réseau. Vérifiez votre connexion.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNearbyArtisans();
        }
    }, [isOpen, fetchNearbyArtisans]);

    if (!isMounted && !isOpen) return null;

    return (
        <div className={`nearby-force-root ${isOpen ? 'is-open' : ''}`}>
            
            {/* Backdrop avec flou progressif */}
            <div className="nearby-backdrop" onClick={onClose} />

            {/* Window - Google Maps Style */}
            <div className="nearby-window">
                
                {/* Handle pour Mobile (Bottom Sheet) */}
                <div className="mobile-handle"><div className="handle-bar" /></div>

                {/* Google Loader Bar */}
                {loading && <div className="google-loader-bar" />}

                {/* Header */}
                <div className="nearby-header">
                    <div className="header-content">
                        <div className="header-top">
                            <div className="intel-pill">
                                <div className="intel-icon">
                                    <Compass size={14} className={loading ? 'spinning' : ''} />
                                </div>
                                <span>Local Intelligence</span>
                            </div>
                            <button className="close-btn" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <h2 className="nearby-title">
                            {loading ? "Recherche en cours..." : (
                                <>Expertise à <span className="city-highlight">{city || "Proximité"}</span></>
                            )}
                        </h2>
                        
                        {!loading && !error && (
                            <div className="live-status">
                                <span className="status-dot" />
                                <span>{artisans.length} artisans qualifiés trouvés</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="nearby-body">
                    {loading ? (
                        <div className="nearby-loading-state">
                            <div className="loading-orb">
                                <Search size={32} />
                                <div className="orb-ring" />
                                <div className="orb-ring delay" />
                            </div>
                            <p className="loading-text">Analyse des données Google Maps...</p>
                            <div className="skeleton-list">
                                <div className="skeleton-item" />
                                <div className="skeleton-item" />
                                <div className="skeleton-item" />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="nearby-error-state">
                            <div className="error-icon">
                                <AlertCircle size={40} />
                            </div>
                            <h3>Une erreur est survenue</h3>
                            <p>{error}</p>
                            <button className="retry-btn" onClick={fetchNearbyArtisans}>
                                <RefreshCw size={16} /> Réessayer l'analyse
                            </button>
                        </div>
                    ) : artisans.length > 0 ? (
                        <div className="artisans-grid">
                            {artisans.map((artisan, idx) => (
                                <div 
                                    key={artisan.id} 
                                    className="artisan-card"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <div className="card-media">
                                        {artisan.imageUrl ? (
                                            <img 
                                                src={artisan.imageUrl} 
                                                alt={artisan.name} 
                                                referrerPolicy="no-referrer" 
                                            />
                                        ) : (
                                            <div className="media-placeholder"><MapIcon size={24} /></div>
                                        )}
                                        <div className="rank-badge">#{idx + 1}</div>
                                    </div>

                                    <div className="card-info">
                                        <div className="info-main">
                                            <div className="name-row">
                                                <h4>{artisan.name}</h4>
                                                {artisan.rating >= 4.5 && <ShieldCheck size={14} className="elite-icon" title="Élite Bricole" />}
                                            </div>
                                            <span className="cat-label">{artisan.category}</span>
                                            
                                            <div className="stats-row">
                                                <div className="rating-pill">
                                                    <Star size={10} fill="currentColor" />
                                                    {artisan.rating.toFixed(1)}
                                                </div>
                                                <span className="reviews-count">{artisan.reviewsCount} avis Google</span>
                                            </div>

                                            <div className="address-row">
                                                <MapPin size={12} />
                                                <p>{artisan.address}</p>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            {artisan.phone && (
                                                <a href={`tel:${artisan.phone}`} className="action-btn call" title="Appeler">
                                                    <Phone size={16} />
                                                </a>
                                            )}
                                            <button 
                                                onClick={() => artisan.website && window.open(artisan.website, '_blank')}
                                                className="action-btn web"
                                                title="Site Web / Itinéraire"
                                            >
                                                <Globe size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="nearby-empty-state">
                            <Search size={48} className="empty-icon" />
                            <p>Aucun artisan trouvé à proximité immédiate.</p>
                        </div>
                    )}
                </div>

                {/* Footer Style Google */}
                <div className="nearby-footer">
                    <div className="footer-left">
                        <Sparkles size={12} className="sparkle-icon" />
                        <span>Google Intelligence Cloud</span>
                    </div>
                    <div className="footer-right">
                        <span>LIVETIME DATA v4.0</span>
                    </div>
                </div>
            </div>

            {/* CSS ULTRA-FORCÉ POUR LE DESIGN GOOGLE MAPS */}
            <style dangerouslySetInnerHTML={{ __html: `
                .nearby-force-root {
                    position: fixed !important;
                    inset: 0 !important;
                    z-index: 10000 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none !important; /* Par défaut pas d'interactions si fermé */
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
                }
                .nearby-force-root.is-open {
                    opacity: 1 !important;
                    visibility: visible !important;
                    pointer-events: auto !important; /* Active les interactions quand ouvert */
                }
                .nearby-backdrop {
                    position: absolute !important;
                    inset: 0 !important;
                    background: rgba(15, 23, 42, 0.3) !important;
                    backdrop-filter: blur(4px) !important;
                    transition: all 0.4s ease;
                }
                .nearby-window {
                    position: relative !important;
                    width: 100% !important;
                    max-width: 540px !important; /* Augmenté pour être plus large */
                    background: #ffffff !important;
                    border-radius: 28px !important;
                    box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.25) !important;
                    overflow: hidden !important;
                    transform: translateY(60px) scale(0.96);
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    display: flex !important;
                    flex-direction: column !important;
                    z-index: 10001 !important;
                    border: 1px solid rgba(0,0,0,0.05) !important;
                }
                .nearby-force-root.is-open .nearby-window {
                    transform: translateY(0) scale(0.95) !important; /* Zoom ajusté pour la nouvelle largeur */
                }
                .nearby-force-root.is-open .nearby-window:hover {
                    transform: translateY(0) scale(0.96) !important;
                }
                
                /* Mobile Handle */
                .mobile-handle {
                    display: none !important;
                    width: 100% !important;
                    padding: 12px 0 8px !important;
                    justify-content: center !important;
                }
                .handle-bar {
                    width: 36px !important;
                    height: 4px !important;
                    background: #e2e8f0 !important;
                    border-radius: 10px !important;
                }

                @keyframes googleSlide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
                @keyframes orbPulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(2); opacity: 0; }
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spinning {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .spinning { animation: spinning 2s linear infinite !important; }

                .google-loader-bar {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 25% !important;
                    height: 3px !important;
                    background: #4285F4 !important;
                    animation: googleSlide 1.2s infinite linear !important;
                    z-index: 100 !important;
                }

                .nearby-header {
                    padding: 32px 32px 20px !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }
                .header-top {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    margin-bottom: 16px !important;
                }
                .intel-pill {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    background: #4285F4 !important;
                    color: white !important;
                    padding: 5px 14px !important;
                    border-radius: 100px !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.8px !important;
                    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2) !important;
                }
                .close-btn {
                    background: #f8fafc !important;
                    border: 1px solid #f1f5f9 !important;
                    padding: 8px !important;
                    border-radius: 14px !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    color: #94a3b8 !important;
                }
                .close-btn:hover { background: #0f172a !important; color: #ffffff !important; transform: rotate(90deg) !important; }

                .nearby-title {
                    font-size: 26px !important;
                    font-weight: 800 !important;
                    color: #0f172a !important;
                    margin: 0 !important;
                    line-height: 1.1 !important;
                    letter-spacing: -0.5px !important;
                }
                .city-highlight { color: #4285F4 !important; position: relative !important; }

                .live-status {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    margin-top: 12px !important;
                    font-size: 11px !important;
                    font-weight: 600 !important;
                    color: #64748b !important;
                }
                .status-dot {
                    width: 7px !important;
                    height: 7px !important;
                    background: #34A853 !important;
                    border-radius: 50% !important;
                    box-shadow: 0 0 0 3px rgba(52, 168, 83, 0.1) !important;
                }

                .nearby-body {
                    padding: 24px 28px !important;
                    max-height: 400px !important; /* Hauteur diminuée pour un aspect plus compact */
                    overflow-y: auto !important;
                    background: #ffffff !important;
                }
                .nearby-body::-webkit-scrollbar { width: 5px !important; }
                .nearby-body::-webkit-scrollbar-thumb { background: #e2e8f0 !important; border-radius: 10px !important; }

                /* Artisan Card */
                .artisan-card {
                    display: flex !important;
                    gap: 18px !important;
                    background: #ffffff !important;
                    border-radius: 22px !important;
                    padding: 16px !important;
                    margin-bottom: 16px !important;
                    border: 1px solid #f1f5f9 !important;
                    transition: all 0.3s ease !important;
                    animation: fadeSlideIn 0.5s ease-out forwards !important;
                    opacity: 0;
                }
                .artisan-card:hover {
                    border-color: #4285F4 !important;
                    box-shadow: 0 12px 30px rgba(66, 133, 244, 0.08) !important;
                    transform: translateY(-3px) !important;
                }

                .card-media {
                    position: relative !important;
                    width: 95px !important;
                    height: 95px !important;
                    border-radius: 16px !important;
                    overflow: hidden !important;
                    background: #f8fafc !important;
                    flex-shrink: 0 !important;
                    border: 1px solid #f1f5f9 !important;
                }
                .card-media img { width: 100% !important; height: 100% !important; object-fit: cover !important; transition: 0.5s !important; }
                .artisan-card:hover .card-media img { transform: scale(1.1) !important; }
                .rank-badge {
                    position: absolute !important;
                    top: 6px !important;
                    left: 6px !important;
                    background: rgba(15, 23, 42, 0.9) !important;
                    color: #ffffff !important;
                    font-size: 8px !important;
                    font-weight: 900 !important;
                    padding: 3px 7px !important;
                    border-radius: 100px !important;
                    backdrop-filter: blur(4px) !important;
                }

                .card-info {
                    flex: 1 !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    min-width: 0 !important;
                }
                .info-main { min-width: 0 !important; flex: 1 !important; }
                .name-row { display: flex !important; align-items: center !important; gap: 6px !important; margin-bottom: 2px !important; }
                .info-main h4 {
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    color: #0f172a !important;
                    margin: 0 !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }
                .elite-icon { color: #4285F4 !important; flex-shrink: 0 !important; }
                .cat-label {
                    font-size: 10px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    color: #4285F4 !important;
                    letter-spacing: 0.5px !important;
                }
                .stats-row {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    margin: 6px 0 !important;
                }
                .rating-pill {
                    background: #fffbeb !important;
                    color: #ea4335 !important;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    padding: 2px 8px !important;
                    border-radius: 8px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                }
                .reviews-count { font-size: 11px !important; color: #94a3b8 !important; font-weight: 500 !important; }

                .address-row {
                    display: flex !important;
                    align-items: center !important;
                    gap: 5px !important;
                    color: #64748b !important;
                    font-size: 11px !important;
                    margin-top: 6px !important;
                }
                .address-row p { margin: 0 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }

                .card-actions {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 8px !important;
                    margin-left: 12px !important;
                }
                .action-btn {
                    width: 38px !important;
                    height: 38px !important;
                    border-radius: 12px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border: none !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    text-decoration: none !important;
                }
                .action-btn.call { background: #4285F4 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2) !important; }
                .action-btn.web { background: #f8fafc !important; color: #64748b !important; border: 1px solid #f1f5f9 !important; }
                .action-btn:hover { transform: translateY(-3px) scale(1.05) !important; }
                .action-btn.call:hover { background: #0f172a !important; }

                /* States */
                .nearby-loading-state { display: flex !important; flex-direction: column !important; align-items: center !important; padding: 60px 0 !important; }
                .loading-orb { position: relative !important; width: 70px !important; height: 70px !important; background: rgba(66, 133, 244, 0.08) !important; color: #4285F4 !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; margin-bottom: 24px !important; }
                .loading-text { font-weight: 600 !important; color: #475569 !important; font-size: 15px !important; }
                .orb-ring { position: absolute !important; inset: 0 !important; border: 2.5px solid #4285F4 !important; border-radius: 50% !important; animation: orbPulse 1.8s infinite !important; }
                .orb-ring.delay { animation-delay: 0.6s !important; }
                
                .skeleton-item { height: 90px !important; width: 100% !important; background: #f8fafc !important; border-radius: 20px !important; margin-top: 16px !important; }

                .nearby-empty-state { display: flex !important; flex-direction: column !important; align-items: center !important; padding: 80px 0 !important; color: #94a3b8 !important; }
                .empty-icon { opacity: 0.2 !important; margin-bottom: 16px !important; }

                .nearby-footer {
                    padding: 16px 32px !important;
                    background: #f8fafc !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    font-size: 9px !important;
                    font-weight: 800 !important;
                    color: #94a3b8 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 1.5px !important;
                    border-top: 1px solid #f1f5f9 !important;
                }
                .footer-left { display: flex !important; align-items: center !important; gap: 6px !important; }
                .sparkle-icon { color: #4285F4 !important; }

                /* RESPONSIVE GOOGLE MAPS BOTTOM SHEET */
                @media (max-width: 600px) {
                    .nearby-force-root { align-items: flex-end !important; }
                    .nearby-window {
                        max-width: 100% !important;
                        border-radius: 24px 24px 0 0 !important;
                        transform: translateY(100%);
                        height: 92vh !important;
                    }
                    .mobile-handle { display: flex !important; }
                    .nearby-header { padding: 8px 24px 20px !important; }
                    .nearby-body { padding: 16px 20px !important; max-height: none !important; flex: 1 !important; }
                    .artisan-card { padding: 12px !important; gap: 12px !important; }
                    .card-media { width: 80px !important; height: 80px !important; }
                }
            `}} />
        </div>
    );
}
