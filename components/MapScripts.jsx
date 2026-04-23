'use client';

import Script from 'next/script';
import { useState, useEffect } from 'react';

/**
 * MapScripts Component
 * Safely loads Leaflet and its plugins in a strict sequence 
 * to prevent "Cannot read properties of undefined (reading 'prototype')" errors.
 */
export default function MapScripts() {
  const [baseLoaded, setBaseLoaded] = useState(false);

  // Prevention: Ensure Leaflet global 'L' is not accidentally wiped or re-initialized poorly
  useEffect(() => {
    if (typeof window !== 'undefined' && window.L) {
      setBaseLoaded(true);
    }
  }, []);

  return (
    <>
      {/* 1. Load Base Leaflet Library */}
      <Script 
        id="leaflet-base"
        src="/vendor/unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log("MapScripts: Leaflet Base initialized");
          setBaseLoaded(true);
        }}
      />
      
      {/* 2. Load Plugins ONLY after Base is ready */}
      {baseLoaded && (
        <>
          <Script 
            id="leaflet-geosearch"
            src="/vendor/unpkg.com/leaflet-geosearch@3.11.0/dist/bundle.min.js" 
            strategy="afterInteractive"
            onLoad={() => console.log("MapScripts: Geosearch plugin ready")}
          />
          <Script 
            id="leaflet-geocoder"
            src="/vendor/unpkg.com/leaflet-control-geocoder@3.3.1/dist/Control.Geocoder.js" 
            strategy="afterInteractive"
            onLoad={() => console.log("MapScripts: Geocoder plugin ready")}
          />
        </>
      )}
    </>
  );
}
