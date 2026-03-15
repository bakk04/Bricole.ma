"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    LayoutDashboard, Package, Star, Eye, Heart, TrendingUp,
    TrendingDown, Plus, Edit2, Trash2, Pause, Play, Image,
    Search, X, Upload, CheckCircle, AlertCircle, BarChart2,
    Users, MessageSquare, Bell, LogOut, Settings, ChevronRight,
    Minus, Layers, Activity, Clock, DollarSign, Zap, Shield,
} from "lucide-react";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";

/* ─── API helper ────────────────────────────────────────────── */
async function api(path, opts = {}) {
    const res = await fetch(path, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...opts,
    });
    if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || `HTTP ${res.status}`);
    }
    return res.json();
}

/* ─── Helpers ───────────────────────────────────────────────── */
function initials(n = "") {
    return n.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}
function fmtNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(n ?? 0);
}
function fmtPrice(n) {
    return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n ?? 0);
}
function timeAgo(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}j`;
}

/* ─── Mock chart data ───────────────────────────────────────── */
const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`${styles.toast} ${type === "success" ? styles.toastSuccess : styles.toastError}`}>
            <span className={styles.toastIcon}>
                {type === "success"
                    ? <CheckCircle size={16} color="var(--sage)" />
                    : <AlertCircle size={16} color="var(--rose)" />}
            </span>
            <span className={styles.toastMsg}>{msg}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t4)", marginLeft: "auto" }}>
                <X size={13} />
            </button>
        </div>
    );
}

/* ─── Skeleton block ─────────────────────────────────────────── */
function Sk({ w, h, r = 6, style = {} }) {
    return <div className={styles.sk} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/* ─── Mini bar chart ─────────────────────────────────────────── */
function VisitsChart({ data }) {
    const max = Math.max(...data.map(d => d.v), 1);
    return (
        <div>
            <div className={styles.chartWrap}>
                <div className={styles.chartBars}>
                    {data.map((d, i) => (
                        <div key={i} className={styles.chartBarCol}>
                            <div
                                className={`${styles.chartBar} ${i === data.length - 1 ? styles.active : ""}`}
                                style={{
                                    height: `${Math.max((d.v / max) * 90, 4)}px`,
                                    animationDelay: `${i * 50}ms`,
                                }}
                                title={`${d.v} visites`}
                            />
                            <span className={styles.chartBarLabel}>{d.l}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.chartLegend}>
                <span><span className={styles.chartLegendDot} style={{ background: "var(--cobalt-l)" }} />Visites profil</span>
                <span style={{ marginLeft: "auto" }}>Semaine en cours</span>
            </div>
        </div>
    );
}

/* ─── KPI card ───────────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, sub, trend, trendVal, color, dim, fill }) {
    const isUp = trend === "up";
    const isDown = trend === "down";
    return (
        <div className={styles.kpiCard} style={{ "--kpi-color": color, "--kpi-dim": dim }}>
            <div className={styles.kpiHeader}>
                <div className={styles.kpiIconWrap}><Icon size={16} /></div>
                {trendVal !== undefined && (
                    <span className={`${styles.kpiTrend} ${isUp ? styles.kpiTrendUp : isDown ? styles.kpiTrendDown : styles.kpiTrendNeutral}`}>
                        {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : <Minus size={10} />}
                        {trendVal}
                    </span>
                )}
            </div>
            <div className={styles.kpiVal}>{value}</div>
            <div className={styles.kpiLabel}>{label}</div>
            {sub && <div className={styles.kpiSub}>{sub}</div>}
            {fill !== undefined && (
                <div className={styles.kpiBar}>
                    <div className={styles.kpiBarFill} style={{ width: `${fill}%` }} />
                </div>
            )}
        </div>
    );
}

/* ─── Confirm delete modal ───────────────────────────────────── */
function ConfirmModal({ item, onConfirm, onCancel }) {
    return (
        <div className={styles.modalOverlay} onClick={onCancel}>
            <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
                <div className={styles.confirmIcon}><Trash2 size={22} /></div>
                <div className={styles.confirmTitle}>Supprimer le service ?</div>
                <div className={styles.confirmDesc}>
                    « {item?.titre} » sera définitivement supprimé. Cette action est irréversible.
                </div>
                <div className={styles.confirmBtns}>
                    <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onCancel}>Annuler</button>
                    <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onConfirm}>Supprimer</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Product Form Modal ─────────────────────────────────────── */
function ProductModal({ product, categories, onSave, onClose }) {
    const isEdit = !!product?._id;
    const [form, setForm] = useState({
        titre: product?.titre || "",
        description: product?.description || "",
        prix: product?.prix ?? "",
        categoryId: product?.categoryId || "",
        images: product?.images || [],
    });
    const [saving, setSaving] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef();

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleFiles = (files) => {
        const urls = Array.from(files).map(f => URL.createObjectURL(f));
        set("images", [...form.images, ...urls].slice(0, 6));
    };

    const submit = async () => {
        if (!form.titre || !form.prix || !form.categoryId) return;
        setSaving(true);
        try {
            await onSave({ ...form, prix: Number(form.prix) });
        } finally { setSaving(false); }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHead}>
                    <div className={styles.modalTitle}>{isEdit ? "Modifier le service" : "Nouveau service"}</div>
                    <button className={styles.modalClose} onClick={onClose}><X size={13} /></button>
                </div>
                <div className={styles.modalBody}>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Titre du service *</label>
                        <input className={styles.formInput} value={form.titre}
                               onChange={e => set("titre", e.target.value)}
                               placeholder="Ex: Peinture intérieure premium" />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Prix (MAD) *</label>
                            <input className={styles.formInput} type="number" min="0"
                                   value={form.prix} onChange={e => set("prix", e.target.value)}
                                   placeholder="0" />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Catégorie *</label>
                            <select className={`${styles.formInput} ${styles.formSelect}`}
                                    value={form.categoryId} onChange={e => set("categoryId", e.target.value)}>
                                <option value="">Choisir...</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.nom}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Description</label>
                        <textarea className={styles.formTextarea} value={form.description}
                                  onChange={e => set("description", e.target.value)}
                                  placeholder="Décrivez votre service en détail..." />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Photos ({form.images.length}/6)</label>
                        <div
                            className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ""}`}
                            onClick={() => fileRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                        >
                            <div className={styles.uploadIcon}><Upload size={18} /></div>
                            <div className={styles.uploadLabel}>Glissez vos photos ici</div>
                            <div className={styles.uploadSub}>ou cliquez pour sélectionner • JPG, PNG, WEBP • max 5MB</div>
                            <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }}
                                   onChange={e => handleFiles(e.target.files)} />
                        </div>
                        {form.images.length > 0 && (
                            <div className={styles.imgPreviewList}>
                                {form.images.map((url, i) => (
                                    <div key={i} className={styles.imgChip}>
                                        <img src={url} alt="" />
                                        <button className={styles.imgChipDel}
                                                onClick={() => set("images", form.images.filter((_, j) => j !== i))}>
                                            <X size={8} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>Annuler</button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={submit} disabled={saving}>
                        {saving ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Publier le service"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Sidebar nav ────────────────────────────────────────────── */
const NAV = [
    { key: "overview",   Icon: LayoutDashboard, label: "Vue d'ensemble" },
    { key: "catalogue",  Icon: Package,         label: "Catalogue" },
    { key: "stats",      Icon: BarChart2,        label: "Statistiques" },
    { key: "reviews",    Icon: Star,             label: "Avis clients" },
    { key: "messages",   Icon: MessageSquare,    label: "Messages" },
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ArtisanDashboard() {
    const router = useRouter();

    /* ── State ── */
    const [navKey, setNavKey]       = useState("overview");
    const [profile, setProfile]     = useState(null);
    const [stats, setStats]         = useState(null);
    const [products, setProducts]   = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]     = useState(true);

    /* Catalogue UI */
    const [filter, setFilter]       = useState("all");  // all | active | paused
    const [search, setSearch]       = useState("");
    const [modalProduct, setModalProduct] = useState(undefined); // undefined=closed, null=new, obj=edit
    const [deleteTarget, setDeleteTarget] = useState(null);

    /* Toast */
    const [toast, setToast]         = useState(null);
    const showToast = (msg, type = "success") => setToast({ msg, type });

    /* ── Load ── */
    useEffect(() => {
        (async () => {
            try {
                const [p, s, prods, cats] = await Promise.all([
                    api("/api/artisan/profile"),
                    api("/api/artisan/stats"),
                    api("/api/artisan/products"),
                    api("/api/categories"),
                ]);
                setProfile(p.profile);
                setStats(s.stats);
                setProducts(prods.products ?? []);
                setCategories(cats.categories ?? []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ── Visit chart mock ── */
    const visitData = WEEK_DAYS.map((l, i) => ({
        l, v: stats?.visitsPerDay?.[i] ?? Math.floor(Math.random() * 60 + 10)
    }));

    /* ── Catalogue actions ── */
    const handleSave = async (formData) => {
        try {
            if (formData._id) {
                await api(`/api/artisan/products/${formData._id}`, { method: "PUT", body: JSON.stringify(formData) });
                setProducts(ps => ps.map(p => p._id === formData._id ? { ...p, ...formData } : p));
                showToast("Service mis à jour ✓");
            } else {
                const res = await api("/api/artisan/products", { method: "POST", body: JSON.stringify(formData) });
                setProducts(ps => [res.product, ...ps]);
                showToast("Service publié ✓");
            }
            setModalProduct(undefined);
        } catch (e) { showToast(e.message, "error"); }
    };

    const handleTogglePause = async (product) => {
        const newStatus = product.statut === "PAUSED" ? "ACTIVE" : "PAUSED";
        try {
            await api(`/api/artisan/products/${product._id}`, { method: "PATCH", body: JSON.stringify({ statut: newStatus }) });
            setProducts(ps => ps.map(p => p._id === product._id ? { ...p, statut: newStatus } : p));
            showToast(newStatus === "PAUSED" ? "Service mis en pause" : "Service réactivé ✓");
        } catch (e) { showToast(e.message, "error"); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api(`/api/artisan/products/${deleteTarget._id}`, { method: "DELETE" });
            setProducts(ps => ps.filter(p => p._id !== deleteTarget._id));
            showToast("Service supprimé");
            setDeleteTarget(null);
        } catch (e) { showToast(e.message, "error"); }
    };

    /* ── Filtered products ── */
    const visibleProducts = products.filter(p => {
        const matchFilter = filter === "all" || (filter === "active" && p.statut !== "PAUSED") || (filter === "paused" && p.statut === "PAUSED");
        const matchSearch = !search || p.titre.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    /* ── Top services by favs ── */
    const topServices = [...products].sort((a, b) => (b.favCount ?? 0) - (a.favCount ?? 0)).slice(0, 5);

    /* ── KPI data ── */
    const kpis = [
        {
            icon: Eye, label: "Visites profil", value: fmtNum(stats?.profileViews ?? 0),
            sub: "Cette semaine", trend: "up", trendVal: "+12%",
            color: "var(--cobalt-l)", dim: "var(--cobalt-10)", fill: 72,
        },
        {
            icon: Heart, label: "Favoris reçus", value: fmtNum(stats?.totalFavs ?? 0),
            sub: "Sur tous les services", trend: "up", trendVal: "+8%",
            color: "var(--rose)", dim: "var(--rose-dim)", fill: 58,
        },
        {
            icon: Package, label: "Services actifs", value: products.filter(p => p.statut !== "PAUSED").length,
            sub: `${products.length} au total`, trend: "neutral",
            color: "var(--sage)", dim: "var(--sage-dim)", fill: products.length ? (products.filter(p => p.statut !== "PAUSED").length / products.length) * 100 : 0,
        },
        {
            icon: Star, label: "Note moyenne", value: profile?.noteMoyenne?.toFixed(1) ?? "—",
            sub: `${stats?.reviewCount ?? 0} avis`, trend: "up", trendVal: "+0.2",
            color: "var(--gold)", dim: "var(--gold-dim)", fill: ((profile?.noteMoyenne ?? 0) / 5) * 100,
        },
    ];

    /* ── Recent activity mock ── */
    const recentActivity = [
        { Icon: Heart,   color: "var(--rose)",     bg: "var(--rose-dim)",   title: "Nouveau favori",    desc: "Votre service 'Plomberie urgence' a été ajouté aux favoris",   time: "2min" },
        { Icon: Eye,     color: "var(--cobalt-xl)", bg: "var(--cobalt-10)",  title: "Visite profil",     desc: "Un client a consulté votre profil depuis Casablanca",          time: "14min" },
        { Icon: Star,    color: "var(--gold)",      bg: "var(--gold-dim)",   title: "Nouvel avis (4★)",  desc: "Excellent travail, rapide et professionnel",                   time: "1h" },
        { Icon: Package, color: "var(--sage)",      bg: "var(--sage-dim)",   title: "Service consulté",  desc: "Votre catalogue a été parcouru 3 fois aujourd'hui",            time: "2h" },
        { Icon: Users,   color: "var(--violet)",    bg: "var(--violet-dim)", title: "Nouvelle annonce",  desc: "Une annonce correspondant à votre métier a été publiée",       time: "3h" },
    ];

    /* ── Loading skeleton ── */
    if (loading) return (
        <div className={styles.dash}>
            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarBrand}>
                        <Sk w={32} h={32} r={10} /><div><Sk w={80} h={13} style={{ marginBottom: 4 }} /><Sk w={60} h={10} /></div>
                    </div>
                </aside>
                <main className={styles.main}>
                    <div className={styles.topbar}><Sk w={200} h={18} /></div>
                    <div className={styles.content}>
                        <Sk w="100%" h={140} r={22} style={{ marginBottom: 20 }} />
                        <div className={styles.kpiGrid}>
                            {[0,1,2,3].map(i => <Sk key={i} w="100%" h={140} r={18} />)}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

    /* ── Page titles ── */
    const PAGE = {
        overview:  { title: "Vue d'ensemble",      sub: "Activité et performances de votre espace" },
        catalogue: { title: "Catalogue services",   sub: "Gérez vos services et photos" },
        stats:     { title: "Statistiques",         sub: "Analyse détaillée de votre activité" },
        reviews:   { title: "Avis clients",         sub: "Gérez votre réputation" },
        messages:  { title: "Messages",             sub: "Vos conversations" },
    };

    return (
        <div className={styles.dash}>
            <div className={styles.layout}>

                {/* ══ SIDEBAR ══ */}
                <aside className={styles.sidebar}>
                    {/* Brand */}
                    <div className={styles.sidebarBrand}>
                        <div className={styles.brandIcon}><Zap size={16} color="#fff" /></div>
                        <div>
                            <div className={styles.brandName}>Bricole</div>
                            <div className={styles.brandSub}>Espace Artisan</div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className={styles.sidebarNav}>
                        <div className={styles.navSection}>Principal</div>
                        {NAV.map(({ key, Icon, label }) => (
                            <button key={key}
                                    className={`${styles.navItem} ${navKey === key ? styles.active : ""}`}
                                    onClick={() => setNavKey(key)}>
                                <Icon size={15} /> {label}
                                {key === "messages" && stats?.unreadMessages > 0 && (
                                    <span className={styles.navBadge}>{stats.unreadMessages}</span>
                                )}
                            </button>
                        ))}

                        <div className={styles.navSection} style={{ marginTop: 12 }}>Compte</div>
                        <button className={styles.navItem} onClick={() => router.push("/profile")}>
                            <Settings size={15} /> Paramètres
                        </button>
                        <button className={styles.navItem} onClick={async () => {
                            await api("/api/auth/logout", { method: "POST" });
                            router.push("/login");
                        }}>
                            <LogOut size={15} /> Déconnexion
                        </button>
                    </nav>

                    {/* User */}
                    <div className={styles.sidebarUser}>
                        {profile?.photoProfil
                            ? <img src={profile.photoProfil} className={styles.sidebarAvatar} alt="" />
                            : <div className={styles.sidebarAvatarFallback}>{initials(profile?.nomComplet)}</div>
                        }
                        <div className={styles.sidebarUserInfo}>
                            <div className={styles.sidebarUserName}>{profile?.nomComplet ?? "Artisan"}</div>
                            <div className={styles.sidebarUserRole}>
                                {profile?.estVerifie ? "✓ Vérifié" : "Non vérifié"}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ══ MAIN ══ */}
                <main className={styles.main}>

                    {/* Topbar */}
                    <div className={styles.topbar}>
                        <div>
                            <div className={styles.topbarTitle}>{PAGE[navKey].title}</div>
                            <div className={styles.topbarSub}>{PAGE[navKey].sub}</div>
                        </div>
                        <div className={styles.topbarRight}>
                            {navKey === "catalogue" && (
                                <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                                        onClick={() => setModalProduct(null)}>
                                    <Plus size={14} /> Nouveau service
                                </button>
                            )}
                            <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                                    onClick={() => router.push("/profile")}>
                                <Settings size={13} />
                            </button>
                        </div>
                    </div>

                    {/* ── Content ── */}
                    <div className={styles.content} key={navKey}>

                        {/* ════ OVERVIEW ════ */}
                        {navKey === "overview" && (
                            <>
                                {/* Hero banner */}
                                <div className={styles.heroBanner}>
                                    <div className={styles.heroBannerInner}>
                                        <div className={styles.heroBannerLeft}>
                                            <h2>Bonjour, {profile?.nomComplet?.split(" ")[0] ?? "Artisan"} 👋</h2>
                                            <p>Voici un résumé de votre activité sur les 7 derniers jours.</p>
                                            {profile?.estVerifie && (
                                                <div className={styles.heroBannerBadge}>
                                                    <Shield size={10} /> Profil vérifié
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.heroBannerStats}>
                                            {[
                                                { val: fmtNum(stats?.weekViews ?? 0),   lbl: "Visites / semaine" },
                                                { val: fmtNum(stats?.totalFavs ?? 0),   lbl: "Total favoris" },
                                                { val: profile?.noteMoyenne?.toFixed(1) ?? "—", lbl: "Note moy." },
                                            ].map(s => (
                                                <div key={s.lbl} className={styles.heroBannerStat}>
                                                    <span className={styles.heroBannerStatVal}>{s.val}</span>
                                                    <span className={styles.heroBannerStatLbl}>{s.lbl}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* KPIs */}
                                <div className={styles.kpiGrid}>
                                    {kpis.map((k, i) => (
                                        <div key={i} style={{ animationDelay: `${i * 60}ms` }}>
                                            <KpiCard {...k} />
                                        </div>
                                    ))}
                                </div>

                                {/* Dashboard 2-col grid */}
                                <div className={styles.dashGrid}>
                                    {/* Visits chart */}
                                    <div className={styles.panel}>
                                        <div className={styles.panelHead}>
                                            <div>
                                                <div className={styles.panelTitle}>Visites du profil</div>
                                                <div className={styles.panelSub}>7 derniers jours</div>
                                            </div>
                                            <button className={styles.panelAction} onClick={() => setNavKey("stats")}>
                                                Voir tout <ChevronRight size={12} />
                                            </button>
                                        </div>
                                        <VisitsChart data={visitData} />
                                    </div>

                                    {/* Recent activity */}
                                    <div className={styles.panel}>
                                        <div className={styles.panelHead}>
                                            <div>
                                                <div className={styles.panelTitle}>Activité récente</div>
                                                <div className={styles.panelSub}>En temps réel</div>
                                            </div>
                                        </div>
                                        <div className={styles.panelBody}>
                                            <div className={styles.actList}>
                                                {recentActivity.map((a, i) => (
                                                    <div key={i} className={styles.actItem}>
                                                        <div className={styles.actIco} style={{ background: a.bg, color: a.color }}>
                                                            <a.Icon size={14} />
                                                        </div>
                                                        <div className={styles.actBody}>
                                                            <div className={styles.actTitle}>{a.title}</div>
                                                            <div className={styles.actDesc}>{a.desc}</div>
                                                        </div>
                                                        <span className={styles.actTime}>{a.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top services */}
                                <div className={styles.panel}>
                                    <div className={styles.panelHead}>
                                        <div>
                                            <div className={styles.panelTitle}>Services les plus favorisés</div>
                                            <div className={styles.panelSub}>Classement par nombre de favoris</div>
                                        </div>
                                        <button className={styles.panelAction} onClick={() => setNavKey("catalogue")}>
                                            Gérer <ChevronRight size={12} />
                                        </button>
                                    </div>
                                    <div className={styles.panelBody}>
                                        {topServices.length === 0
                                            ? <div className={styles.empty} style={{ padding: "24px" }}>
                                                <div className={styles.emptyTitle}>Aucun service</div>
                                                <div className={styles.emptyBody}>Ajoutez des services à votre catalogue pour apparaître ici.</div>
                                            </div>
                                            : topServices.map((s, i) => (
                                                <div key={s._id} className={styles.serviceRow}>
                                                    <span className={styles.serviceRank}>#{i + 1}</span>
                                                    {s.images?.[0]
                                                        ? <img src={s.images[0]} className={styles.serviceThumb} alt="" />
                                                        : <div className={styles.serviceThumb} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                            <Image size={14} color="var(--t4)" />
                                                        </div>
                                                    }
                                                    <div className={styles.serviceInfo}>
                                                        <div className={styles.serviceName}>{s.titre}</div>
                                                        <div className={styles.serviceCat}>{s.categoryId?.nom ?? "—"}</div>
                                                    </div>
                                                    <div className={styles.serviceStats}>
                                                        <div className={styles.serviceFavs}><Heart size={10} style={{ display: "inline", marginRight: 3 }} />{s.favCount ?? 0}</div>
                                                        <div className={styles.serviceViews}>{s.viewCount ?? 0} vues</div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ════ CATALOGUE ════ */}
                        {navKey === "catalogue" && (
                            <>
                                <div className={styles.catHeader}>
                                    <div className={styles.catFilters}>
                                        {[
                                            { key: "all",    label: `Tous (${products.length})` },
                                            { key: "active", label: `Actifs (${products.filter(p => p.statut !== "PAUSED").length})` },
                                            { key: "paused", label: `En pause (${products.filter(p => p.statut === "PAUSED").length})` },
                                        ].map(f => (
                                            <button key={f.key}
                                                    className={`${styles.filterPill} ${filter === f.key ? styles.active : ""}`}
                                                    onClick={() => setFilter(f.key)}>
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className={styles.searchWrap}>
                                        <Search size={13} className={styles.searchIcon} />
                                        <input className={styles.searchInput}
                                               value={search} onChange={e => setSearch(e.target.value)}
                                               placeholder="Rechercher…" />
                                    </div>
                                </div>

                                {visibleProducts.length === 0 && !search
                                    ? <div className={styles.empty}>
                                        <div className={styles.emptyIconWrap}><Package size={24} /></div>
                                        <div className={styles.emptyTitle}>Catalogue vide</div>
                                        <div className={styles.emptyBody}>Publiez votre premier service pour apparaître dans les recherches.</div>
                                        <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 12 }}
                                                onClick={() => setModalProduct(null)}>
                                            <Plus size={14} /> Ajouter un service
                                        </button>
                                    </div>
                                    : <div className={styles.catGrid}>
                                        {/* Add card */}
                                        <div className={styles.catCardAdd} onClick={() => setModalProduct(null)}>
                                            <div className={styles.catCardAddIcon}><Plus size={20} /></div>
                                            <div className={styles.catCardAddLabel}>Nouveau service</div>
                                            <div className={styles.catCardAddSub}>Ajouter des photos & un prix</div>
                                        </div>

                                        {visibleProducts.map((p, i) => (
                                            <div key={p._id}
                                                 className={`${styles.catCard} ${p.statut === "PAUSED" ? styles.paused : ""}`}
                                                 style={{ animationDelay: `${i * 40}ms` }}>

                                                <div className={styles.catCardImg}>
                                                    {p.images?.[0]
                                                        ? <img src={p.images[0]} alt={p.titre} />
                                                        : <div className={styles.catCardImgEmpty}><Image size={24} /></div>
                                                    }
                                                    {p.images?.length > 1 && (
                                                        <div className={styles.imgCountBadge}><Image size={9} />{p.images.length}</div>
                                                    )}
                                                    {(p.favCount ?? 0) > 0 && (
                                                        <div className={styles.favsBadge}><Heart size={9} />{p.favCount}</div>
                                                    )}
                                                    <div className={`${styles.statusBadge} ${p.statut === "PAUSED" ? styles.statusPaused : styles.statusActive}`}>
                                                        {p.statut === "PAUSED" ? "Pause" : "Actif"}
                                                    </div>

                                                    {/* Action overlay */}
                                                    <div className={styles.catCardActions}>
                                                        <button className={`${styles.catActionBtn} ${styles.catActionEdit}`}
                                                                onClick={e => { e.stopPropagation(); setModalProduct(p); }}
                                                                title="Modifier">
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            className={`${styles.catActionBtn} ${p.statut === "PAUSED" ? styles.catActionPlay : styles.catActionPause}`}
                                                            onClick={e => { e.stopPropagation(); handleTogglePause(p); }}
                                                            title={p.statut === "PAUSED" ? "Réactiver" : "Mettre en pause"}>
                                                            {p.statut === "PAUSED" ? <Play size={12} /> : <Pause size={12} />}
                                                        </button>
                                                        <button className={`${styles.catActionBtn} ${styles.catActionDelete}`}
                                                                onClick={e => { e.stopPropagation(); setDeleteTarget(p); }}
                                                                title="Supprimer">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className={styles.catCardBody}>
                                                    <div className={styles.catCardTitle}>{p.titre}</div>
                                                    <div className={styles.catCardCat}>{p.categoryId?.nom ?? "—"}</div>
                                                    <div className={styles.catCardFooter}>
                                                        <div>
                                                            <div className={styles.catCardPrice}>{fmtPrice(p.prix)}</div>
                                                            <div className={styles.catCardPriceSub}>Prix de départ</div>
                                                        </div>
                                                        <div className={styles.catCardMeta}>
                                                            <div className={styles.catCardMetaItem}>
                                                                <Eye size={10} />{p.viewCount ?? 0}
                                                            </div>
                                                            <div className={styles.catCardMetaItem}>
                                                                <Heart size={10} style={{ color: "var(--rose)" }} />{p.favCount ?? 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }
                            </>
                        )}

                        {/* ════ STATS ════ */}
                        {navKey === "stats" && (
                            <>
                                <div className={styles.kpiGrid}>
                                    {kpis.map((k, i) => <div key={i} style={{ animationDelay: `${i * 60}ms` }}><KpiCard {...k} /></div>)}
                                </div>
                                <div className={styles.panel} style={{ marginTop: 20 }}>
                                    <div className={styles.panelHead}>
                                        <div>
                                            <div className={styles.panelTitle}>Visites hebdomadaires</div>
                                            <div className={styles.panelSub}>Répartition par jour</div>
                                        </div>
                                    </div>
                                    <VisitsChart data={visitData} />
                                </div>
                                <div className={styles.panel} style={{ marginTop: 20 }}>
                                    <div className={styles.panelHead}>
                                        <div>
                                            <div className={styles.panelTitle}>Performance par service</div>
                                            <div className={styles.panelSub}>Vues et favoris cumulés</div>
                                        </div>
                                    </div>
                                    <div className={styles.panelBody}>
                                        {products.slice(0, 8).map(p => (
                                            <div key={p._id} className={styles.progressRow}>
                                                <div className={styles.progressLabel}>
                                                    <span>{p.titre}</span>
                                                    <span className={styles.progressVal}>{p.viewCount ?? 0} vues</span>
                                                </div>
                                                <div className={styles.progressTrack}>
                                                    <div className={styles.progressFill}
                                                         style={{ width: `${Math.min(((p.viewCount ?? 0) / Math.max(...products.map(x => x.viewCount ?? 1), 1)) * 100, 100)}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ════ REVIEWS / MESSAGES ════ */}
                        {(navKey === "reviews" || navKey === "messages") && (
                            <div className={styles.empty}>
                                <div className={styles.emptyIconWrap}>
                                    {navKey === "reviews" ? <Star size={24} /> : <MessageSquare size={24} />}
                                </div>
                                <div className={styles.emptyTitle}>
                                    {navKey === "reviews" ? "Aucun avis pour l'instant" : "Aucun message"}
                                </div>
                                <div className={styles.emptyBody}>
                                    {navKey === "reviews"
                                        ? "Vos avis clients apparaîtront ici une fois que des clients auront évalué vos services."
                                        : "Vos échanges avec les clients apparaîtront ici."}
                                </div>
                            </div>
                        )}

                    </div>{/* /content */}
                </main>
            </div>

            {/* ── Modals ── */}
            {modalProduct !== undefined && (
                <ProductModal
                    product={modalProduct}
                    categories={categories}
                    onSave={handleSave}
                    onClose={() => setModalProduct(undefined)}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    item={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* ── Toast ── */}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}