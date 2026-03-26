import Header from '../../components/Header'
import Footer from '../../components/Footer'
import BottomNav from '../../components/BottomNav'
import { ScrollToTopIcon } from '../../components/LayoutIcons'
import { AuthProvider } from "../api/context/AuthContext"

export default function MainLayout({ children }) {
    return (
        <>
            <Header />

            <AuthProvider>
                <main style={{ paddingBottom: '100px' }}>{children}</main>
                <Footer />
            </AuthProvider>

            <BottomNav />

            <button className="scrollToTopBtn" aria-label="Scroll to top">
                <ScrollToTopIcon />
            </button>
        </>
    )
}