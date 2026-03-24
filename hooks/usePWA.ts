"use client";

import { useEffect, useState } from "react";
import type { Workbox } from "workbox-window";

declare global {
  interface Window {
    workbox: Workbox | undefined;
  }
}

export interface IBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<IBeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [wb, setWb] = useState<Workbox | null>(null);

  useEffect(() => {
    // 1. Online/Offline Status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    // 2. Install Prompt Handling
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as IBeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. Workbox Integration (Safe check for production)
    if (typeof window !== "undefined" && "serviceWorker" in navigator && window.workbox) {
      const workbox = window.workbox;
      setWb(workbox);

      // Event listener for new version
      const onWaiting = () => {
        setIsUpdateAvailable(true);
      };

      workbox.addEventListener("waiting", onWaiting);
      
      // Register (next-pwa might do this already, but we ensure listeners are attached)
      // workbox.register(); // Ducanh2912 handles registration by default
    }

    // 4. Check Display Mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const updateApp = () => {
    if (wb) {
      wb.addEventListener("controlling", () => {
        window.location.reload();
      });
      wb.messageSkipWaiting();
    }
  };

  return {
    deferredPrompt,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installApp,
    updateApp,
  };
}
