// app/layout.tsx
import React from 'react'
import '../styles/app.css'
import '../styles/vendor/bootstrap.min.css'
import '../styles/vendor/font-awesome.css'
import '../styles/vendor/slick.css'
import '../styles/vendor/slick-theme.css'
import '../styles/vendor/wow.min.css'
import '../styles/unpkg.com/leaflet@1.9.4/dist/leaflet.css'
import '../styles/unpkg.com/leaflet-geosearch@3.11.0/dist/geosearch.css'

import Script from 'next/script'
import { Providers } from './providers'
import PWAClient from '../components/pwa/PWAClient'
import GlobalInteractions from '../components/GlobalInteractions'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
    title: {
        default: 'Bricole.ma',
        template: '%s | Bricole.ma'
    },
    description: 'Plateforme des artisans au Maroc - Trouvez le meilleur artisan pour vos travaux.',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Bricole.ma',
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: '/media/images/android-chrome-192x192.png',
        shortcut: '/media/images/android-chrome-192x192.png',
        apple: '/media/images/android-chrome-192x192.png',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#2c3e50',
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="fr">
        <head>
            <meta charSet="UTF-8"/>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
            {/* Preload LCP Images */}
            <link rel="preload" href="/assets/media/hero/img-1.jpg" as="image" />
            <link rel="preload" href="/assets/media/hero/img-6.jpg" as="image" />
        </head>
        <body>
        
        <Providers>
            {children}
        </Providers>
        <GlobalInteractions />
        
        {/* Global Scripts - load after hydration for PWA safety */}
        <Script 
          src="https://code.jquery.com/jquery-3.6.3.min.js" 
          strategy="afterInteractive"
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" 
          strategy="afterInteractive"
        />
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js" 
          strategy="lazyOnload"
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js" 
          strategy="lazyOnload"
        />
        
        {/* PWA Lifecycle Logic */}
        <PWAClient />
        </body>
        </html>
    )
}
