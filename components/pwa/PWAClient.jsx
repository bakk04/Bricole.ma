"use client";

import { usePWA } from "../../hooks/usePWA";
import { useEffect, useState } from "react";

export default function PWAClient() {
  const { isOnline, isInstalled, deferredPrompt, installApp, isUpdateAvailable, updateApp } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do not show if app is already installed
    if (isInstalled) {
      setShowInstallBanner(false);
      return;
    }

    // Respect previous dismissal in this browser
    const dismissed = window.localStorage.getItem("bricole_pwa_install_dismissed") === "1";
    if (deferredPrompt && !dismissed) {
      setShowInstallBanner(true);
    }
  }, [deferredPrompt, isInstalled]);

  return (
    <>
      {/* Offline Alert */}
      {!isOnline && (
        <div 
          className="fixed-top w-100 text-center py-2 bg-dark text-white opacity-90" 
          style={{ zIndex: 9999, fontSize: '13px', letterSpacing: '0.5px' }}
        >
          <i className="fa fa-wifi-slash me-2"></i> Mode hors-ligne activé
        </div>
      )}

      {/* Update Notification */}
      {isUpdateAvailable && (
        <div 
          className="fixed-top w-100 p-3 bg-primary text-white shadow-lg d-flex align-items-center justify-content-between"
          style={{ zIndex: 10000, animation: 'slideDown 0.5s ease-out' }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white rounded-circle p-2 text-primary">
              <i className="fa fa-sync-alt fa-spin"></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold">Mise à jour disponible</h6>
              <p className="mb-0 small opacity-90">Une nouvelle version de Bricole.ma est prête.</p>
            </div>
          </div>
          <button 
            className="btn btn-light btn-sm rounded-pill px-4 fw-bold shadow-sm"
            onClick={updateApp}
          >
            Mettre à jour
          </button>
        </div>
      )}

      {/* Modern Install Banner (Bottom) */}
      {showInstallBanner && (
        <div 
          className="fixed-bottom w-100 p-3 bg-white shadow-lg border-top" 
          style={{ zIndex: 9998, animation: 'slideUp 0.5s ease-out', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <div className="container d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <img 
                src="/media/images/android-chrome-192x192.png"
                alt="Bricole.ma" 
                width="48" 
                height="48" 
                className="rounded shadow-sm"
              />
              <div>
                <h6 className="mb-0 fw-bold">Installer Bricole.ma</h6>
                <p className="mb-0 text-muted small">Profitez d'une expérience fluide et rapide.</p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-light border rounded-pill px-3"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("bricole_pwa_install_dismissed", "1");
                  }
                  setShowInstallBanner(false);
                }}
              >
                Plus tard
              </button>
              <button 
                className="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-sm"
                onClick={() => {
                  installApp();
                  setShowInstallBanner(false);
                }}
              >
                Installer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        
        /* App-like feel */
        button, a {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        /* Safe area for mobile */
        body {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}
