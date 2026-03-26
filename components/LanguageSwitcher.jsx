'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown, Languages, Globe } from 'lucide-react'

const LANGUAGES = [
    { code: 'fr', label: 'FR', flag: 'https://flagcdn.com/w40/fr.png', name: 'Français' },
    { code: 'ar', label: 'AR', flag: 'https://flagcdn.com/w40/ma.png', name: 'العربية' }
]

export default function LanguageSwitcher({ minimal = false }) {
    const [currentLang, setCurrentLang] = useState(LANGUAGES[0])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // --- PATCH DE SÉCURITÉ POUR REACT vs GOOGLE TRANSLATE ---
        if (typeof Node === 'function' && Node.prototype) {
            const originalRemoveChild = Node.prototype.removeChild;
            Node.prototype.removeChild = function(child) {
                if (child.parentNode !== this) return child;
                return originalRemoveChild.apply(this, arguments);
            };
            const originalInsertBefore = Node.prototype.insertBefore;
            Node.prototype.insertBefore = function(newNode, referenceNode) {
                if (newNode && referenceNode && referenceNode.parentNode !== this) return newNode;
                return originalInsertBefore.apply(this, arguments);
            };
        }

        // Fonction pour simuler l'événement Google Translate
        window.GTranslateFireEvent = (element, event) => {
            try {
                if (document.createEventObject) {
                    let evt = document.createEventObject();
                    element.fireEvent('on' + event, evt);
                } else {
                    let evt = document.createEvent('HTMLEvents');
                    evt.initEvent(event, true, true);
                    element.dispatchEvent(evt);
                }
            } catch (e) { console.error(e); }
        };

        // Configuration GTranslate
        window.gtranslateSettings = {
            "default_language": "fr",
            "languages": ["fr", "ar"],
            "wrapper_selector": ".gtranslate_wrapper",
            "flag_size": 24,
            "alt_flags": { "fr": "https://flagcdn.com/w40/fr.png", "ar": "https://flagcdn.com/w40/ma.png" }
        }

        // Implémentation de doGTranslate compatible avec float.js
        window.doGTranslate = (lang_pair) => {
            if (lang_pair.value) lang_pair = lang_pair.value;
            if (lang_pair === '') return;
            const lang = lang_pair.split('|')[1];
            let teCombo;
            const sel = document.getElementsByTagName('select');
            for (let i = 0; i < sel.length; i++) {
                if (sel[i].className.indexOf('goog-te-combo') !== -1) {
                    teCombo = sel[i];
                    break;
                }
            }
            if (document.getElementById('google_translate_element2') === null || document.getElementById('google_translate_element2').innerHTML.length === 0 || !teCombo || teCombo.length === 0) {
                setTimeout(() => window.doGTranslate(lang_pair), 500);
            } else {
                teCombo.value = lang;
                window.GTranslateFireEvent(teCombo, 'change');
                window.GTranslateFireEvent(teCombo, 'change');
            }
        };

        if (!document.getElementById('gtranslate-script')) {
            const script = document.createElement('script')
            script.id = 'gtranslate-script'
            script.src = 'https://cdn.gtranslate.net/widgets/latest/float.js'
            script.defer = true
            document.body.appendChild(script)
        }

        const styleId = 'gtranslate-styles'
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style')
            style.id = styleId
            style.innerHTML = `
                #gt_float_wrapper, .gtranslate_wrapper, .skiptranslate:not(.goog-te-combo-container), iframe.goog-te-banner-frame, #goog-gt-tt { 
                    display: none !important; 
                    visibility: hidden !important; 
                }
                .goog-te-combo { display: none !important; }
                body { top: 0 !important; }
            `
            document.head.appendChild(style)
        }

        const checkLang = () => {
            try {
                // On ne fait confiance qu'à notre propre préférence, pas au cookie GTranslate brut
                const stored = typeof window !== 'undefined'
                    ? window.localStorage.getItem('bricole_lang')
                    : null;

                let langCode = stored || document.documentElement.lang || 'fr';

                const active = LANGUAGES.find(l => langCode.includes(l.code)) || LANGUAGES[0];
                if (currentLang.code !== active.code) {
                    setCurrentLang(active);
                    document.documentElement.lang = active.code;
                    document.documentElement.dir = active.code === 'ar' ? 'rtl' : 'ltr';
                }
            } catch (e) {
                // en cas de problème (mode privé strict), on reste en FR
            }
        }
        const interval = setInterval(checkLang, 2000)
        return () => clearInterval(interval)
    }, [currentLang.code])

    const changeLang = (lang) => {
        const domain = window.location.hostname;
        
        setCurrentLang(lang);
        document.documentElement.lang = lang.code;
        document.documentElement.dir = lang.code === 'ar' ? 'rtl' : 'ltr';
        setIsOpen(false);

        // Mémoriser la préférence côté app (notre source de vérité)
        try {
            window.localStorage.setItem('bricole_lang', lang.code);
        } catch (e) {}

        const setCookie = (name, value) => {
            const expires = "; expires=" + new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = `${name}=${value}${expires}; path=/`;
            document.cookie = `${name}=${value}${expires}; path=/; domain=.${domain}`;
        };

        // Gestion des cookies GTranslate
        if (lang.code === 'fr') {
            // Retour au français natif : on nettoie tous les cookies GTranslate pertinents
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;

            // Très important : recharger la page pour restaurer le DOM original en français
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
            return; // on NE déclenche PAS doGTranslate pour le français
        }

        // Pour l'arabe, on laisse GTranslate gérer via son cookie
        setCookie('googtrans', `/fr/${lang.code}`);

        // Auto-refresh uniquement pour l'arabe afin de stabiliser la traduction
        if (lang.code === 'ar' && typeof window !== 'undefined') {
            window.location.reload();
        }
    }

    if (minimal) {
        return (
            <div className="lang-switcher-minimal notranslate" style={{ position: 'relative', zIndex: 10000 }}>
                <div id="google_translate_element2" style={{ display: 'none' }}></div>
                <button 
                    onClick={() => {
                        const nextLang = currentLang.code === 'fr' ? LANGUAGES[1] : LANGUAGES[0];
                        changeLang(nextLang);
                    }}
                    style={{
                        background: 'transparent', border: 'none',
                        padding: '0', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '40px', height: '40px',
                        transition: 'all 0.2s ease'
                    }}
                    className="lang-btn-minimal"
                    aria-label="Change Language"
                >
                    <Globe size={24} color="#262626" strokeWidth={1.5} />
                </button>
                <style>{`
                    .lang-btn-minimal:active { transform: scale(0.9); opacity: 0.7; }
                `}</style>
                <div className="gtranslate_wrapper" style={{ display: 'none' }}></div>
            </div>
        )
    }

    return (
        <div className="lang-switcher-container notranslate" style={{ position: 'relative', zIndex: 10000 }}>
            <div id="google_translate_element2" style={{ display: 'none' }}></div>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(20, 120, 241, 0.05)', border: '1px solid rgba(20, 120, 241, 0.15)',
                    borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
                    transition: 'all 0.3s ease', outline: 'none', height: '32px'
                }}
                className="lang-btn"
            >
                <img src={currentLang.flag} alt={currentLang.label} style={{ width: '18px', height: '12px', borderRadius: '1px', objectFit: 'cover' }} />
                <span style={{ fontWeight: '700', fontSize: '0.75rem', color: '#1e293b' }}>{currentLang.label}</span>
                <ChevronDown size={12} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#fff', borderRadius: '12px', padding: '6px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9',
                    minWidth: '140px', animation: 'fadeIn 0.2s ease'
                }}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLang(lang)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                                padding: '8px 12px', border: 'none', background: currentLang.code === lang.code ? '#f8fafc' : 'transparent',
                                borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = currentLang.code === lang.code ? '#f8fafc' : 'transparent'}
                        >
                            <img src={lang.flag} alt={lang.label} style={{ width: '20px', height: '13px', borderRadius: '2px' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155', flex: 1 }}>{lang.name}</span>
                            {currentLang.code === lang.code && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1478f1' }} />}
                        </button>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                [dir="rtl"] .lang-switcher-container { margin-right: 0; margin-left: 15px; }
                .lang-btn:hover { background: rgba(20, 120, 241, 0.1) !important; border-color: rgba(20, 120, 241, 0.3) !important; }
            `}</style>
            
            <div className="gtranslate_wrapper" style={{ display: 'none' }}></div>
        </div>
    )
}
