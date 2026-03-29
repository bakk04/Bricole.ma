'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, MapPin, User } from 'lucide-react'
import { useSession } from "next-auth/react"
import { useAuth } from "@/app/api/context/AuthContext"

const BottomNav = () => {
  const pathname = usePathname()
  const { data: session, status: sessionStatus } = useSession()
  const { state: authState } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  // On ne considère l'utilisateur connecté QUE si sessionStatus est 'authenticated' 
  // OU si authState.user existe alors que sessionStatus est 'unauthenticated' (cas login classique)
  const user = (sessionStatus === 'authenticated' ? session?.user : null) || (sessionStatus === 'unauthenticated' ? authState.user : null)
  const urlToken = user?.urlToken || ""
  
  // Sécurité renforcée pour isLoggedIn : on s'assure que le status n'est pas en train de charger 
  // et qu'on n'est pas dans un état de déconnexion
  const isLoggedIn = !!user && !!urlToken && sessionStatus !== 'loading' && sessionStatus !== 'unauthenticated' ? !!user : (sessionStatus === 'unauthenticated' && !!authState.user)

  const navItems = [
    { id: 'home', icon: Home, href: '/', label: 'Home' },
    { id: 'explore', icon: Search, href: '/explore', label: 'Explore' },
    { id: 'add', icon: PlusSquare, href: '/listing/add', label: 'Publier' },
    { id: 'proxi', 
      icon: MapPin, 
      href: '/explore', 
      label: 'Proxi' 
    },
    { id: 'profile', 
      icon: User, 
      href: isLoggedIn 
        ? (user?.role === 'ARTISAN' ? `/dashboard/${urlToken}` : `/profile/${urlToken}`) 
        : '/login', 
      label: 'Profile' 
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    const index = navItems.findIndex(item => item.href === pathname)
    if (index !== -1) setActiveIndex(index)
  }, [pathname, isLoggedIn, sessionStatus]) // Ajout de sessionStatus comme dépendance

  const getAvatarUrl = (u) => {
    // Si pas de session NextAuth ET pas de user local, on renvoie null direct
    if (sessionStatus === 'unauthenticated' && !authState.user) return null;
    if (!isLoggedIn || !u) return null;
    
    const raw = u.image || u.profileImage;
    if (!raw || raw === "null" || raw === "undefined") return null;
    return raw;
  };

  if (!mounted) return null

  return (
    <div id="tg-final-nav-wrapper">
      <div className="tg-dock-modern-final">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.id} 
              href={item.href} 
              className={`tg-link-final ${isActive ? 'tg-active-final' : ''}`}
              onClick={() => {
                if (isActive) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setActiveIndex(index);
              }}
            >
              <div className="tg-box-final">
                <div className="tg-icon-container-final">
                  {item.id === 'profile' && getAvatarUrl(user) ? (
                    <img 
                      src={getAvatarUrl(user)} 
                      alt="P" 
                      className={`tg-avatar-final ${isActive ? 'tg-avatar-active' : ''}`} 
                    />
                  ) : (
                    <Icon 
                      size={24} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className="tg-lucide-final"
                    />
                  )}
                </div>
                <span className="tg-label-final">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      <style jsx global>{`
        #tg-final-nav-wrapper {
          display: none !important;
          position: fixed !important;
          bottom: 15px !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 2147483647 !important;
          pointer-events: none !important;
          justify-content: center !important;
          padding: 0 12px !important;
        }

        @media (max-width: 768px) {
          #tg-final-nav-wrapper {
            display: flex !important;
          }
        }

        .tg-dock-modern-final {
          pointer-events: auto !important;
          position: relative !important;
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          width: 100% !important;
          max-width: 400px !important;
          height: 64px !important;
          background: #ffffff !important;
          border-radius: 30px !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
          margin: 0 auto !important;
          padding: 0 5px !important;
        }

        .tg-link-final {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-decoration: none !important;
          border: none !important;
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .tg-link-final, .tg-link-final:hover, .tg-link-final span {
          text-decoration: none !important;
          border-bottom: none !important;
        }

        .tg-box-final {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          color: #000000 !important;
          transition: all 0.3s ease !important;
        }

        .tg-icon-container-final {
          height: 28px !important; 
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin-bottom: 2px !important;
        }

        .tg-lucide-final {
          color: #000000 !important;
          transition: transform 0.3s ease !important;
        }

        .tg-label-final {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #000000 !important;
          line-height: 1 !important;
          margin: 0 !important;
          text-align: center !important;
        }

        .tg-active-final .tg-box-final {
          color: #0088cc !important;
          transform: translateY(-2px) !important;
        }

        .tg-active-final .tg-lucide-final,
        .tg-active-final .tg-label-final {
          color: #0088cc !important;
        }

        .tg-avatar-final {
          width: 26px !important;
          height: 26px !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          border: 2px solid transparent !important;
        }

        .tg-avatar-active {
          border-color: #0088cc !important;
        }

        .tg-link-final:active {
          transform: scale(0.9) !important;
        }

        @media (prefers-color-scheme: dark) {
          .tg-dock-modern-final { background: #ffffff !important; }
          .tg-box-final, .tg-label-final { color: #000000 !important; }
          .tg-active-final .tg-box-final { color: #0088cc !important; }
        }
      `}</style>
    </div>
  )
}

export default BottomNav
