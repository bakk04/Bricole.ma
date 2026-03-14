'use client'
// components/Header.jsx
import Link from 'next/link'
import React, { useState, useRef, useEffect } from 'react'
import { FaChevronDown, FaUser, FaPlus, FaHouse, FaCircleInfo, FaList, FaBlog, FaFolderOpen, FaXmark, FaBars, FaEnvelope, FaPhone } from "react-icons/fa6";
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const [openDropdown, setOpenDropdown] = useState(null)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const [mobileSubmenu, setMobileSubmenu] = useState(null) // 'listings' | 'blogs' | 'pages' | null
    const navRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setOpenDropdown(null)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!mobileNavOpen) setMobileSubmenu(null)
    }, [mobileNavOpen])

    function toggleDropdown(name) {
        setOpenDropdown((prev) => (prev === name ? null : name))
    }

    return (
        <header className="header container-fluid">
            <div className="main-menu">
                <nav className="navigation" ref={navRef}>
                    <Link href="/" className="header-logo-link">
                        <img src="/assets/media/images/logo.png" className="header-logo" alt="Bricole.ma" />
                    </Link>
                    <div className="main-menu__nav">
                        <ul className="main-menu__list">
                            <li>
                                <Link href="/" className="active nav-link-item">
                                    <FaHouse className="nav-icon" size={16} aria-hidden />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="nav-link-item">
                                    <FaCircleInfo className="nav-icon" size={16} aria-hidden />
                                    <span>About Us</span>
                                </Link>
                            </li>

                            <li className={`dropdown ${openDropdown === 'listings' ? 'open' : ''}`}>
                                <button
                                    type="button"
                                    className="dropdown-trigger"
                                    onClick={(e) => { e.stopPropagation(); toggleDropdown('listings') }}
                                    aria-expanded={openDropdown === 'listings'}
                                    aria-haspopup="true"
                                >
                                    <FaList className="nav-icon" size={14} aria-hidden />
                                    <span>Listings</span>
                                    <FaChevronDown className="d-lg-block d-none dropdown-chevron" style={{ marginLeft: '2px' }} aria-hidden />
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
                                    aria-expanded={openDropdown === 'blogs'}
                                    aria-haspopup="true"
                                >
                                    <FaBlog className="nav-icon" size={14} aria-hidden />
                                    <span>Blogs</span>
                                    <FaChevronDown className="d-lg-block d-none dropdown-chevron" style={{ marginLeft: '2px' }} aria-hidden />
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
                                    aria-expanded={openDropdown === 'pages'}
                                    aria-haspopup="true"
                                >
                                    <FaFolderOpen className="nav-icon" size={14} aria-hidden />
                                    <span>Pages</span>
                                    <FaChevronDown className="d-lg-block d-none dropdown-chevron" style={{ marginLeft: '2px' }} aria-hidden />
                                </button>
                                <ul>
                                    <li><Link href="/contact" onClick={() => setOpenDropdown(null)}>Contact Us</Link></li>
                                    <li><Link href="/login" onClick={() => setOpenDropdown(null)}>Login</Link></li>
                                    <li><Link href="/login" onClick={() => setOpenDropdown(null)}>Sign Up</Link></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <div className="main-menu__right">
                        <div className="d-sm-flex gap-24 d-flex align-items-center">
                            <LanguageSwitcher />
                            <Link href="/login" className="rigister-btn d-none d-sm-flex">
                                <FaUser style={{ color: '#1478f1', flexShrink: 0 }} size={20} />
                                <span className="text">Login / Register</span>
                            </Link>
                            <Link href="/listing/add" className="cus-btn d-none d-sm-flex">
                                <span className="text">Add Listing</span>
                                <FaPlus size={20} className="cus-btn-icon" aria-hidden />
                            </Link>
                        </div>
                        <button
                            type="button"
                            className="d-xl-none d-flex main-menu__toggler mobile-nav__toggler"
                            onClick={() => setMobileNavOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={mobileNavOpen}
                        >
                            <FaBars size={24} color="#1478f1" aria-hidden />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Menu mobile - contrôlé par state React */}
            <div className={`mobile-nav__wrapper ${mobileNavOpen ? 'expanded' : ''}`} aria-hidden={!mobileNavOpen}>
                <div
                    className="mobile-nav__overlay mobile-nav__toggler"
                    onClick={() => setMobileNavOpen(false)}
                    onKeyDown={(e) => e.key === 'Escape' && setMobileNavOpen(false)}
                    role="button"
                    tabIndex={0}
                    aria-label="Close menu"
                />
                <div className="mobile-nav__content">
                    <button
                        type="button"
                        className="mobile-nav__close"
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="Close menu"
                    >
                        <FaXmark size={24} aria-hidden />
                    </button>
                    <div className="logo-box">
                        <Link href="/" onClick={() => setMobileNavOpen(false)} aria-label="Bricole.ma">
                            <img src="/assets/media/images/logo.webp" alt="Bricole.ma" />
                        </Link>
                    </div>
                    <nav className="mobile-nav__nav main-menu__nav">
                        <ul className="main-menu__list">
                            <li>
                                <Link href="/" className="mobile-nav__link" onClick={() => setMobileNavOpen(false)}>
                                    <FaHouse className="mobile-nav__icon" size={18} aria-hidden />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="mobile-nav__link" onClick={() => setMobileNavOpen(false)}>
                                    <FaCircleInfo className="mobile-nav__icon" size={18} aria-hidden />
                                    <span>About Us</span>
                                </Link>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`mobile-nav__link mobile-nav__submenu-trigger ${mobileSubmenu === 'listings' ? 'expanded' : ''}`}
                                    onClick={() => setMobileSubmenu(mobileSubmenu === 'listings' ? null : 'listings')}
                                    aria-expanded={mobileSubmenu === 'listings'}
                                >
                                    <FaList className="mobile-nav__icon" size={18} aria-hidden />
                                    <span>Listings</span>
                                    <FaChevronDown className="mobile-nav__chevron" size={14} aria-hidden />
                                </button>
                                <ul className={`mobile-nav__sublist ${mobileSubmenu === 'listings' ? 'expanded' : ''}`}>
                                    <li><Link href="/listing/grid" onClick={() => setMobileNavOpen(false)}>Directory (Grid Style)</Link></li>
                                    <li><Link href="/listing/list" onClick={() => setMobileNavOpen(false)}>Directory (List Style)</Link></li>
                                    <li><Link href="/listing/add" onClick={() => setMobileNavOpen(false)}>Add Listing</Link></li>
                                    <li><Link href="/listing/restaurant" onClick={() => setMobileNavOpen(false)}>Listing Restaurant Detail</Link></li>
                                    <li><Link href="/listing/shop" onClick={() => setMobileNavOpen(false)}>Listing Shop Detail</Link></li>
                                </ul>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`mobile-nav__link mobile-nav__submenu-trigger ${mobileSubmenu === 'blogs' ? 'expanded' : ''}`}
                                    onClick={() => setMobileSubmenu(mobileSubmenu === 'blogs' ? null : 'blogs')}
                                    aria-expanded={mobileSubmenu === 'blogs'}
                                >
                                    <FaBlog className="mobile-nav__icon" size={18} aria-hidden />
                                    <span>Blogs</span>
                                    <FaChevronDown className="mobile-nav__chevron" size={14} aria-hidden />
                                </button>
                                <ul className={`mobile-nav__sublist ${mobileSubmenu === 'blogs' ? 'expanded' : ''}`}>
                                    <li><Link href="/blogs" onClick={() => setMobileNavOpen(false)}>Blogs</Link></li>
                                    <li><Link href="/blog/1" onClick={() => setMobileNavOpen(false)}>Blog Detail</Link></li>
                                </ul>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className={`mobile-nav__link mobile-nav__submenu-trigger ${mobileSubmenu === 'pages' ? 'expanded' : ''}`}
                                    onClick={() => setMobileSubmenu(mobileSubmenu === 'pages' ? null : 'pages')}
                                    aria-expanded={mobileSubmenu === 'pages'}
                                >
                                    <FaFolderOpen className="mobile-nav__icon" size={18} aria-hidden />
                                    <span>Pages</span>
                                    <FaChevronDown className="mobile-nav__chevron" size={14} aria-hidden />
                                </button>
                                <ul className={`mobile-nav__sublist ${mobileSubmenu === 'pages' ? 'expanded' : ''}`}>
                                    <li><Link href="/contact" onClick={() => setMobileNavOpen(false)}>Contact Us</Link></li>
                                    <li><Link href="/login" onClick={() => setMobileNavOpen(false)}>Login</Link></li>
                                    <li><Link href="/login" onClick={() => setMobileNavOpen(false)}>Sign Up</Link></li>
                                </ul>
                            </li>
                        </ul>
                    </nav>
                    <div className="mobile-nav__actions">
                        <Link href="/login" className="mobile-nav__btn mobile-nav__btn--secondary" onClick={() => setMobileNavOpen(false)}>
                            <FaUser size={18} aria-hidden />
                            <span>Login / Register</span>
                        </Link>
                        <Link href="/listing/add" className="mobile-nav__btn mobile-nav__btn--primary" onClick={() => setMobileNavOpen(false)}>
                            <FaPlus size={18} aria-hidden />
                            <span>Add Listing</span>
                        </Link>
                    </div>
                    <ul className="mobile-nav__contact list-unstyled">
                        <li>
                            <FaEnvelope className="mobile-nav__contact-icon" aria-hidden />
                            <Link href="mailto:example@company.com" onClick={() => setMobileNavOpen(false)}>example@company.com</Link>
                        </li>
                        <li>
                            <FaPhone className="mobile-nav__contact-icon" aria-hidden />
                            <Link href="tel:+12345678" onClick={() => setMobileNavOpen(false)}>+123 (4567) -890</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    )
}
