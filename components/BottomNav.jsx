'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, MapPin, User } from 'lucide-react'
import { useSession } from "next-auth/react"
import { useAuth } from "@/app/api/context/AuthContext"

const BottomNav = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { state: authState } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  const navItems = [
    { id: 'home', icon: Home, href: '/', label: 'Home' },
    { id: 'explore', icon: Search, href: '/explore', label: 'Explore' },
    { id: 'add', icon: PlusSquare, href: '/listing/add', label: 'Add' },
    { id: 'proxi', icon: MapPin, href: '/dashboard', label: 'Proxi' },
    { id: 'profile', icon: User, href: '/profile', label: 'Profile' },
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    const index = navItems.findIndex(item => item.href === pathname)
    if (index !== -1) setActiveIndex(index)
  }, [pathname])

  const user = session?.user || authState.user
  
  const getAvatarUrl = (u) => {
    if (!u) return null;
    const raw = u.image || u.profileImage;
    if (!raw || raw === "null" || raw === "undefined") return null;
    return raw;
  };

  if (!mounted) return null

  return (
    <div id="tg-main-nav-wrapper">
      <div className="tg-nav-dock-modern">
        {/* L'indicateur est maintenant une barre fine en haut pour ne pas cacher l'icône */}
        <div 
          className="tg-active-bar"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />

        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.id} 
              href={item.href} 
              className={`tg-nav-link-item ${isActive ? 'tg-active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <div className="tg-nav-content-box">
                {item.id === 'profile' && getAvatarUrl(user) ? (
                  <img 
                    src={getAvatarUrl(user)} 
                    alt="P" 
                    className={`tg-nav-avatar-img ${isActive ? 'tg-avatar-active' : ''}`} 
                  />
                ) : (
                  <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className="tg-nav-lucide-icon"
                  />
                )}
                <span className="tg-nav-text-label">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      <style jsx global>{`
        /* ISOLATION TOTALE POUR ÉVITER LES CONFLITS BOOTSTRAP */
        #tg-main-nav-wrapper {
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
          #tg-main-nav-wrapper {
            display: flex !important;
          }
        }

        .tg-nav-dock-modern {
          pointer-events: auto !important;
          position: relative !important;
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          width: 100% !important;
          max-width: 400px !important;
          height: 62px !important;
          background: #ffffff !important;
          border-radius: 25px !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          padding: 0 4px !important;
          overflow: hidden !important;
          margin: 0 auto !important;
        }

        .tg-active-bar {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 20% !important;
          height: 3px !important;
          background: #0088cc !important;
          transition: transform 0.4s cubic-bezier(0.2, 1, 0.2, 1) !important;
          z-index: 5 !important;
        }

        .tg-nav-link-item {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-decoration: none !important;
          border: none !important;
          outline: none !important;
          background: none !important;
          position: relative !important;
          height: 100% !important;
        }

        .tg-nav-link-item, 
        .tg-nav-link-item:hover, 
        .tg-nav-link-item:focus, 
        .tg-nav-link-item:active,
        .tg-nav-link-item span {
          text-decoration: none !important;
          border-bottom: none !important;
          outline: none !important;
          box-shadow: none !important;
        }

        .tg-nav-content-box {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          color: #000000 !important;
          transition: transform 0.2s ease !important;
        }

        .tg-nav-lucide-icon {
          color: #000000 !important;
          margin-bottom: 1px !important;
        }

        .tg-nav-text-label {
          font-size: 10px !important;
          font-weight: 700 !important;
          color: #000000 !important;
          text-decoration: none !important;
          line-height: 1.2 !important;
          text-transform: none !important;
          margin: 0 !important;
        }

        .tg-active .tg-nav-content-box {
          color: #0088cc !important;
          transform: translateY(-2px) !important;
        }

        .tg-active .tg-nav-lucide-icon,
        .tg-active .tg-nav-text-label {
          color: #0088cc !important;
        }

        .tg-nav-avatar-img {
          width: 24px !important;
          height: 24px !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          border: 1.5px solid #000000 !important;
        }

        .tg-avatar-active {
          border-color: #0088cc !important;
        }

        .tg-nav-link-item:active {
          transform: scale(0.9) !important;
        }
      `}</style>
    </div>
  )
}

export default BottomNav
