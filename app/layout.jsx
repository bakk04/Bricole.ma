// app/layout.jsx
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

/** @type {import('next').Metadata} */
export const metadata = {
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
        icon: '/assets/media/favicon.png',
        shortcut: '/assets/media/favicon.png',
        apple: '/assets/media/favicon.png',
    },
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Maintain for native-like feel as requested
    viewportFit: 'cover',
    themeColor: '#2c3e50',
}

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
        <head>
            <meta charSet="UTF-8"/>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        </head>
        <body>
        
        <Providers>
            {/* PWA logic and global UI */}
            <PWAClient />
            {children}
        </Providers>

        {/* Scripts JS */}
        <Script src="../lib/vendor/bootstrap.min.js" strategy="afterInteractive"/>
        <Script src="../lib/vendor/jquery-3.6.3.min.html" strategy="afterInteractive"/>
        <Script src="../lib/vendor/jquery-validator.html" strategy="afterInteractive"/>
        <Script src="../lib/vendor/wow.html" strategy="afterInteractive"/>
        <Script src="../styles/unpkg.com/leaflet%401.9.4/dist/leaflet.js" strategy="afterInteractive"/>
        <Script src="../styles/unpkg.com/leaflet-geosearch%403.11.0/dist/bundle.min.js" strategy="afterInteractive"/>
        <Script src="../lib/vendor/countrymap.html" strategy="afterInteractive"/>
        <Script src="../lib/vendor/slick.min.html" strategy="afterInteractive"/>
        <Script src="../lib/app.html" strategy="afterInteractive"/>
        </body>
        </html>
    )
}
