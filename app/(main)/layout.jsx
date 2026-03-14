import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { ScrollToTopIcon } from '../../components/LayoutIcons'
import { AuthProvider } from "../api/context/AuthContext"
import PWARegister from "../../components/pwa/PWARegister"

export default function MainLayout({ children }) {
    return (
        <>
            <PWARegister />

            <Header />

            <AuthProvider>
                {children}
                <Footer />
            </AuthProvider>

            <button className="scrollToTopBtn" aria-label="Scroll to top">
                <ScrollToTopIcon />
            </button>
        </>
    )
}