'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, LayoutDashboard, User } from 'lucide-react'
import { useSession } from "next-auth/react"
import { useAuth } from "@/app/api/context/AuthContext"

const BottomNav = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { state: authState } = useAuth()
  
  const user = session?.user || authState.user
  
  const getAvatarUrl = (u) => {
    if (!u) return null;
    const raw = u.image || u.profileImage;
    if (!raw || raw === "null" || raw === "undefined") return null;
    return raw;
  };

  const navItems = [
    { id: 'home', icon: Home, href: '/', activeIcon: Home },
    { id: 'explore', icon: Search, href: '/explore', activeIcon: Search },
    { id: 'add', icon: PlusSquare, href: '/listing/add', activeIcon: PlusSquare },
    { id: 'dashboard', icon: LayoutDashboard, href: '/dashboard', activeIcon: LayoutDashboard },
    { id: 'profile', id: 'profile', href: '/profile' },
  ]

  return (
    <nav className="instagram-nav">
      <div className="nav-wrapper">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          if (item.id === 'profile') {
            return (
              <Link key={item.href} href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                <div className={`avatar-container ${isActive ? 'active-avatar' : ''}`}>
                  {getAvatarUrl(user) ? (
                    <img src={getAvatarUrl(user)} alt="Profile" className="nav-avatar" />
                  ) : (
                    <User size={24} strokeWidth={isActive ? 2.5 : 2} />
                  )}
                </div>
                {isActive && <div className="active-dot" />}
              </Link>
            )
          }

          return (
            <Link key={item.id} href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={26} strokeWidth={isActive ? 2.8 : 2} color={isActive ? "#000" : "#262626"} />
              {isActive && <div className="active-dot" />}
            </Link>
          )
        })}
      </div>

      <style jsx>{`
        .instagram-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          border-top: 1px solid #dbdbdb;
          z-index: 2000;
          padding-bottom: env(safe-area-inset-bottom);
          height: calc(55px + env(safe-area-inset-bottom));
        }

        @media (max-width: 768px) {
          .instagram-nav {
            display: block;
          }
        }

        .nav-wrapper {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 55px;
          max-width: 500px;
          margin: 0 auto;
        }

        .nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          transition: transform 0.1s active;
          position: relative;
        }
        
        .nav-link:active {
          transform: scale(0.9);
        }

        .active-dot {
          width: 4px;
          height: 4px;
          background-color: #000;
          border-radius: 50%;
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
        }

        .avatar-container {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
        }

        .active-avatar {
          border: 1.5px solid #000;
          padding: 1px;
        }

        .nav-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
      `}</style>
    </nav>
  )
}

export default BottomNav
