"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    User, Mail, Shield, Hash, Heart, Activity, Settings,
    Edit3, LogOut, Star, MapPin, CheckCircle, FileText,
    Bell, AtSign, Locate, Globe, Moon, MessageCircle,
    RefreshCw, Package, AlertCircle, ImageOff, Phone, Calendar,
} from "lucide-react";
import styles from "./profile.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/* ─── API ─────────────────────────────────────────────────────── */
async function apiFetch(path, options = {}) {
    const res = await fetch(path, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
}

/* ─── Helpers ─────────────────────────────────────────────────── */
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

/* ─── Activity meta ───────────────────────────────────────────── */
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

/* ─── Avatar ──────────────────────────────────────────────────── */
function Avatar({ name, image, size = 64 }) {
    const [err, setErr] = useState(false);
    const st = { width: size, height: size, fontSize: size * 0.35 };
    if (image && !err)
        return <img src={image} alt={name} className={styles.avatar} style={st} onError={() => setErr(true)} />;
    return <div className={styles.avatarFallback} style={st}>{initials(name)}</div>;
}

/* ─── Toggle ──────────────────────────────────────────────────── */
function Toggle({ on, onChange }) {
    return (
        <button type="button" role="switch" aria-checked={on}
                className={`${styles.toggle} ${on ? styles.toggleOn : ""}`}
                onClick={e => { e.stopPropagation(); onChange(!on); }}>
            <span className={styles.toggleThumb} />
        </button>
    );
}

/* ─── Skeleton ────────────────────────────────────────────────── */
function Sk({ w, h, r = 6, style = {} }) {
    return <div className={styles.sk} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

function SkFavGrid() {
    return (
        <div className={styles.favGrid}>
            {[0,1,2,3,4,5].map(i => (
                <div key={i} className={styles.favCard}>
                    <Sk h={140} r={0} style={{ width: "100%" }} />
                    <div className={styles.favInfo}>
                        <Sk w="70%" h={11} /><Sk w="45%" h={9} /><Sk w="35%" h={11} />
                    </div>
                </div>
            ))}
        </div>
    );
}
function SkFeed() {
    return (
        <div className={styles.feed}>
            {[0,1,2,3,4].map(i => (
                <div key={i} className={styles.feedRow}>
                    <Sk w={36} h={36} r={9} style={{ flexShrink: 0 }} />
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                        <Sk w="50%" h={11} /><Sk w="70%" h={9} />
                    </div>
                    <Sk w={40} h={9} />
                </div>
            ))}
        </div>
    );
}
function SkSettings() {
    return (
        <div className={styles.settingsList}>
            {[0,1,2,3,4,5].map(i => (
                <div key={i} className={styles.settingRow} style={{ pointerEvents:"none" }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                        <Sk w={34} h={34} r={8} />
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                            <Sk w={110} h={11} /><Sk w={80} h={9} />
                        </div>
                    </div>
                    <Sk w={38} h={20} r={100} />
                </div>
            ))}
        </div>
    );
}

/* ─── Error & Empty ───────────────────────────────────────────── */
function Err({ msg }) {
    return (
        <div className={styles.errBanner}>
            <AlertCircle size={13} />{msg || "Une erreur est survenue."}
        </div>
    );
}
function Empty({ Icon: I, title, body, cta, href }) {
    return (
        <div className={styles.empty}>
            <div className={styles.emptyIcon}><I size={20} /></div>
            <p className={styles.emptyTitle}>{title}</p>
            <p className={styles.emptyBody}>{body}</p>
            {cta && <a href={href} className={styles.emptyBtn}>{cta}</a>}
        </div>
    );
}

/* ─── Fav card ────────────────────────────────────────────────── */
function FavCard({ item, onRemove }) {
    const [busy, setBusy] = useState(false);
    async function remove(e) {
        e.stopPropagation(); setBusy(true);
        try { await apiFetch(`/api/favorites/${item._id}`, { method: "DELETE" }); onRemove(item._id); }
        catch { setBusy(false); }
    }
    return (
        <div className={styles.favCard} style={{ opacity: busy ? 0.5 : 1 }}>
            <div className={styles.favImg}>
                {item.thumbnail
                    ? <img src={item.thumbnail} alt={item.title} loading="lazy" />
                    : <div className={styles.favImgPh}><ImageOff size={18} /></div>}
                <button className={styles.favRemoveBtn} onClick={remove} disabled={busy} aria-label="Retirer">
                    <Heart size={11} fill="#ef4444" color="#ef4444" />
                </button>
            </div>
            <div className={styles.favInfo}>
                <span className={styles.favName}>{item.title}</span>
                <span className={styles.favCat}>{item.category}</span>
                <div className={styles.favMeta}>
                    <span className={styles.favPrice}>{item.price}</span>
                    {item.rating != null && (
                        <span className={styles.favRating}>
              <Star size={9} fill="#f59e0b" color="#f59e0b" />
                            {Number(item.rating).toFixed(1)}
            </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function FavsPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoad] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        apiFetch("/api/favorites")
            .then(d => setItems(d.favorites || []))
            .catch(e => setError(e.message))
            .finally(() => setLoad(false));
    }, []);
    if (loading) return <SkFavGrid />;
    if (error)   return <Err msg={error} />;
    if (!items.length) return <Empty Icon={Heart} title="Aucun favori" body="Explorez nos artisans et sauvegardez vos prestataires préférés." cta="Explorer les artisans" href="/artisans" />;
    return (
        <div className={styles.favGrid}>
            {items.map(it => (
                <FavCard key={it._id} item={it} onRemove={id => setItems(p => p.filter(x => x._id !== id))} />
            ))}
        </div>
    );
}

/* ─── Activity panel ──────────────────────────────────────────── */
function ActivityPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoad] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage]   = useState(1);
    const [more, setMore]   = useState(false);

    const load = useCallback(async (p = 1) => {
        try {
            const d = await apiFetch(`/api/activity?page=${p}&limit=12`);
            setItems(prev => p === 1 ? d.activities || [] : [...prev, ...(d.activities || [])]);
            setMore(d.hasMore ?? false); setPage(p);
        } catch(e) { setError(e.message); }
        finally { setLoad(false); }
    }, []);
    useEffect(() => { load(1); }, [load]);

    if (loading) return <SkFeed />;
    if (error)   return <Err msg={error} />;
    if (!items.length) return <Empty Icon={Activity} title="Aucune activité" body="Vos actions sur Bricole.ma apparaîtront ici." />;

    return (
        <>
            <div className={styles.feed}>
                {items.map((a, i) => {
                    const { Icon, color, label } = ACT[a.type] ?? ACT.default;
                    return (
                        <div key={a._id} className={styles.feedRow} style={{ animationDelay: `${i * 35}ms` }}>
                            <div className={`${styles.feedIco} ${styles[`c_${color}`]}`}><Icon size={14} /></div>
                            <div className={styles.feedBody}>
                                <span className={styles.feedTitle}>{a.title || label}</span>
                                <span className={styles.feedDesc}>{a.description}</span>
                            </div>
                            <span className={styles.feedTime}>{timeAgo(a.createdAt)}</span>
                        </div>
                    );
                })}
            </div>
            {more && (
                <button className={styles.loadMoreBtn} onClick={() => load(page + 1)}>
                    <RefreshCw size={12} /> Charger plus
                </button>
            )}
        </>
    );
}

/* ─── Settings panel ──────────────────────────────────────────── */
const SETTINGS_DEF = [
    { key: "pushNotifications", Icon: Bell,          name: "Notifications push",    hint: "Alertes en temps réel" },
    { key: "emailMarketing",    Icon: AtSign,         name: "E-mails promotionnels", hint: "Offres et actualités" },
    { key: "shareLocation",     Icon: Locate,         name: "Géolocalisation",       hint: "Artisans à proximité" },
    { key: "publicProfile",     Icon: Globe,          name: "Profil public",         hint: "Visible par les artisans" },
    { key: "darkMode",          Icon: Moon,           name: "Mode sombre",           hint: "Bascule le thème" },
    { key: "instantMessages",   Icon: MessageCircle,  name: "Messages instantanés",  hint: "Chat en direct" },
];

function SettingsPanel() {
    const [cfg, setCfg]       = useState(null);
    const [loading, setLoad]  = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);
    const timer               = useRef(null);

    useEffect(() => {
        apiFetch("/api/profile/settings")
            .then(d => setCfg(d.settings || {}))
            .catch(e => setError(e.message))
            .finally(() => setLoad(false));
    }, []);

    const toggle = useCallback((key, val) => {
        setCfg(p => ({ ...p, [key]: val }));
        clearTimeout(timer.current); setSaving(true);
        timer.current = setTimeout(async () => {
            try { await apiFetch("/api/profile/settings", { method: "PATCH", body: JSON.stringify({ [key]: val }) }); }
            catch(e) { setError(e.message); }
            finally { setSaving(false); }
        }, 600);
    }, []);

    if (loading) return <SkSettings />;
    if (error)   return <Err msg={error} />;

    return (
        <>
            {saving && (
                <div className={styles.savingRow}>
                    <RefreshCw size={11} className={styles.spin} /> Enregistrement…
                </div>
            )}
            <div className={styles.settingsList}>
                {SETTINGS_DEF.map(({ key, Icon, name, hint }) => (
                    <div key={key} className={styles.settingRow} onClick={() => toggle(key, !cfg[key])}>
                        <div className={styles.settingLeft}>
                            <div className={styles.settingIco}><Icon size={13} /></div>
                            <div>
                                <div className={styles.settingName}>{name}</div>
                                <div className={styles.settingHint}>{hint}</div>
                            </div>
                        </div>
                        <Toggle on={!!cfg[key]} onChange={v => toggle(key, v)} />
                    </div>
                ))}
            </div>
        </>
    );
}

/* ─── Main Page ───────────────────────────────────────────────── */
const TABS = [
    { key: "favorites", Icon: Heart,    label: "Favoris" },
    { key: "activity",  Icon: Activity, label: "Activité" },
    { key: "settings",  Icon: Settings, label: "Paramètres" },
];

export default function ProfilePage() {
    const [user, setUser]           = useState(null);
    const [stats, setStats]         = useState(null);
    const [loading, setLoad]        = useState(true);
    const [error, setError]         = useState(null);
    const [tab, setTab]             = useState("favorites");
    const [synced, setSynced]       = useState(false);
    const { data: session }         = useSession();
    const router                    = useRouter();

    // 1) Si on vient de Google: synchronise la session NextAuth -> Redis + cookie auth_token
    useEffect(() => {
        (async () => {
            if (synced) return;
            const bricoleToken = session?.user?.bricoleToken;
            if (!bricoleToken) {
                setSynced(true);
                return;
            }
            try {
                const res = await fetch("/api/auth/google-sync", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${bricoleToken}`,
                    },
                    credentials: "include",
                });
                if (!res.ok) {
                    console.error("google-sync failed", await res.text());
                }
            } catch (e) {
                console.error("google-sync error", e);
            } finally {
                setSynced(true);
            }
        })();
    }, [session, synced]);

    // 2) Une fois synchronisé (ou utilisateur déjà connecté via /api/login) : charger profil + stats
    useEffect(() => {
        if (!synced) return;
        Promise.all([apiFetch("/api/profile"), apiFetch("/api/profile/stats")])
            .then(([p, s]) => {
                if (!p.success) throw new Error("Profil introuvable.");
                setUser(p.user); setStats(s.stats);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoad(false));
    }, [synced]);

    if (loading) return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroBody}>
                    <Sk w={64} h={64} r={100} />
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                        <Sk w={180} h={18} /><Sk w={130} h={12} />
                    </div>
                </div>
            </div>
        </div>
    );

    if (error || !user) return (
        <div className={styles.page}>
            <div className={styles.centerFill}>
                <Empty Icon={AlertCircle} title={error || "Session expirée"} body="Veuillez vous reconnecter." cta="Se connecter" href="/login" />
            </div>
        </div>
    );

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        : null;

    const statCells = [
        { value: stats?.requests  ?? "—", label: "Demandes" },
        { value: stats?.favorites ?? "—", label: "Favoris" },
        { value: stats?.completed ?? "—", label: "Travaux" },
        { value: stats?.avgRating != null ? Number(stats.avgRating).toFixed(1) : "—", label: "Note moy." },
    ];

    return (
        <div className={styles.page}>

            {/* ── HERO – full light ── */}
            <div className={`${styles.hero} mt-14`}>
                <div className={styles.heroBody}>

                    {/* Avatar */}
                    <div className={styles.avatarWrap}>
                        <Avatar name={user.name} image={user.profileImage} size={64}/>
                        <span className={styles.onlineDot}/>
                    </div>

                    {/* Identity */}
                    <div className={styles.heroMeta}>
                        <span className={styles.roleChip}><Shield size={9}/>{roleFR(user.role)}</span>
                        <h1 className={styles.heroName}>{user.name}</h1>
                        <p className={styles.heroEmail}><Mail size={11}/>{user.email}</p>
                    </div>

                    {/* Actions */}
                    <div className={styles.heroActions}>
                        <button className={styles.btnPrimary} onClick={() => window.location.href = "/profile/edit"}>
                            <Edit3 size={13}/> Modifier le profil
                        </button>
                        <button className={styles.btnOutline} onClick={async () => {
                            await apiFetch("/api/auth/logout", {method: "POST"});
                            window.location.href = "/login";
                        }}>
                            <LogOut size={13}/> Déconnexion
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <div className={styles.statsStrip}>
                    {statCells.map(s => (
                        <div key={s.label} className={styles.statCell}>
                            <span className={styles.statVal}>{s.value}</span>
                            <span className={styles.statLbl}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── BODY ── */}
            <div className={styles.body}>

                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sideCard}>
                        <p className={styles.sideTitle}>Informations</p>

                        <div className={styles.infoList}>
                            {[
                                { Icon: User,     label: "Nom complet",    value: user.name },
                                { Icon: Mail,     label: "E-mail",         value: user.email },
                                { Icon: Shield,   label: "Rôle",           value: roleFR(user.role) },
                                ...(user.phone    ? [{ Icon: Phone,    label: "Téléphone",     value: user.phone }]    : []),
                                ...(user.city     ? [{ Icon: MapPin,   label: "Ville",         value: user.city }]     : []),
                                ...(memberSince   ? [{ Icon: Calendar, label: "Membre depuis", value: memberSince }]   : []),
                                { Icon: Hash,     label: "Identifiant",    value: user.userId, mono: true },
                            ].map(({ Icon, label, value, mono }) => (
                                <div key={label} className={styles.infoRow}>
                                    <div className={styles.infoIco}><Icon size={12} /></div>
                                    <div className={styles.infoBody}>
                                        <span className={styles.infoLabel}>{label}</span>
                                        <span className={`${styles.infoValue} ${mono ? styles.mono : ""}`}>{value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <main className={styles.main}>

                    {/* Tab bar */}
                    <div className={styles.tabBar}>
                        {TABS.map(({ key, Icon, label }) => (
                            <button key={key}
                                    className={`${styles.tabBtn} ${tab === key ? styles.tabActive : ""}`}
                                    onClick={() => setTab(key)}>
                                <Icon size={13} />{label}
                            </button>
                        ))}
                    </div>

                    {/* Panel card */}
                    <div className={styles.panel}>
                        {tab === "favorites" && <FavsPanel />}
                        {tab === "activity"  && <ActivityPanel />}
                        {tab === "settings"  && <SettingsPanel />}
                    </div>

                </main>
            </div>
        </div>
    );
}