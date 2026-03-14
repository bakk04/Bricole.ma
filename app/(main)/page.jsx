'use client'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
    Palette, Gem, Scroll, FileText, Shield, Sparkles,
    Wand2, Grid3x3, Hammer, LucideIcon, Check, ChevronDown,
    LayoutGrid, Search, MapPin, Zap, Award
} from 'lucide-react'
import CategorieExplore from "../../components/CategorieExplore";
import CitiesExplore from "../../components/CitiesExplore";

/* ═══════════════════════════════════════════
   MOROCCAN CRAFT CATEGORIES
═══════════════════════════════════════════ */
const CATEGORIES = [
    { label: "Zellij Tilework",      Icon: Grid3x3,     color: "#1478f1" },
    { label: "Leather Crafts",       Icon: Palette,     color: "#3b82f6" },
    { label: "Carpet Weaving",       Icon: Scroll,      color: "#d4915d" },
    { label: "Woodcarving",          Icon: Hammer,      color: "#8b6f47" },
    { label: "Metalwork",            Icon: Sparkles,    color: "#4a5568" },
    { label: "Ceramics",             Icon: Gem,         color: "#e8c39a" },
    { label: "Calligraphy",          Icon: FileText,    color: "#2c3e50" },
    { label: "Argan Crafts",         Icon: Award,       color: "#9d7c4c" },
    { label: "Embroidery",           Icon: Wand2,       color: "#c1666b" },
    { label: "Mosaic Art",           Icon: Grid3x3,     color: "#3b82f6" },
    { label: "Jewelry",              Icon: Gem,         color: "#ffd700" },
    { label: "Textile Design",       Icon: Scroll,      color: "#9d6c4f" },
]

const LEFT_IMGS = [
    "/assets/media/hero/img-1.jpg",
    "/assets/media/hero/img-2.jpg",
    "/assets/media/hero/img-3.jpg",
    "/assets/media/hero/img-4.jpg",
]
const RIGHT_IMGS = [
    "/assets/media/hero/img-6.jpg",
    "/assets/media/hero/img-7.jpg",
    "/assets/media/hero/img-8.jpg",
    "/assets/media/hero/img-9.jpg",
]

/* ═══════════════════════════════════════════
   HERITAGE BADGE — Moroccan craftsmanship badge
   with animated geometric pattern
═══════════════════════════════════════════ */
function HeritageBadge() {
    return (
        <div className="ai-badge">
            {/* Geometric Zellij-inspired icon */}
            <span className="ai-badge-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="2.5" fill="#1478f1" className="ai-dot-center"/>
                    <circle cx="12" cy="12" r="6" fill="none" stroke="#1478f1" strokeWidth="1.2" opacity="0.4" className="ai-branch"/>
                    <circle cx="12" cy="12" r="8" fill="none" stroke="#1478f1" strokeWidth="0.8" opacity="0.2" className="ai-branch-diag"/>
                    <rect x="5" y="5" width="2" height="2" fill="#3b82f6" opacity="0.6" className="ai-node"/>
                    <rect x="17" y="5" width="2" height="2" fill="#3b82f6" opacity="0.6" className="ai-node"/>
                    <rect x="5" y="17" width="2" height="2" fill="#3b82f6" opacity="0.6" className="ai-node"/>
                    <rect x="17" y="17" width="2" height="2" fill="#3b82f6" opacity="0.6" className="ai-node"/>
                </svg>
            </span>
            <span className="ai-badge-text">Authenticated Heritage</span>
            <span className="ai-badge-scan" aria-hidden="true"/>
        </div>
    )
}

/* ═══════════════════════════════════════════
   MOROCCAN GEOMETRY ORB — Decorative floating element
   inspired by Zellij patterns
═══════════════════════════════════════════ */
function GeometryOrb() {
    return (
        <div className="ai-orb" aria-hidden="true">
            <div className="ai-orb-ring ai-orb-ring-1"/>
            <div className="ai-orb-ring ai-orb-ring-2"/>
            <div className="ai-orb-ring ai-orb-ring-3"/>
            <div className="ai-orb-core"/>
        </div>
    )
}

function DiscoveryHint() {
    const hints = [
        "Find master artisans specializing in authentic Zellij tilework",
        "Discover expert leather craftspeople using traditional techniques",
        "Connect with weavers creating heritage carpets by hand",
        "Browse verified artisans preserving Moroccan craftsmanship",
    ]
    const [idx, setIdx] = useState(0)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false)
            setTimeout(() => {
                setIdx(i => (i + 1) % hints.length)
                setVisible(true)
            }, 400)
        }, 3500)
        return () => clearInterval(interval)
    }, [])

    return (
        <p className="ai-hint" style={{ opacity: visible ? 1 : 0 }}>
            {hints[idx]}
        </p>
    )
}

function HeroImg({ src, delay, tall }) {
    const h = tall ? 210 : 150
    const w = 135

    return (
        <div style={{
            height: h, width: w, borderRadius: 20, overflow: 'hidden',
            position: 'relative', flexShrink: 0,
            boxShadow: '0 14px 40px rgba(20, 120, 241, 0.12), 0 2px 8px rgba(0, 0, 0, 0.05)',
            animation: `imageReveal 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay} both`,
            backgroundColor: '#f8fafc',
            transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s ease'
        }}>
            <Image
                src={src}
                alt="Artisan crafting traditional Moroccan goods"
                width={w}
                height={h}
                priority={true}
                className="hero-image-zoom"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: 20,
                    transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    animation: `imageShift 4s ease-in-out infinite`
                }}
            />
            <div style={{
                position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none',
                boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.5), inset 0 -35px 40px rgba(20, 120, 241, 0.08), inset 0 35px 40px rgba(20, 120, 241, 0.04)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(20, 120, 241, 0.06) 100%)',
            }} />
            {delay === '0s' || delay === '0.1s' ? (
                <div className="ai-img-tag" aria-label="Authenticated artisan">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#fff"/>
                    </svg>
                    <span>Verified</span>
                </div>
            ) : null}
        </div>
    )
}

function AnimatedTitle() {
    const titles = [
        { l1: "Discover authentic", l2: "Moroccan ", highlight: "craftsmanship" },
        { l1: "Support traditional", l2: "artisan ", highlight: "heritage" },
        { l1: "Connect with master", l2: "craftspeople ", highlight: "worldwide" },
    ]
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % titles.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const current = titles[index]

    return (
        <h1 style={{
            lineHeight: 1.15, marginBottom: '1rem',
            marginTop: '2rem',
            fontWeight: 800, letterSpacing: '-0.02em',
            fontSize: 'clamp(1.8rem, 3.2vw, 2.8rem)',
            color: '#0f172a',
            minHeight: '2.4em'
        }}>
            <span style={{ display: 'block', overflow: 'hidden', paddingBottom: 4 }}>
                <span key={`l1-${index}`} style={{ display: 'inline-block', animation: 'maskReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
                    {current.l1}
                </span>
            </span>

            <span style={{ display: 'block', overflow: 'hidden', paddingBottom: 12 }}>
                <span key={`l2-${index}`} style={{ display: 'inline-block', position: 'relative', animation: 'maskReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both' }}>
                    {current.l2}
                    <span style={{
                        background: 'linear-gradient(135deg, #1478f1 0%, #3b82f6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'gradientShift 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both'
                    }}>
                        {current.highlight}
                    </span>
                </span>
            </span>
        </h1>
    )
}

function CategoryDropdown({ selectedCategory, setSelectedCategory, dropdownOpen, setDropdownOpen }) {
    const triggerRef = useRef(null)
    const panelRef   = useRef(null)

    const active     = selectedCategory ? CATEGORIES.find(c => c.label === selectedCategory) : null
    const ActiveIcon = active ? active.Icon : LayoutGrid
    const activeClr  = active ? active.color : '#1478f1'
    const activeLabel = active ? active.label : 'Catégorie'

    useEffect(() => {
        const close = e => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                panelRef.current   && !panelRef.current.contains(e.target)
            ) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', close)
        return () => { document.removeEventListener('mousedown', close) }
    }, [setDropdownOpen])

    return (
        <div className="cat-wrap" style={{ display: 'flex', flex: '1 1 0%', minWidth: 0, position: 'static', height: '100%' }}>
            <button
                ref={triggerRef}
                type="button"
                className="cat-trigger"
                onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(!dropdownOpen)
                }}
            >
                <ActiveIcon size={20} color={active ? activeClr : '#94a3b8'} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span className="field-value" style={{ color: active ? '#0f172a' : '#94a3b8', flex: 1, textAlign: 'left' }}>
                    {activeLabel}
                </span>
                <ChevronDown size={18} color="#1478f1" strokeWidth={2.5}
                             style={{ flexShrink: 0, transition: 'transform 0.3s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                />
            </button>

            {dropdownOpen && (
                <div ref={panelRef} className="cat-panel">
                    <div className="cat-ai-header">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="6" fill="none" stroke="#1478f1" strokeWidth="1.5"/>
                            <circle cx="12" cy="12" r="3" fill="#1478f1"/>
                            <rect x="9" y="9" width="2" height="2" fill="#3b82f6"/>
                            <rect x="13" y="9" width="2" height="2" fill="#3b82f6"/>
                            <rect x="9" y="13" width="2" height="2" fill="#3b82f6"/>
                            <rect x="13" y="13" width="2" height="2" fill="#3b82f6"/>
                        </svg>
                        <span>Explore traditional Moroccan crafts</span>
                    </div>
                    <button type="button"
                            className={`cat-row all-row${!selectedCategory ? ' active' : ''}`}
                            onClick={() => { setSelectedCategory(null); setDropdownOpen(false) }}
                    >
                        <div className="cat-icon-wrap" style={{ background: 'rgba(20, 120, 241, 0.1)' }}>
                            <LayoutGrid size={16} color="#1478f1" strokeWidth={2.5} />
                        </div>
                        <span style={{ flex: 1, fontWeight: !selectedCategory ? 600 : 500 }}>All Crafts</span>
                        {!selectedCategory && <Check size={16} color="#1478f1" strokeWidth={2.5} />}
                    </button>
                    <div style={{ height: 1, background: '#f1f5f9', margin: '10px 12px' }} />
                    <div className="cat-grid">
                        {CATEGORIES.map(({ label, Icon, color }) => (
                            <button key={label} type="button"
                                    className={`cat-row${selectedCategory === label ? ' active' : ''}`}
                                    onClick={() => { setSelectedCategory(label); setDropdownOpen(false) }}
                            >
                                <div className="cat-icon-wrap" style={{ background: color + '15' }}>
                                    <Icon size={16} color={color} strokeWidth={2.5} />
                                </div>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: selectedCategory === label ? 600 : 500 }}>{label}</span>
                                {selectedCategory === label && <Check size={14} color={color} strokeWidth={2.5} style={{ flexShrink: 0 }} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function HeroSection() {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    return (
        <>
            <style>{`
        .hero-sec {
          width: 100%;
          padding: 8rem 0 4rem; 
          background: #ffffff;
          zoom: 0.85; 
          position: relative;
        }
        
        .hero-sec::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 30%, rgba(20, 120, 241, 0.03) 60%, rgba(20, 120, 241, 0.06) 100%);
          pointer-events: none; z-index: 0;
          animation: overlayFade 3s ease-in-out infinite;
        }

        .hero-sec::after {
          content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 280px;
          background-image: url('/assets/media/zelij.jpg');
          background-repeat: repeat-x;
          background-size: auto 100%;
          background-position: center;
          opacity: 0.5;
          mask-image: linear-gradient(to top, rgba(0,0,0,1) 20%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 20%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 100%);
          filter: saturate(0.95) brightness(1.05);
          pointer-events: none; z-index: 0;
        }

        .hero-wrap {
          display: flex; align-items: center; justify-content: space-between;
          max-width: 1450px; margin: 0 auto; min-height: 65vh; position: relative; z-index: 1;
        }

        @keyframes imageReveal {
          from { opacity: 0; transform: translateY(50px) scale(0.92); filter: blur(8px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes maskReveal {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeUpText {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 0 0 rgba(20, 120, 241, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(20, 120, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(20, 120, 241, 0); }
        }
        
        @keyframes gradientShift {
          0%, 100% { opacity: 0.8; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.08); }
        }
        
        @keyframes imageShift {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        
        @keyframes overlayFade {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.65; }
        }

        .ha-sub   { animation: fadeUpText 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both; }
        .ha-form  { animation: fadeUpText 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both; }

        .hcol       { display:flex; flex-direction:column; gap:24px; }
        .hcol.shift { margin-top: 60px; }
        
        .hero-image-zoom:hover { transform: scale(1.08); }
        
        .img-wrap div:hover {
          box-shadow: 0 18px 50px rgba(20, 120, 241, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          transform: translateY(-4px);
        }

        .ha-form form { 
          width: 100%; 
          max-width: 1200px;
          margin: 0 auto; 
        }
        
        .sbar {
          display:flex; align-items:center;
          background: rgba(255, 255, 255, 0.9); 
          backdrop-filter: blur(12px); 
          border-radius: 100px; 
          box-shadow: 0 16px 48px rgba(20, 120, 241, 0.12), 0 2px 8px rgba(0,0,0,0.04);
          border: 1px solid rgba(20, 120, 241, 0.15);
          padding: 8px 12px; gap:0;
          position:relative; z-index: 100;
          height: 74px;
          transition: all 0.3s ease;
        }
        .sbar:hover {
          box-shadow: 0 20px 54px rgba(20, 120, 241, 0.18), 0 4px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(20, 120, 241, 0.25);
        }

        .sfield, .cat-trigger {
          display:flex; flex-direction: row; align-items: center; justify-content: flex-start;
          padding: 0 28px; 
          flex: 1 1 0%; 
          min-width: 0; 
          height: 100%; 
          border-radius: 100px; transition: background 0.2s ease;
          cursor: text; gap: 14px; 
        }
        .sfield:hover, .cat-trigger:hover { background: rgba(20, 120, 241, 0.04); }
        
        .field-value, .sfield input {
          border:none; outline:none; background:transparent;
          font-size: 1.05rem;
          color:#0f172a; width:100%; padding:0; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sfield input::placeholder { color:#94a3b8; font-weight: 400; }
        
        .sdiv { width:1px; height: 34px; background: #e2e8f0; flex-shrink:0; margin: 0 4px; }

        .cat-panel {
          position: absolute; top: calc(100% + 16px); left: 0; right: 0;
          background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px);
          border-radius: 28px;
          box-shadow: 0 24px 70px rgba(20, 120, 241, 0.15), 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid rgba(20, 120, 241, 0.1);
          padding: 18px;
          animation: panelIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
          z-index: 99999;
        }
        .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .cat-row {
          display:flex; align-items:center; gap:12px; width:100%; padding:12px 16px;
          border:none; border-radius:16px; background:transparent;
          cursor:pointer; font-size:0.9rem; color:#1e293b;
          transition: all 0.2s ease; text-align:left;
        }
        .cat-row:hover  { background: rgba(20, 120, 241, 0.05); transform: translateY(-2px); }
        .cat-row.active { background: rgba(20, 120, 241, 0.08); color: #1478f1; }
        .cat-icon-wrap { width:36px; height:36px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        .sbtn {
          border:none; border-radius: 100px; cursor:pointer;
          padding: 0 32px; height: 54px; 
          font-size: 1.05rem; font-weight: 700; color:#fff;
          display:flex; align-items:center; gap:10px; white-space:nowrap; flex-shrink:0;
          background: linear-gradient(135deg, #1478f1 0%, #3b82f6 100%);
          box-shadow: 0 8px 24px rgba(20, 120, 241, 0.35);
          transition: all 0.3s ease;
        }
        .sbtn:hover { 
          transform: translateY(-2px) scale(1.02); 
          box-shadow: 0 12px 32px rgba(20, 120, 241, 0.45); 
          animation: glowPulse 1.5s infinite;
        }
        .sbtn:active { transform: translateY(0) scale(0.98); }

        @keyframes badgeFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanMove {
          0%   { left: -30%; opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        @keyframes dotPulse {
          0%, 100% { r: 3; opacity: 1; }
          50%       { r: 3.8; opacity: 0.75; }
        }
        @keyframes nodeBlink {
          0%, 100% { opacity: 1; }
          50%       { r: 3.8; opacity: 0.75; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%       { transform: translate(-50%, -52%) scale(1.03); }
        }
        @keyframes ringExpand {
          0%   { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.4);  opacity: 0; }
        }
        @keyframes hintFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aiTagSlide {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .ai-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px 6px 10px;
          background: linear-gradient(135deg, rgba(20, 120, 241, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
          border: 1px solid rgba(20, 120, 241, 0.2);
          border-radius: 100px;
          font-size: 0.78rem; font-weight: 600; color: #1478f1;
          letter-spacing: 0.02em;
          position: relative; overflow: hidden;
          animation: badgeFadeIn 0.7s cubic-bezier(0.16,1,0.3,1) 1.2s both;
          cursor: default; user-select: none;
          margin-bottom: 18px;
        }
        .ai-badge-icon { display: flex; align-items: center; justify-content: center; }
        .ai-dot-center { animation: dotPulse 2s ease-in-out infinite; }
        .ai-node { animation: nodeBlink 2.4s ease-in-out infinite; }
        .ai-node:nth-child(6) { animation-delay: 0.3s; }
        .ai-node:nth-child(7) { animation-delay: 0.6s; }
        .ai-node:nth-child(8) { animation-delay: 0.9s; }
        .ai-badge-scan {
          position: absolute; top: 0; bottom: 0; width: 30%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
          animation: scanMove 3s ease-in-out 2s infinite;
          pointer-events: none;
        }

        .ai-orb {
          position: absolute;
          top: 50%; left: 50%;
          width: 320px; height: 320px;
          pointer-events: none; z-index: 0;
          animation: orbFloat 6s ease-in-out infinite;
        }
        .ai-orb-core {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 60px; height: 60px; border-radius: 50%;
          background: radial-gradient(circle, rgba(20, 120, 241, 0.12) 0%, transparent 70%);
        }
        .ai-orb-ring {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(20, 120, 241, 0.1);
          animation: ringExpand 4s ease-out infinite;
        }
        .ai-orb-ring-1 { width: 100px; height: 100px; animation-delay: 0s; }
        .ai-orb-ring-2 { width: 180px; height: 180px; animation-delay: 1.3s; }
        .ai-orb-ring-3 { width: 260px; height: 260px; animation-delay: 2.6s; }

        .ai-hint {
          font-size: 0.8rem; color: #64748b; font-weight: 500;
          margin-top: 12px; text-align: center;
          transition: opacity 0.4s ease;
          animation: hintFade 0.6s ease both;
          min-height: 1.2em;
          user-select: none;
        }

        .ai-img-tag {
          position: absolute; bottom: 12px; left: 12px;
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 11px 5px 8px;
          background: linear-gradient(135deg, rgba(20, 120, 241, 0.85) 0%, rgba(59, 130, 246, 0.85) 100%);
          backdrop-filter: blur(10px);
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.3);
          font-size: 0.7rem; font-weight: 700; color: #fff;
          letter-spacing: 0.03em;
          animation: aiTagSlide 0.6s cubic-bezier(0.16,1,0.3,1) 1s both;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(20, 120, 241, 0.25);
        }

        .cat-ai-header {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; margin-bottom: 10px;
          background: linear-gradient(135deg, rgba(20, 120, 241, 0.08), rgba(59, 130, 246, 0.08));
          border-radius: 12px;
          border: 1px solid rgba(20, 120, 241, 0.1);
          font-size: 0.78rem; font-weight: 600; color: #1478f1;
        }

        @media (max-width: 992px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .hero-sec { padding: 7rem 0 3rem; zoom: 1; }
          .hero-img-col { display:none !important; }
          .hero-wrap { justify-content: center; min-height: auto; }
          
          .sbar {
            flex-direction:column !important;
            border-radius: 20px !important; 
            padding: 10px !important; height: auto !important;
            max-width: 95% !important;
          }
          .sfield, .cat-trigger {
            width:100% !important; 
            padding: 15px 20px !important; 
            height: 56px !important;
            justify-content: flex-start !important;
            border-radius: 0 !important;
          }
          .cat-wrap { width: 100% !important; flex: none !important; }
          .sdiv { display: none !important; }
          .sbtn { 
            width:100% !important; 
            justify-content:center !important; 
            margin-top: 10px !important; 
            height: 46px !important; 
            border-radius: 14px !important;
            font-size: 0.95rem !important;
          }
          .cat-grid { grid-template-columns: 1fr; }
          .ai-orb { display: none; }
        }
      `}</style>

            <section className="hero-sec">
                <div className="hero-wrap">

                    {/* ── LEFT images ── */}
                    <div className="img-wrap hero-img-col d-none d-lg-flex" style={{ paddingRight: 40 }}>
                        <div className="hcol">
                            {LEFT_IMGS.slice(0, 2).map((src, i) => (
                                <HeroImg key={`l1-${i}`} src={src} delay={`${i * 0.15}s`} tall={i === 1} />
                            ))}
                        </div>
                        <div className="hcol shift">
                            {LEFT_IMGS.slice(2, 4).map((src, i) => (
                                <HeroImg key={`l2-${i}`} src={src} delay={`${0.2 + i * 0.15}s`} tall={i === 0} />
                            ))}
                        </div>
                    </div>

                    {/* ── CENTER ── */}
                    <div className="text-center hero-center" style={{ zIndex: 2, flex: 1, minWidth: 0, padding: '0 20px', position: 'relative' }}>

                        {/* Geometric decoration behind content */}
                        <GeometryOrb />

                        {/* Heritage verification badge */}
                        <HeritageBadge />

                        <AnimatedTitle />

                        <p className="ha-sub" style={{
                            fontSize: '1rem', color: '#475569', lineHeight: 1.6,
                            maxWidth: 600, margin: '0 auto 2.5rem', fontWeight: 500
                        }}>
                            Discover authentic Moroccan artisans preserving traditional craftsmanship. <br className="d-none d-md-block"/>
                            Verified masters and heritage creators worldwide.
                        </p>

                        <div className="ha-form">
                            <form action="/explore" method="post">
                                <div className="sbar">

                                    <div className="sfield" onClick={() => document.getElementById('hero-search').focus()}>
                                        <Search size={20} color="#94a3b8" strokeWidth={2} style={{ flexShrink: 0 }} />
                                        <input type="text" id="hero-search" placeholder="Search crafts, artisans..." />
                                    </div>

                                    <div className="sdiv" />

                                    <div className="sfield" onClick={() => document.getElementById('hero-loc').focus()}>
                                        <MapPin size={20} color="#94a3b8" strokeWidth={2} style={{ flexShrink: 0 }} />
                                        <input type="text" id="hero-loc" placeholder="Morocco, Global..." />
                                    </div>

                                    <div className="sdiv" />

                                    <CategoryDropdown
                                        selectedCategory={selectedCategory}
                                        setSelectedCategory={setSelectedCategory}
                                        dropdownOpen={dropdownOpen}
                                        setDropdownOpen={setDropdownOpen}
                                    />

                                    <button type="submit" className="sbtn">
                                        <Search size={22} color="#fff" strokeWidth={2.5} />
                                        <span>Explore</span>
                                    </button>

                                </div>
                            </form>

                            {/* Smart discovery suggestions */}
                            <DiscoveryHint />
                        </div>
                    </div>

                    {/* ── RIGHT images ── */}
                    <div className="img-wrap hero-img-col d-none d-lg-flex" style={{ paddingLeft: 40 }}>
                        <div className="hcol">
                            {RIGHT_IMGS.slice(0, 2).map((src, i) => (
                                <HeroImg key={`r1-${i}`} src={src} delay={`${0.1 + i * 0.15}s`} tall={i === 0} />
                            ))}
                        </div>
                        <div className="hcol shift">
                            {RIGHT_IMGS.slice(2, 4).map((src, i) => (
                                <HeroImg key={`r2-${i}`} src={src} delay={`${0.3 + i * 0.15}s`} tall={i === 1} />
                            ))}
                        </div>
                    </div>

                </div>
            </section>
            <CategorieExplore />
            <CitiesExplore />
        </>
    )
}