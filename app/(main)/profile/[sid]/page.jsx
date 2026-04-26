"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import {
    User, Mail, Shield, Hash, Heart, Activity, Settings,
    Edit3, LogOut, Star, MapPin, CheckCircle, FileText,
    Bell, AtSign, Globe, Moon, MessageCircle, Phone, Calendar,
    Package, AlertCircle, RefreshCw, ChevronRight, ImageOff,
    Check,
} from "lucide-react";
import styles from "../profile.module.css";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";
import api, { getData as apiFetch } from "@/lib/api";
import FavoriteButton from "@/components/FavoriteButton";

/* ─── Helpers ──────────────────────────────────────────────────── */
function initials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}
function roleFR(r) {
    return { CLIENT: "Client", ARTISAN: "Artisan", ADMIN: "Administrateur" }[r] ?? r;
}
function timeAgo(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1)  return "À l'instant";
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const j = Math.floor(h / 24);
    if (j < 7)  return `${j}j`;
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/* ─── Activity meta ─────────────────────────────────────────────── */
const ACT = {
    quote_sent:     { Icon: FileText,      color: "blue",   label: "Devis envoyé" },
    review_left:    { Icon: Star,          color: "amber",  label: "Avis laissé" },
    work_completed: { Icon: CheckCircle,   color: "green",  label: "Travaux terminés" },
    favorite_added: { Icon: Heart,         color: "rose",   label: "Favori ajouté" },
    quote_received: { Icon: Package,       color: "violet", label: "Devis reçu" },
    message:        { Icon: MessageCircle, color: "blue",   label: "Message" },
    booking:        { Icon: Calendar,      color: "green",  label: "Réservation" },
    default:        { Icon: Activity,      color: "blue",   label: "Activité" },
};

/* ─── Avatar ───────────────────────────────────────────────────── */
function Avatar({ name, image, size = 88 }) {
    const [err, setErr] = useState(false);
    const st = { width: size, height: size, fontSize: size * 0.35 };
    if (image && !err)
        return <img src={image} alt={name} className={styles.avatar} style={st} referrerPolicy="no-referrer" onError={() => setErr(true)} />;
    return <div className={styles.avatarFallback} style={st}>{initials(name)}</div>;
}

/* ─── Toggle ───────────────────────────────────────────────────── */
function Toggle({ on, onChange }) {
    return (
        <button type="button" role="switch" aria-checked={on}
                className={`${styles.toggle} ${on ? styles.toggleOn : ""}`}
                onClick={e => { e.stopPropagation(); onChange(!on); }}>
            <span className={styles.toggleThumb} />
        </button>
    );
}

/* ─── Skeleton ─────────────────────────────────────────────────── */
function Sk({ w, h, r = 6, style = {} }) {
    return <div className={styles.sk} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

function SkFavGrid() {
    return (
        <div className={styles.favGrid}>
            {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={styles.favCard} style={{ animationDelay: `${i * 60}ms` }}>
                    <Sk h={140} r={0} style={{ width: "100%" }} />
                    <div className={styles.favInfo}>
                        <Sk w="70%" h={12} /><Sk w="45%" h={10} style={{ marginTop: 4 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Error & Empty ─────────────────────────────────────────────── */
function Err({ msg }) {
    return (
        <div className={styles.errBanner}>
            <AlertCircle size={15} />{msg || "Une erreur est survenue."}
        </div>
    );
}
function Empty({ Icon: I, title, body, cta, href }) {
    return (
        <div className={styles.empty}>
            <div className={styles.emptyIconWrap}><I size={24} /></div>
            <h3 className={styles.emptyTitle}>{title}</h3>
            <p className={styles.emptyBody}>{body}</p>
            {cta && <a href={href} className={styles.emptyBtn}>{cta}</a>}
        </div>
    );
}

/* ─── FavsPanel ─────────────────────────────────────────────────── */
function FavsPanel() {
    const [favs, setFavs]     = useState(null);
    const [loading, setLoad]  = useState(true);
    const [error, setError]   = useState(null);

    const loadFavs = useCallback(() => {
        fetch("/api/favorites")
            .then(res => res.json())
            .then(d => {
                if (d.success) setFavs(d.favorites);
                else throw new Error(d.error || "Erreur chargement");
            })
            .catch(e => setError(e.message))
            .finally(() => setLoad(false));
    }, []);

    useEffect(() => {
        loadFavs();
    }, [loadFavs]);

    if (loading) return <SkFavGrid />;
    if (error)   return <Err msg={error} />;
    if (!favs?.length)
        return <Empty Icon={Heart} title="Aucun favori" body="Explorez et sauvegardez les services qui vous plaisent." cta="Découvrir" href="/explore" />;

    return (
        <div className={styles.favGrid}>
            {favs.map((f, i) => {
                const p = f.productId;
                if (!p) return null;
                const img = p.images?.[0] || p.imageUrl || null;
                
                return (
                    <div key={f._id} className={styles.favCard} style={{ animationDelay: `${i * 40}ms`, position: 'relative' }}>
                        <Link href={`/explore/details/${p._id || p.id}`} style={{ textDecoration: "none", color: "inherit", display: 'block' }}>
                            {img
                                ? <img src={img} alt={p.titre} style={{ width: "100%", height: 140, objectFit: "cover" }} referrerPolicy="no-referrer" />
                                : <div style={{ width: "100%", height: 140, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ImageOff size={22} color="var(--ink-400)" />
                                </div>
                            }
                            <div className={styles.favInfo}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)", display: 'block', marginBottom: 2 }}>{p.titre}</span>
                                <span style={{ fontSize: 11, color: "var(--ink-400)", fontWeight: 600 }}>{p.prix} DH</span>
                                {p.city && <span style={{ fontSize: 11, color: "var(--ink-400)", display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                                    <MapPin size={10} />{p.city}
                                </span>}
                            </div>
                        </Link>
                        <FavoriteButton 
                            productId={p._id || p.id} 
                            className="profile-fav-btn"
                            style={{ position: 'absolute', top: 8, right: 8, zIndex: 5, width: 30, height: 30 }}
                        />
                    </div>
                );
            })}
        </div>
    );
}

/* ─── ActivityPanel ─────────────────────────────────────────────── */
function ActivityPanel() {
    const [acts, setActs]     = useState(null);
    const [loading, setLoad]  = useState(true);
    const [error, setError]   = useState(null);

    useEffect(() => {
        apiFetch("/profile/activity")
            .then(d => setActs(d.activities ?? []))
            .catch(e => setError(e.message))
            .finally(() => setLoad(false));
    }, []);

    if (loading) return (
        <div className={styles.activityList}>
            {[0,1,2,3,4].map(i => (
                <div key={i} style={{ display:"flex",gap:12,alignItems:"center",padding:"12px 4px" }}>
                    <Sk w={34} h={34} r={10} />
                    <div style={{ flex:1,display:"flex",flexDirection:"column",gap:5 }}>
                        <Sk w="55%" h={12} /><Sk w="35%" h={10} />
                    </div>
                    <Sk w={40} h={10} />
                </div>
            ))}
        </div>
    );
    if (error)   return <Err msg={error} />;
    if (!acts?.length)
        return <Empty Icon={Activity} title="Aucune activité" body="Vos actions apparaîtront ici au fur et à mesure." />;

    return (
        <div className={styles.activityList}>
            {acts.map((a, i) => {
                const meta = ACT[a.type] ?? ACT.default;
                const { Icon, color, label } = meta;
                return (
                    <div key={a.id ?? i} className={styles.activityItem}>
                        <div className={`${styles.activityIco} ${styles[color]}`}>
                            <Icon size={15} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-700)" }}>
                                {a.title ?? label}
                            </div>
                            {a.description && (
                                <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {a.description}
                                </div>
                            )}
                        </div>
                        <span
                            style={{
                                fontSize: 11,
                                color: "var(--ink-400)",
                                whiteSpace: "nowrap",
                                flexShrink: 0
                            }}
                        >
  {timeAgo(a.createdAt)}
</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── SettingsPanel ─────────────────────────────────────────────── */
function SettingsPanel({ user, onUpdate }) {
    const [notifs, setNotifs]   = useState({ email: true, push: false, sms: false });
    const [privacy, setPrivacy] = useState({ showProfile: true, showActivity: false });
    const [profile, setProfile] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        city: user?.city || ""
    });
    const [saving, setSaving]   = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const res = await api.put("/profile/settings", { 
                notifs, 
                privacy,
                ...profile
            });
            if (res.success) {
                if (onUpdate) onUpdate(res.user);
                alert("Votre profil a été mis à jour avec succès !");
            }
        } catch (e) { 
            console.error(e);
            alert("Erreur lors de la mise à jour du profil.");
        }
        finally { setSaving(false); }
    };

    const notifRows = [
        { Icon: Mail,  key: "email", label: "Notifications e-mail", desc: "Recevez les devis et messages par e-mail" },
        { Icon: Bell,  key: "push",  label: "Notifications push",   desc: "Alertes en temps réel dans l'application" },
        { Icon: Phone, key: "sms",   label: "SMS",                  desc: "Rappels importants par SMS" },
    ];
    const privacyRows = [
        { Icon: Globe, key: "showProfile",  label: "Profil visible",        desc: "Les artisans peuvent voir votre profil" },
        { Icon: Activity, key: "showActivity", label: "Activité publique",  desc: "Montrer votre dernière activité" },
    ];

    return (
        <div className={styles.settingsPanel}>
            {/* Informations personnelles */}
            <p className={styles.settingGroupTitle}>Informations du profil</p>
            <div className={styles.settingGroup} style={{ padding: '24px', borderBottom: 'none' }}>
                <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className={styles.inputGroup}>
                        <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--ink-400)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Nom complet</label>
                        <input 
                            type="text" 
                            value={profile.name} 
                            onChange={e => setProfile({...profile, name: e.target.value})}
                            placeholder="Ex: Mohammed El Amrani"
                            style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid var(--border-strong)', fontSize:14, background:'var(--surface-2)', transition:'all 0.2s' }}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--ink-400)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Téléphone</label>
                        <input 
                            type="text" 
                            value={profile.phone} 
                            onChange={e => setProfile({...profile, phone: e.target.value})}
                            placeholder="Ex: 0612345678"
                            style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid var(--border-strong)', fontSize:14, background:'var(--surface-2)', transition:'all 0.2s' }}
                        />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--ink-400)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Ville de résidence</label>
                    <input 
                        type="text" 
                        value={profile.city} 
                        onChange={e => setProfile({...profile, city: e.target.value})}
                        placeholder="Ex: Casablanca"
                        style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1px solid var(--border-strong)', fontSize:14, background:'var(--surface-2)', transition:'all 0.2s' }}
                    />
                </div>
            </div>

            {/* Notifications */}
            <p className={styles.settingGroupTitle} style={{ marginTop: 24 }}>Préférences & Sécurité</p>
            <div className={styles.settingGroup}>
                {notifRows.map(({ Icon, key, label, desc }) => (
                    <div key={key} className={styles.settingRow} onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}>
                        <div className={styles.settingIco} style={{ background: 'var(--surface-3)', color: 'var(--ink-500)' }}><Icon size={15} /></div>
                        <div className={styles.settingBody}>
                            <div className={styles.settingLabel} style={{ fontWeight: 600 }}>{label}</div>
                            <div className={styles.settingDesc}>{desc}</div>
                        </div>
                        <Toggle on={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
                    </div>
                ))}
                {privacyRows.map(({ Icon, key, label, desc }) => (
                    <div key={key} className={styles.settingRow} onClick={() => setPrivacy(p => ({ ...p, [key]: !p[key] }))}>
                        <div className={styles.settingIco} style={{ background: 'var(--surface-3)', color: 'var(--ink-500)' }}><Icon size={15} /></div>
                        <div className={styles.settingBody}>
                            <div className={styles.settingLabel} style={{ fontWeight: 600 }}>{label}</div>
                            <div className={styles.settingDesc}>{desc}</div>
                        </div>
                        <Toggle on={privacy[key]} onChange={v => setPrivacy(p => ({ ...p, [key]: v }))} />
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                <button
                    onClick={save}
                    disabled={saving}
                    className={styles.btnPrimary}
                    style={{ opacity: saving ? 0.7 : 1, padding: '12px 28px', borderRadius: '12px', fontSize: '14px' }}
                >
                    {saving ? <RefreshCw size={14} className={styles.spin} /> : <Check size={14} />}
                    {saving ? "Enregistrement…" : "Enregistrer les modifications"}
                </button>
            </div>
        </div>
    );
}

/* ─── TABS config ────────────────────────────────────────────────── */
const TABS = [
    { key: "favorites", Icon: Heart,    label: "Favoris" },
    { key: "activity",  Icon: Activity, label: "Activité" },
    { key: "settings",  Icon: Settings, label: "Paramètres" },
];

/* ─── Inner Page ─────────────────────────────────────────────────── */
function ProfileInner() {
    const [user, setUser]    = useState(null);
    const [stats, setStats]  = useState(null);
    const [loading, setLoad] = useState(true);
    const [error, setError]  = useState(null);
    const [tab, setTab]      = useState("favorites");
    const [synced, setSynced] = useState(false);
    const { data: session, status }  = useSession();
    const { logout }         = useLogout();
    const router             = useRouter();
    const searchParams       = useSearchParams();

    // Set initial tab from URL if present
    useEffect(() => {
        const t = searchParams.get("tab");
        if (t && TABS.some(x => x.key === t)) {
            setTab(t);
        }
    }, [searchParams]);

    /* Google sync */
    useEffect(() => {
        (async () => {
            if (status === "loading" || synced) return;
            if (status === "unauthenticated") { setSynced(true); return; }
            const bricoleToken = session?.user?.bricoleToken;
            if (!bricoleToken) { setSynced(true); return; }
            try {
                await fetch("/api/auth/google-sync", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${bricoleToken}` },
                    credentials: "include",
                });
            } catch (e) { console.error("google-sync error", e); }
            finally { setSynced(true); }
        })();
    }, [session, status, synced]);

    const loadData = useCallback(() => {
        Promise.all([apiFetch("/profile"), apiFetch("/profile/stats")])
            .then(([p, s]) => {
                if (!p.success) throw new Error("Profil introuvable.");
                setUser(p.user); setStats(s.stats);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoad(false));
    }, []);

    useEffect(() => {
        if (synced && status !== "loading") loadData();
    }, [synced, status, loadData]);

    if (loading) return (
        <div className={styles.page}>
            <div className={styles.heroSkeleton}><Sk w="100%" h="100%" r={0} /></div>
        </div>
    );

    if (error || !user) return (
        <div className={styles.page}>
            <div className={styles.centerFill}>
                <Empty Icon={AlertCircle} title={error || "Session expirée"}
                       body="Veuillez vous reconnecter pour accéder à votre espace."
                       cta="Se connecter" href="/login" />
            </div>
        </div>
    );

    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : null;
    const statCells = [
        { value: stats?.requests  ?? 0, label: "Demandes" },
        { value: stats?.favorites ?? 0, label: "Favoris" },
        { value: stats?.completed ?? 0, label: "Travaux" },
        { value: stats?.avgRating != null ? Number(stats.avgRating).toFixed(1) : "—", label: "Note moy." },
    ];
    const infoRows = [
        { Icon: User,     label: "Nom complet",    value: user.name },
        { Icon: Mail,     label: "E-mail",          value: user.email },
        { Icon: Shield,   label: "Rôle",            value: roleFR(user.role) },
        ...(user.phone   ? [{ Icon: Phone,    label: "Téléphone",     value: user.phone }]   : []),
        ...(user.city    ? [{ Icon: MapPin,   label: "Ville",         value: user.city }]    : []),
        ...(memberSince  ? [{ Icon: Calendar, label: "Membre depuis", value: memberSince }]  : []),
        { Icon: Hash,     label: "Identifiant",     value: user.userId, mono: true },
    ];

    return (
        <div className={styles.page}>
            <header className={styles.heroContainer}>
                <div className={styles.heroCover}><div className={styles.heroCoverDeco} /><div className={styles.heroCoverOverlay} /></div>
                <div className={styles.heroContent}>
                    <div className={styles.heroMain}>
                        <div className={styles.avatarWrap}><Avatar name={user.name} image={user.profileImage} size={88} /><span className={styles.onlineDot} /></div>
                        <div className={styles.heroMeta}>
                            <div className={styles.roleBadge}><Shield size={10} /> {roleFR(user.role)}</div>
                            <h1 className={styles.heroName}>{user.name}</h1>
                            <p className={styles.heroEmail}><Mail size={13} /> {user.email}</p>
                        </div>
                        <div className={styles.heroActions}>
                            <button className={styles.btnPrimary} onClick={() => setTab("settings")}><Edit3 size={14} /> Modifier</button>
                            <button className={styles.btnOutline} onClick={logout}><LogOut size={14} /> Quitter</button>
                        </div>
                    </div>
                    <div className={styles.statsStrip}>{statCells.map(s => (<div key={s.label} className={styles.statCell}><span className={styles.statVal}>{s.value}</span><span className={styles.statLbl}>{s.label}</span></div>))}</div>
                </div>
            </header>
            <div className={styles.body}>
                <aside className={styles.sidebar}>
                    <div className={styles.card}><h2 className={styles.cardTitle}>À propos</h2><div className={styles.infoList}>{infoRows.map(({ Icon, label, value, mono }) => (<div key={label} className={styles.infoRow}><div className={styles.infoIco}><Icon size={15} /></div><div className={styles.infoBody}><span className={styles.infoLabel}>{label}</span><span className={`${styles.infoValue} ${mono ? styles.mono : ""}`}>{value}</span></div></div>))}</div></div>
                </aside>
                <main className={styles.main}>
                    <div className={styles.tabContainer}>{TABS.map(({ key, Icon, label }) => (<button key={key} className={`${styles.tabBtn} ${tab === key ? styles.tabActive : ""}`} onClick={() => setTab(key)}><Icon size={15} /> {label}</button>))}</div>
                    <div className={styles.cardPanel}>
                        {tab === "favorites" && <FavsPanel />}
                        {tab === "activity"  && <ActivityPanel />}
                        {tab === "settings"  && <SettingsPanel user={user} onUpdate={(u) => { setUser(u); loadData(); }} />}
                    </div>
                </main>
            </div>
            <style jsx global>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className={styles.page}><div className={styles.heroSkeleton}><Sk w="100%" h="100%" r={0} /></div></div>}>
            <ProfileInner />
        </Suspense>
    );
}
