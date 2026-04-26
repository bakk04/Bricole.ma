"use client";

import { useEffect } from "react";

export default function BotpressFix() {
    useEffect(() => {
        // Create a style element to force position
        const style = document.createElement('style');
        style.innerHTML = `
            /* Force Botpress bubble above BottomNav on mobile */
            @media (max-width: 768px) {
                #bp-web-widget-container, 
                div[id^="bp-web-widget"],
                .bp-widget-side,
                iframe#bp-webchat {
                    bottom: 115px !important;
                    margin-bottom: 0px !important;
                    z-index: 2147483646 !important;
                }
            }
        `;
        
        // Append it to the head
        document.head.appendChild(style);

        // Backup timer fix for cases where internal Botpress scripts re-apply bottom: 20px
        const applyFix = () => {
            const botpressContainer = document.getElementById("bp-web-widget-container") || 
                                     document.querySelector('div[id^="bp-web-widget"]');
            const iframe = document.querySelector('iframe[src*="botpress"]');
            
            if (botpressContainer || iframe) {
                const target = (botpressContainer || iframe) as HTMLElement;
                if (window.innerWidth <= 768) {
                    target.style.setProperty("bottom", "115px", "important");
                }
            }
        };

        const interval = setInterval(applyFix, 1000);

        // Cleanup on unmount
        return () => {
            clearInterval(interval);
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    return null;
}