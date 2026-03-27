'use client'
// components/Header.jsx
import Link from 'next/link'
import React, { useState, useRef, useEffect } from 'react'
import {
    ChevronDown, User, Plus, Home, Info,
    List, BookOpen, FolderOpen, X, Menu,
    Mail, Phone, LogOut, Compass, Settings2, LayoutDashboard,ShieldCheck,Settings,
    CircleUserRound, BarChart3, SlidersHorizontal, PowerOff, ChevronRight, Fingerprint,
    Heart, Sparkles
} from "lucide-react";
import LanguageSwitcher from './LanguageSwitcher';
import { useSession, signOut } from "next-auth/react";
import { useAuth } from "@/app/api/context/AuthContext";
import './Header.module.css'
import {FaUser} from "react-icons/fa";

export default function Header() {
    // ... (rest of the logic remains the same)
    const { data: session, status: sessionStatus } = useSession();
    const { state: authState, dispatch: authDispatch, checkAuth } = useAuth();
    const [openDropdown, setOpenDropdown] = useState(null)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const [mobileSubmenu, setMobileSubmenu] = useState(null)
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const navRef = useRef(null)
    const profileRef = useRef(null);

    useEffect(() => {
        // Ne lancer checkAuth que si on n'a ni session NextAuth ni user dans le contexte local
        if (!authState.user && sessionStatus !== 'authenticated' && sessionStatus !== 'loading') {
            checkAuth();
        }
    }, [authState.user, sessionStatus]);

    // Si une session NextAuth existe (Google, etc.), on la privilégie pour l'avatar (image)
    // Ainsi, pour un compte Google, on utilise toujours session.user (qui contient l'image)
    // et on ne revient pas au user du contexte sans image.
    const user = session?.user || authState.user;
    const urlToken = user?.urlToken || "";
    const isLoggedIn = !!user;
    // Plus de délai artificiel : si on a un user, on n'est plus en loading
    const isLoading = !isLoggedIn && (sessionStatus === 'loading' || authState.loading);

    useEffect(() => {
        function handleClickOutside(e) {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setOpenDropdown(null)
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!mobileNavOpen) setMobileSubmenu(null)
        if (mobileNavOpen) setShowProfileMenu(false); // Close profile menu when mobile nav opens
    }, [mobileNavOpen])

    useEffect(() => {
        if (showProfileMenu) setMobileNavOpen(false); // Close mobile nav when profile menu opens
    }, [showProfileMenu])

    function toggleDropdown(name) {
        setOpenDropdown((prev) => (prev === name ? null : name))
    }

    const handleLogout = async () => {
        try {
            if (session) {
                await signOut({ redirect: false });
            }
            await fetch("/api/auth/logout", { method: "POST" });
            authDispatch({ type: "LOGOUT" });
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const getInitials = (name = "") => {
        if (!name) return "U";
        const parts = name.split(" ").filter(Boolean);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Nettoie l'URL d'avatar : évite les valeurs "null"/"undefined" stockées en base
    const getAvatarUrl = (u) => {
        if (!u) return null;
        const raw = u.image || u.profileImage;
        if (!raw) return null;
        const val = String(raw).trim();
        if (!val || val === "null" || val === "undefined") return null;
        return val;
    };

    return (
        <header className="header container-fluid">
            <div className="main-menu">
                <nav className="navigation" ref={navRef}>
                    {/* Mobile Header Icons */}
                    <div className="mobile-only mobile-header-left">
                        <LanguageSwitcher minimal />
                    </div>

                    <Link href="/" className="header-logo-link">
                        <img src="/assets/media/images/logo.png" className="header-logo" alt="Bricole.ma" />
                    </Link>

                    <div className="mobile-only mobile-header-right">
                        <Link href="/favorites">
                            <Heart size={24} color="#262626" />
                        </Link>
                    </div>

                    <div className="main-menu__nav">
                        <ul className="main-menu__list">
                            <li>
                                <Link href="/" className="active nav-link-item">
                                    <Home className="nav-icon" size={18} aria-hidden />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="nav-link-item">
                                    <Info className="nav-icon" size={18} aria-hidden />
                                    <span>About Us</span>
                                </Link>
                            </li>

                            <li className={`dropdown ${openDropdown === 'listings' ? 'open' : ''}`}>
                                <button
                                    type="button"
                                    className="dropdown-trigger"
                                    onClick={(e) => { e.stopPropagation(); toggleDropdown('listings') }}
                                >
                                    <List className="nav-icon" size={18} aria-hidden />
                                    <span>Listings</span>
                                    <ChevronDown className="d-lg-block d-none dropdown-chevron" size={14} style={{ marginLeft: '4px' }} />
                                </button>
                                <ul>
                                    <li><Link href="/listing/grid" onClick={() => setOpenDropdown(null)}>Directory (Grid Style)</Link></li>
                                    <li><Link href="/listing/list" onClick={() => setOpenDropdown(null)}>Directory (List Style)</Link></li>
                                    <li><Link href="/listing/add" onClick={() => setOpenDropdown(null)}>Add Listing</Link></li>
                                    <li><Link href="/listing/restaurant" onClick={() => setOpenDropdown(null)}>Listing Restaurant Detail</Link></li>
                                    <li><Link href="/listing/shop" onClick={() => setOpenDropdown(null)}>Listing Shop Detail</Link></li>
                                </ul>
                            </li>

                            <li className={`dropdown ${openDropdown === 'blogs' ? 'open' : ''}`}>
                                <button
                                    type="button"
                                    className="dropdown-trigger"
                                    onClick={(e) => { e.stopPropagation(); toggleDropdown('blogs') }}
                                >
                                    <BookOpen className="nav-icon" size={18} aria-hidden />
                                    <span>Blogs</span>
                                    <ChevronDown className="d-lg-block d-none dropdown-chevron" size={14} style={{ marginLeft: '4px' }} />
                                </button>
                                <ul>
                                    <li><Link href="/blogs" onClick={() => setOpenDropdown(null)}>Blogs</Link></li>
                                    <li><Link href="/blog/1" onClick={() => setOpenDropdown(null)}>Blog Detail</Link></li>
                                </ul>
                            </li>

                            <li className={`dropdown ${openDropdown === 'pages' ? 'open' : ''}`}>
                                <button
                                    type="button"
                                    className="dropdown-trigger"
                                    onClick={(e) => { e.stopPropagation(); toggleDropdown('pages') }}
                                >
                                    <FolderOpen className="nav-icon" size={18} aria-hidden />
                                    <span>Pages</span>
                                    <ChevronDown className="d-lg-block d-none dropdown-chevron" size={14} style={{ marginLeft: '4px' }} />
                                </button>
                                <ul>
                                    <li><Link href="/contact" onClick={() => setOpenDropdown(null)}>Contact Us</Link></li>
                                    <li><Link href="/login" onClick={() => setOpenDropdown(null)}>Login</Link></li>
                                    <li><Link href="/register" onClick={() => setOpenDropdown(null)}>Sign Up</Link></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <div className="main-menu__right">
                        <div className="d-flex align-items-center gap-4">
                            <div className="d-none d-sm-block">
                                <LanguageSwitcher />
                            </div>

                            {isLoggedIn ? (
                                <div className="orbit-container" ref={profileRef}>
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className={`orbit-trigger ${showProfileMenu ? 'orbit-open' : ''}`}
                                        aria-label="User menu"
                                    >
                                        <div className="orbit-ring" />
                                        <div className="orbit-avatar">
                                            {getAvatarUrl(user) ? (
                                                <img src={getAvatarUrl(user)} alt={user.name} referrerPolicy="no-referrer" />
                                            ) : (
                                                <span className="orbit-initials">{getInitials(user.name)}</span>
                                            )}
                                        </div>
                                        <div className="orbit-status-dot" />
                                    </button>

                                    {showProfileMenu && (
                                        <div className="orbit-panel" style={{ width: '230px', padding: '10px', zIndex: 9999 }}>

                                            {/* Header user */}
                                            <div className="orbit-panel-top" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '0 4px' }}>
                                                <div className="orbit-panel-avatar" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                                                    {getAvatarUrl(user) ? (
                                                        <img src={getAvatarUrl(user)} alt={user.name} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                                    ) : (
                                                        <span style={{ fontSize: '13px' }}>{getInitials(user.name)}</span>
                                                    )}
                                                </div>
                                                <div className="orbit-panel-meta" style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center', overflow: 'hidden' }}>
                                                    <p className="orbit-panel-name" style={{ margin: 0, padding: 0, fontSize: '14px', fontWeight: 'bold', color: '#111', lineHeight: '1.2', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</p>
                                                    <p className="orbit-panel-email" style={{ margin: 0, padding: 0, fontSize: '12px', color: '#666', lineHeight: '1.2', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="orbit-panel-divider" style={{ margin: '6px 0', backgroundColor: '#eee', height: '1px' }} />

                                            {/* Nav selon rôle */}
                                            <nav className="orbit-nav" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>

                                                {user.role === 'CLIENT' && (
                                                    <>
                                                        <Link href={`/profile/${urlToken}`} className="orbit-nav-item hover-animate" onClick={() => setShowProfileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px', textDecoration: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease', borderRadius: '8px' }}>
                                                            <div className="orbit-nav-icon" style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}><User size={14} /></div>
                                                            <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '13px', flex: 1 }}>Mon Espace</span>
                                                        </Link>
                                                        <Link href={`/profile/${urlToken}/settings`} className="orbit-nav-item hover-animate" onClick={() => setShowProfileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px', textDecoration: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease', borderRadius: '8px' }}>
                                                            <div className="orbit-nav-icon" style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}><Settings size={14} /></div>
                                                            <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '13px', flex: 1 }}>Paramètres</span>
                                                        </Link>
                                                    </>
                                                )}

                                                {user.role === 'ARTISAN' && (
                                                    <>
                                                        <Link href={`/dashboard/${urlToken}`} className="orbit-nav-item hover-animate" onClick={() => setShowProfileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px', textDecoration: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease', borderRadius: '8px' }}>
                                                            <div className="orbit-nav-icon" style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}><BarChart3 size={14} /></div>
                                                            <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '13px', flex: 1 }}>Mon Dashboard</span>
                                                            <ChevronRight size={12} className="orbit-nav-arrow" style={{ color: '#cbd5e1' }} />
                                                        </Link>
                                                        <Link href={`/dashboard/${urlToken}/settings`} className="orbit-nav-item hover-animate" onClick={() => setShowProfileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px', textDecoration: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease', borderRadius: '8px' }}>
                                                            <div className="orbit-nav-icon" style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}><SlidersHorizontal size={14} /></div>
                                                            <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '13px', flex: 1 }}>Paramètres</span>
                                                            <ChevronRight size={12} className="orbit-nav-arrow" style={{ color: '#cbd5e1' }} />
                                                        </Link>
                                                    </>
                                                )}

                                                {user.role === 'ADMIN' && (
                                                    <>
                                                        <Link href="/admin" className="orbit-nav-item hover-animate" onClick={() => setShowProfileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px', textDecoration: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease', borderRadius: '8px' }}>
                                                            <div className="orbit-nav-icon" style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}><ShieldCheck size={14} /></div>
                                                            <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '13px', flex: 1 }}>Administration</span>
                                                            <ChevronRight size={12} className="orbit-nav-arrow" style={{ color: '#cbd5e1' }} />
                                                        </Link>
                                                        <Link href={`/profile/${urlToken}/settings`} className="orbit-nav-item hover-animate" onClick={() => setShowProfileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px', textDecoration: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease', borderRadius: '8px' }}>
                                                            <div className="orbit-nav-icon" style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}><SlidersHorizontal size={14} /></div>
                                                            <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '13px', flex: 1 }}>Paramètres</span>
                                                            <ChevronRight size={12} className="orbit-nav-arrow" style={{ color: '#cbd5e1' }} />
                                                        </Link>
                                                    </>
                                                )}
                                            </nav>

                                            <div className="orbit-panel-divider" style={{ margin: '6px 0', backgroundColor: '#eee', height: '1px' }} />

                                            <button onClick={handleLogout} className="orbit-logout-btn hover-animate-red" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.2s ease', borderRadius: '8px' }}>
                                                <div className="orbit-nav-icon logout-icon" style={{ color: '#e53935', display: 'flex', alignItems: 'center' }}><PowerOff size={14} /></div>
                                                <span style={{ color: '#e53935', fontWeight: '600', fontSize: '13px', flex: 1, textAlign: 'left' }}>Déconnexion</span>
                                            </button>

                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/login" className="rigister-btn d-none d-sm-flex" style={{ textDecoration: 'none' }}>
                                    <FaUser style={{ color: '#1478f1', flexShrink: 0 }} size={18} />
                                    <span className="text" style={{ fontSize: '14px' }}>Login / Register</span>
                                </Link>
                            )}

                            <Link href="/listing/add" className="cus-btn d-none d-sm-flex">
                                <span className="text">Add Listing</span>
                                <Plus size={20} className="cus-btn-icon" />
                            </Link>
                            <button
                                type="button"
                                className="d-xl-none d-none d-sm-flex main-menu__toggler mobile-nav__toggler"
                                onClick={() => setMobileNavOpen(true)}
                                style={{ background: 'rgba(20, 120, 241, 0.05)', border: 'none', padding: '8px', borderRadius: '10px' }}
                            >
                                <Menu size={22} color="#1478f1" />
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Menu mobile */}
            <div className={`mobile-nav__wrapper ${mobileNavOpen ? 'expanded' : ''}`}>
                <div className="mobile-nav__overlay mobile-nav__toggler" onClick={() => setMobileNavOpen(false)} />
                <div className="mobile-nav__content">
                    <div className="mobile-nav__header">
                        <Link href="/" onClick={() => setMobileNavOpen(false)}>
                            <img src="/assets/media/images/logo.png" alt="Bricole.ma" style={{ height: '32px' }} />
                        </Link>
                        <button className="mobile-nav__close" onClick={() => setMobileNavOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mobile-nav__body">
                        {!isLoggedIn && (
                            <Link href="/login" className="mobile-nav__btn mobile-nav__btn--secondary" onClick={() => setMobileNavOpen(false)} style={{ width: '100%', marginBottom: '20px' }}>
                                <User size={18} /> <span>Login / Register</span>
                            </Link>
                        )}
                        
                        <div className="mobile-nav__nav">
                            <ul className="main-menu__list">
                                <li>
                                    <Link href="/" className="mobile-nav__link" onClick={() => setMobileNavOpen(false)}>
                                        <Home className="mobile-nav__icon" size={18} /> <span>Home</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="mobile-nav__link" onClick={() => setMobileNavOpen(false)}>
                                        <Info className="mobile-nav__icon" size={18} /> <span>About Us</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/explore" className="mobile-nav__link" onClick={() => setMobileNavOpen(false)}>
                                        <List className="mobile-nav__icon" size={18} /> <span>Explore</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="mobile-nav__link" onClick={() => setMobileNavOpen(false)}>
                                        <Mail className="mobile-nav__icon" size={18} /> <span>Contact</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div style={{ margin: '20px 0' }}>
                            <LanguageSwitcher />
                        </div>

                        <Link href="/listing/add" className="mobile-nav__btn mobile-nav__btn--primary" onClick={() => setMobileNavOpen(false)} style={{ width: '100%' }}>
                            <Plus size={18} /> Add Listing
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .header {
                        padding: 0 !important;
                        height: 60px !important;
                        position: sticky;
                        top: 0;
                        background: #fff !important;
                        border-bottom: 1px solid #f0f0f0;
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .navigation {
                        justify-content: center !important;
                        width: 100%;
                    }
                    .header-logo-link {
                        margin: 0 auto !important;
                        display: flex;
                        justify-content: center;
                        width: 100%;
                    }
                    .header-logo {
                        height: 32px !important;
                        width: auto;
                    }
                    .main-menu__nav, .main-menu__right {
                        display: none !important; /* On cache tout le reste sur mobile */
                    }
                }
                
                @media (max-width: 768px) {
                    .mobile-only {
                        display: flex !important;
                        align-items: center;
                        justify-content: center;
                        width: 50px;
                        height: 100%;
                        z-index: 10;
                    }
                    .mobile-header-left {
                        position: absolute;
                        left: 5px;
                    }
                    .mobile-header-right {
                        position: absolute;
                        right: 5px;
                    }
                    .header-logo-link {
                        position: relative;
                        z-index: 5;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-only { display: none !important; }
                }

                /* Loading State */
                .halo-pulse {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: #f0f0f0;
                    position: relative;
                }
                .halo-pulse::after {
                    content: '';
                    position: absolute;
                    top: -4px;
                    left: -4px;
                    right: -4px;
                    bottom: -4px;
                    border-radius: 50%;
                    border: 2px solid #1478f1;
                    opacity: 0;
                    animation: haloOrbit 1.5s infinite;
                }
                @keyframes haloOrbit {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(1.2); opacity: 0; }
                }

                /* Orbit Trigger */
                .orbit-container {
                    position: relative;
                }
                .orbit-trigger {
                    background: transparent;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    position: relative;
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .orbit-trigger:hover {
                    transform: scale(1.05);
                }
                .orbit-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 1.5px solid #eee;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                .orbit-open .orbit-ring {
                    border-color: #1478f1;
                    border-width: 2px;
                    transform: scale(1.1);
                }
                .orbit-avatar {
                    width: 32px;
                    height: 32px;
                    background: #000;
                    border-radius: 50%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                }
                .orbit-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .orbit-initials {
                    color: #fff;
                    font-weight: 700;
                    font-size: 13px;
                }
                .orbit-status-dot {
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    width: 10px;
                    height: 10px;
                    background: #10b981;
                    border: 2px solid #fff;
                    border-radius: 50%;
                    z-index: 2;
                }

                /* Orbit Panel (Dropdown) */
                .orbit-panel {
                    position: absolute;
                    top: calc(100% + 15px);
                    right: 0;
                    width: 280px;
                    background: #fff;
                    border-radius: 20px;
                    border: 1px solid rgba(0,0,0,0.06);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
                    z-index: 1000;
                    padding: 20px;
                    animation: orbitPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes orbitPop {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .orbit-panel-top {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .orbit-panel-avatar {
                    width: 48px;
                    height: 48px;
                    background: #000;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-weight: 700;
                    position: relative;
                    overflow: hidden;
                }
                .orbit-panel-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .orbit-panel-meta {
                    flex: 1;
                    min-width: 0;
                }
                .orbit-panel-name {
                    font-weight: 700;
                    font-size: 15px;
                    color: #1a1a1a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .orbit-panel-email {
                    font-size: 12px;
                    color: #71717a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .orbit-panel-divider {
                    height: 1px;
                    background: #f4f4f5;
                    margin: 0 -20px 15px;
                }

                /* Orbit Navigation */
                .orbit-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-bottom: 15px;
                }
                .orbit-nav-item {
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    padding: 10px !important;
                    border-radius: 12px !important;
                    color: #3f3f46 !important;
                    font-size: 14px !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                    text-decoration: none !important;
                }
                .orbit-nav-item:hover {
                    background: #f8fafc !important;
                    color: #1478f1 !important;
                    transform: translateX(4px);
                }
                .orbit-nav-icon {
                    width: 32px;
                    height: 32px;
                    background: #f4f4f5;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #71717a;
                    transition: all 0.2s ease;
                }
                .orbit-nav-item:hover .orbit-nav-icon {
                    background: #1478f1;
                    color: #fff;
                }
                .orbit-nav-arrow {
                    margin-left: auto;
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.2s ease;
                }
                .orbit-nav-item:hover .orbit-nav-arrow {
                    opacity: 1;
                    transform: translateX(0);
                }

                /* Logout Button */
                .orbit-logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    border-radius: 12px;
                    background: #fff1f2;
                    border: none;
                    color: #e11d48;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .orbit-logout-btn:hover {
                    background: #ffe4e6;
                    transform: scale(1.02);
                }
                .logout-icon {
                    background: #fda4af !important;
                    color: #e11d48 !important;
                }

                /* Login Link Style */
                .orbit-login-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 18px;
                    background: #000;
                    color: #fff;
                    border-radius: 14px;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    border: 1px solid transparent;
                }
                .orbit-login-link:hover {
                    background: #fff;
                    color: #000;
                    border-color: #000;
                    transform: translateY(-2px);
                }

                /* Mobile V5 Adaptations */
                .mobile-user-card-v5 {
                    background: #fff;
                    border-radius: 16px;
                    border: 1px solid #eee;
                    overflow: hidden;
                    margin-bottom: 20px;
                }
                .m5-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #000;
                    color: #fff;
                }
                .m5-avatar {
                    width: 44px;
                    height: 44px;
                    background: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #000;
                    font-weight: 700;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .m5-name {
                    font-weight: 600;
                    font-size: 15px;
                }
                .m5-email {
                    font-size: 12px;
                    opacity: 0.7;
                }
                .m5-links {
                    display: flex;
                    flex-direction: column;
                    padding: 8px;
                }
                .m5-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    color: #333;
                    font-weight: 600;
                    font-size: 14px;
                    text-decoration: none !important;
                    border-radius: 10px;
                    border: none;
                    background: transparent;
                    width: 100%;
                    text-align: left;
                }
                .m5-item:active {
                    background: #f0f0f0;
                }
                .m5-logout {
                    color: #e53e3e;
                    border-top: 1px solid #eee;
                    border-radius: 0;
                }
                /* Mobile Navigation Adjustments */
                .mobile-nav__divider {
                    height: 1px;
                    background: #eee;
                    margin: 15px 0;
                }

                @media (max-width: 576px) {
                    .d-sm-flex.rigister-btn { display: none !important; }
                    .d-sm-flex.cus-btn { display: none !important; }
                }
            `}</style>
        </header>
    )
}