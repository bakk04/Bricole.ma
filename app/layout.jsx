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

export const metadata = {
    title: 'Bricole.ma',
    description: 'Bricole.ma',
}

export default function RootLayout({ children }) {
    return (
        <html lang="fr">

        <head>
            <meta charSet="UTF-8"/>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
            <meta name="description" content="Finder || Directory Listing Template"/>

            <title>Bricole.ma</title>

            <link rel="shortcut icon" type="image/x-icon" href="../styles/media/favicon.webp"/>
            <link rel="apple-touch-icon" sizes="180x180" href="../styles/media/favicon.png"/>
            <link rel="stylesheet" href="../styles/vendor/font-awesome.css"/>
            <link rel="stylesheet" href="../styles/vendor/bootstrap.min.css"/>
            <link rel="stylesheet" href="../styles/vendor/slick.css"/>
            <link rel="stylesheet" href="../styles/vendor/slick-theme.css"/>
            <link rel="stylesheet" href="../styles/vendor/wow.min.css"/>
            <link rel="stylesheet" href="../styles/unpkg.com/leaflet%401.9.4/dist/leaflet.css"/>
            <link rel="stylesheet" href="../styles/unpkg.com/leaflet-geosearch%403.11.0/dist/geosearch.css"/>
            <link rel="stylesheet" href="../styles/app.css"/>

        </head>
        <body>
        
        {/* Contenu de la page */}
        <Providers>
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
