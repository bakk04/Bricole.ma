"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    X, MapPin, Star, Phone, Search, 
    AlertCircle, Loader2, Navigation,
    Map as MapIcon, Sparkles, ShieldCheck, 
    ExternalLink, RefreshCw
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
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
            
            {/* Backdrop avec flou */}
            <div 
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" 
                onClick={onClose}
            />

            {/* Fenêtre Modale */}
            <div className={`relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden transition-all duration-700 ease-out transform ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-20 opacity-0'}`}>
                
                {/* Bordure décorative haute animée */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-sky-300 to-transparent animate-[shimmer_2s_infinite]" />
                </div>

                {/* Header */}
                <div className="px-8 pt-10 pb-6 flex items-start justify-between relative bg-gradient-to-b from-blue-50/30 to-transparent">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200">
                                <Navigation size={14} className="animate-pulse" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Recherche Proximité</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            Artisans à {city ? <span className="text-blue-600">{city}</span> : "Proximité"}
                        </h2>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="p-3 bg-slate-100 hover:bg-slate-900 rounded-2xl transition-all duration-300 group hover:rotate-90"
                    >
                        <X size={20} className="text-slate-400 group-hover:text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 pb-10 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    
                    {loading ? (
                        <div className="py-10 flex flex-col items-center">
                            <div className="relative mb-8">
                                <div className="w-20 h-20 border-4 border-blue-50 rounded-full flex items-center justify-center">
                                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                                    <Search size={28} className="text-blue-600 animate-pulse" />
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Analyse en cours...</h3>
                            <p className="text-slate-400 text-center text-sm font-medium px-10">
                                Nous explorons Google Maps pour vous trouver les meilleurs experts à proximité.
                            </p>

                            <div className="w-full mt-10 space-y-4 opacity-40">
                                <div className="h-24 w-full bg-slate-100 rounded-3xl animate-pulse" />
                                <div className="h-24 w-full bg-slate-100 rounded-3xl animate-pulse" />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="py-12 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Une erreur est survenue</h3>
                            <p className="text-slate-500 text-sm max-w-xs mb-8">{error}</p>
                            <button 
                                onClick={fetchNearbyArtisans}
                                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Réessayer
                            </button>
                        </div>
                    ) : artisans.length > 0 ? (
                        <div className="grid gap-4">
                            {artisans.map((artisan, idx) => (
                                <div 
                                    key={artisan.id}
                                    style={{ transitionDelay: `${idx * 50}ms` }}
                                    className={`group flex items-center gap-4 p-3 pr-5 bg-white border border-slate-100 rounded-[32px] hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                                >
                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-[24px] bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-50 shadow-inner">
                                        {artisan.imageUrl ? (
                                            <img src={artisan.imageUrl} alt={artisan.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-blue-200">
                                                <MapIcon size={28} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Infos */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                {artisan.name}
                                            </h4>
                                            {artisan.rating >= 4 && (
                                                <ShieldCheck size={14} className="text-blue-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-blue-600/60 tracking-wider mb-2">{artisan.category}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <MapPin size={12} />
                                                <p className="text-[11px] font-medium truncate w-32">{artisan.address}</p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-lg text-[10px] font-black">
                                                <Star size={10} fill="currentColor" />
                                                {artisan.rating}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Boutons */}
                                    <div className="flex flex-col gap-2">
                                        {artisan.phone && (
                                            <a 
                                                href={`tel:${artisan.phone}`}
                                                className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Phone size={14} />
                                            </a>
                                        )}
                                        <button 
                                            onClick={() => artisan.website && window.open(artisan.website, '_blank')}
                                            className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center text-center">
                            <Search size={40} className="text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Aucun artisan trouvé</h3>
                            <p className="text-slate-400 text-sm">Réessayez dans une zone plus dense.</p>
                        </div>
                    )}
                </div>

                {/* Footer simple */}
                <div className="px-8 py-4 bg-slate-50 flex justify-center items-center gap-2">
                    <Sparkles size={12} className="text-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Google Intelligence</span>
                </div>
            </div>

            {/* Définition du shimmer via CSS standard inline car Tailwind @keyframes peut varier en v4 */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
}
