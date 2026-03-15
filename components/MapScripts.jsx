'use client';

import Script from 'next/script';
import { useState } from 'react';

export default function MapScripts() {
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  return (
    <>
      <Script 
        src="/vendor/unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Leaflet loaded");
          setLeafletLoaded(true);
        }}
      />
      
      {leafletLoaded && (
        <>
          <Script 
            src="/vendor/unpkg.com/leaflet-geosearch@3.11.0/dist/bundle.min.js" 
            strategy="afterInteractive"
            onLoad={() => console.log("Leaflet Geosearch loaded")}
          />
          <Script 
            src="/vendor/unpkg.com/leaflet-control-geocoder@3.3.1/dist/Control.Geocoder.js" 
            strategy="afterInteractive"
            onLoad={() => console.log("Leaflet Geocoder loaded")}
          />
        </>
      )}
    </>
  );
}
