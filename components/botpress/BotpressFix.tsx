"use client";

import { useEffect } from "react";

export default function BotpressFix() {
    useEffect(() => {
        const applyFix = () => {
            // Cible le bouton de la bulle Botpress (souvent un parent de l'iframe)
            const botpressContainer = document.getElementById("bp-web-widget-container") || 
                                     document.querySelector('div[id^="bp-web-widget"]');
            
            const iframe = document.querySelector('iframe[src*="botpress"]');

            if (botpressContainer || iframe) {
                const target = (botpressContainer || iframe) as HTMLElement;
                const isMobile = window.innerWidth <= 768;

                // Forcer la position via styles inline avec !important
                target.style.setProperty("bottom", isMobile ? "105px" : "90px", "important");
                target.style.setProperty("z-index", "999999", "important");
                
                // Si c'est l'iframe lui-même, on s'assure qu'il ne se remet pas en bas
                if (iframe) {
                    (iframe as HTMLElement).style.setProperty("bottom", isMobile ? "105px" : "90px", "important");
                }
            }
        };

        // Exécuter plusieurs fois pour contrer les scripts de Botpress qui réinitialisent les styles
        const interval = setInterval(applyFix, 500);

        // Nettoyer après 10 secondes (le temps que tout soit chargé)
        const timeout = setTimeout(() => clearInterval(interval), 15000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return null;
}