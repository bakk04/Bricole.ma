import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import BottomNav from '../../components/BottomNav'
import BotpressFix from '../../components/botpress/BotpressFix'
import { AuthProvider } from "../api/context/AuthContext"
import Script from 'next/script'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />

            <AuthProvider>
                <main style={{ paddingBottom: '100px' }}>{children}</main>
                <Footer />
            </AuthProvider>

            <BottomNav />
            <BotpressFix />
            <Script
                src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"
                strategy="afterInteractive"
            />
            <Script
                src="https://files.bpcontent.cloud/2025/10/26/17/20251026170722-KH7OBXON.js"
                strategy="afterInteractive"
            />
        </>
    )
}
