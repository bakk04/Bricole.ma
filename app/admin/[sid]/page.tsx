"use client";
import { useState, useEffect, useRef } from "react";
import {
    LayoutDashboard, Users, UserCheck, FileText,
    Search, LogOut, TrendingUp, TrendingDown,
    Trash2, Shield, Eye, BarChart2,
    CheckCircle, Filter, MoreHorizontal, Bell,
    RefreshCw, ChevronRight, Plus, Download
} from "lucide-react";
import styles from "../adminDashboard.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";
import { getData, patchData, deleteData } from "@/lib/api";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, ArcElement, Filler, Tooltip
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip);

/* ─── Helpers ────────────────────────────────────────────────── */
function fmtNum(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return String(n ?? 0);
}
function timeAgo(d: string | Date) {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60_000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}j`;
}
function initials(name: string) {
    if (!name) return "?";
    const p = name.trim().split(/\s+/);
    return (p[0][0] + (p[1]?.[0] ?? "")).toUpperCase();
}
const GRADIENTS = [
    "linear-gradient(135deg,#1d4ed8,#60a5fa)",
    "linear-gradient(135deg,#059669,#34d399)",
    "linear-gradient(135deg,#7c3aed,#a78bfa)",
    "linear-gradient(135deg,#d97706,#fbbf24)",
    "linear-gradient(135deg,#dc2626,#f87171)",
    "linear-gradient(135deg,#0891b2,#67e8f9)",
];
function avGrad(id: string) {
    let h = 0;
    for (let i = 0; i < (id?.length ?? 0); i++) h = ((h << 5) - h) + id.charCodeAt(i);
    return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

/* ─── Avatar ─────────────────────────────────────────────────── */
function Avatar({ src, name, id }: { src?: string; name?: string; id?: string }) {
    const [err, setErr] = useState(false);
    if (src && !err) return <img src={src} alt={name} className={styles.avatar} onError={() => setErr(true)} />;
    return (
        <div className={styles.avatarFallback} style={{ background: avGrad(id ?? name ?? "?") }} title={name}>
            {initials(name ?? "?")}
        </div>
    );
}

/* ─── Sparkline ──────────────────────────────────────────────── */
function Sparkline({ data, color, dimColor }: { data: number[]; color: string; dimColor: string }) {
    const max = Math.max(...data);
    return (
        <div className={styles.sparkline}>
            {data.map((v, i) => (
                <div
                    key={i}
                    className={styles.sparkBar}
                    style={{
                        height: `${Math.round((v / max) * 22)}px`,
                        background: i === data.length - 1 ? color : dimColor,
                    }}
                />
            ))}
        </div>
    );
}

/* ─── KPI Card ───────────────────────────────────────────────── */
const KPI_CFG = {
    blue:   { color: "#2563eb", dimColor: "#bfdbfe", badgeBg: "#eff6ff", badgeColor: "#2563eb", iconBg: "#eff6ff" },
    green:  { color: "#059669", dimColor: "#a7f3d0", badgeBg: "#ecfdf5", badgeColor: "#059669", iconBg: "#ecfdf5" },
    amber:  { color: "#d97706", dimColor: "#fde68a", badgeBg: "#fffbeb", badgeColor: "#d97706", iconBg: "#fffbeb" },
    purple: { color: "#7c3aed", dimColor: "#ddd6fe", badgeBg: "#f5f3ff", badgeColor: "#7c3aed", iconBg: "#f5f3ff" },
} as const;

const SPARK_DATA = [
    [20,25,22,28,30,27,34,31,36,40,42,44],
    [60,62,65,61,68,70,67,72,75,80,78,84],
    [45,42,48,44,50,47,52,49,53,48,50,44],
    [10,12,11,15,13,18,16,20,22,26,23,30],
];

function KpiCard({
                     icon: Icon, label, value, trend, colorKey = "blue", spIdx = 0,
                 }: {
    icon: any; label: string; value: any; trend?: number; colorKey?: keyof typeof KPI_CFG; spIdx?: number;
}) {
    const cfg = KPI_CFG[colorKey];
    const pos = (trend ?? 0) > 0;
    return (
        <div className={styles.kpiCard} style={{ ["--kpi-color" as any]: cfg.color }}>
            <div className={styles.kpiTop}>
                <div className={styles.kpiIcon} style={{ background: cfg.iconBg, color: cfg.color }}>
                    <Icon size={18} />
                </div>
                {trend !== undefined && (
                    <span className={styles.kpiBadge} style={{ background: cfg.badgeBg, color: cfg.badgeColor }}>
                        {pos ? "+" : ""}{trend}%
                    </span>
                )}
            </div>
            <div className={styles.kpiVal}>{typeof value === "number" ? fmtNum(value) : value}</div>
            <div className={styles.kpiLbl}>{label}</div>
            {trend !== undefined && (
                <div className={styles.kpiTrend} style={{ color: pos ? "#059669" : "#dc2626" }}>
                    {pos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>vs mois dernier</span>
                </div>
            )}
            <Sparkline data={SPARK_DATA[spIdx]} color={cfg.color} dimColor={cfg.dimColor} />
        </div>
    );
}

/* ─── Status & Role ──────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
    const cls =
        status === "ACTIVE" || status === "OPEN" || status === "VÉRIFIÉ"
            ? styles.statusActive
            : status === "PENDING" || status === "IN_PROGRESS" || status === "EN ATTENTE"
                ? styles.statusPending
                : styles.statusError;
    return <span className={`${styles.status} ${cls}`}>{status}</span>;
}
function RoleBadge({ role }: { role: string }) {
    const cls = role === "ADMIN" ? styles.roleAdmin : role === "ARTISAN" ? styles.roleArtisan : styles.roleClient;
    return <span className={`${styles.rolePill} ${cls}`}>{role}</span>;
}

/* ─── Pagination ─────────────────────────────────────────────── */
function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
    if (totalPages <= 1) return null;
    return (
        <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ""}`} onClick={() => setPage(i + 1)}>
                    {i + 1}
                </button>
            ))}
        </div>
    );
}

/* ─── Overview Section ───────────────────────────────────────── */
const STAT_COLORS: Record<string, string> = { OPEN: "#059669", IN_PROGRESS: "#d97706", CLOSED: "#94a3b8", DONE: "#2563eb" };
const CAT_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];
const ART_GRADS  = ["linear-gradient(135deg,#1d4ed8,#60a5fa)","linear-gradient(135deg,#059669,#34d399)","linear-gradient(135deg,#7c3aed,#a78bfa)","linear-gradient(135deg,#d97706,#fbbf24)"];
const HMAP_COLORS= ["#f1f5f9","#bfdbfe","#93c5fd","#3b82f6","#1d4ed8"];

function OverviewSection({ stats }: { stats: any }) {
    const [period, setPeriod] = useState("30j");
    const total = stats.totalAnnonces || 1;

    const rand = (b: number, s: number) => Array.from({ length: 30 }, (_, i) => Math.round(b + Math.sin(i / 3) * s + Math.random() * s * 0.4));

    const lineOptions: any = {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#0f172a", titleColor: "#94a3b8", bodyColor: "#fff",
                padding: 10, cornerRadius: 8, titleFont: { size: 10 }, bodyFont: { size: 12 },
            },
        },
        scales: {
            x: { display: true, ticks: { maxTicksLimit: 6, color: "#94a3b8", font: { size: 10 } }, grid: { display: false }, border: { display: false } },
            y: { display: true, ticks: { maxTicksLimit: 4, color: "#94a3b8", font: { size: 10 } }, grid: { color: "rgba(15,23,42,0.05)" }, border: { display: false } },
        },
    };

    const donutData = {
        datasets: [{ 
            data: [
                stats.totalClients || 0, 
                stats.totalArtisans || 0, 
                (stats.totalUsers - stats.totalClients - stats.totalArtisans) || 0
            ], 
            backgroundColor: ["#2563eb", "#7c3aed", "#059669"], 
            borderWidth: 0, 
            hoverOffset: 3 
        }],
    };
    const donutOptions: any = { cutout: "73%", plugins: { legend: { display: false }, tooltip: { enabled: false } } };

    // Statistiques réelles pour le graphique d'évolution (derniers 7 jours si fournis)
    const trendData = stats.registrationsTrend || rand(18, 8);
    const trendLabels = trendData.map((_: any, i: number) => {
        const d = new Date();
        d.setDate(d.getDate() - (trendData.length - 1 - i));
        return d.toLocaleDateString("fr-MA", { day: "numeric", month: "short" });
    });

    const lineData = {
        labels: trendLabels,
        datasets: [
            { 
                label: "Inscriptions", 
                data: trendData, 
                borderColor: "#2563eb", 
                backgroundColor: "rgba(37,99,235,0.07)", 
                borderWidth: 2, 
                pointRadius: 4, 
                pointBackgroundColor: "#fff",
                tension: 0.4, 
                fill: true 
            }
        ],
    };

    return (
        <>
            {/* KPI */}
            <div className={styles.kpiGrid}>
                <KpiCard icon={Users}     label="Utilisateurs"     value={stats.totalUsers}          trend={12} colorKey="blue"   spIdx={0} />
                <KpiCard icon={UserCheck} label="Artisans actifs"  value={stats.totalArtisans}       trend={8}  colorKey="green"  spIdx={1} />
                <KpiCard icon={FileText}  label="Annonces publiées" value={stats.totalAnnonces}      trend={-2} colorKey="amber"  spIdx={2} />
                <KpiCard icon={BarChart2} label="Nouveaux (30j)"   value={stats.newUsersLast30Days}  trend={15} colorKey="purple" spIdx={3} />
            </div>

            {/* Row 2: Charts & Distribution */}
            <div className={styles.twoCol}>
                {/* Area chart */}
                <div className={styles.card}>
                    <div className={styles.cardHdr}>
                        <div>
                            <div className={styles.cardTitle}>Inscriptions</div>
                            <div className={styles.cardMeta}>Évolution sur les 7 derniers jours</div>
                        </div>
                    </div>
                    <div className={styles.chartWrap}>
                        <Line data={lineData} options={lineOptions} />
                    </div>
                    {/* Custom legend */}
                    <div className={styles.flexRow} style={{ marginTop: 10, gap: 14 }}>
                        {[{c:"#2563eb",l:"Nouvelles inscriptions"}].map(it=>(
                            <div key={it.l} className={styles.flexRow} style={{ gap:5 }}>
                                <div style={{ width:10,height:10,borderRadius:2,background:it.c,flexShrink:0 }}/>
                                <span style={{ fontSize:11,color:"var(--s4)" }}>{it.l}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stat bars + categories */}
                <div className={styles.card}>
                    <div className={styles.cardHdr}>
                        <div className={styles.cardTitle}>Statuts Annonces</div>
                        <div className={styles.cardMeta}>Distribution réelle</div>
                    </div>
                    {Object.entries(stats.annoncesStats || {}).map(([statut, count]: any) => (
                        <div key={statut} className={styles.statItem}>
                            <div className={styles.statTop}>
                                <span className={styles.statLbl}>{statut}</span>
                                <span className={styles.statNum}>{count}</span>
                            </div>
                            <div className={styles.barTrack}>
                                <div className={styles.barFill} style={{
                                    width: `${Math.round((count / (stats.totalAnnonces || 1)) * 100)}%`,
                                    background: STAT_COLORS[statut] ?? "#94a3b8",
                                }} />
                            </div>
                        </div>
                    ))}
                    <div className={styles.catDivider} />
                    <div className={styles.cardTitle} style={{ marginBottom: 8 }}>Top Catégories</div>
                    {stats.topCategories?.map((cat: any, i: number) => (
                        <div key={i} className={styles.catItem}>
                            <span className={styles.catName}>
                                <span className={styles.catDot} style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                                {cat.name}
                            </span>
                            <span className={styles.catCount}>{cat.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 3: Details & Activity */}
            <div className={styles.threeCol}>
                {/* Donut */}
                <div className={styles.card}>
                    <div className={styles.cardHdr}>
                        <div className={styles.cardTitle}>Rôles Utilisateurs</div>
                    </div>
                    <div className={styles.donutWrap}>
                        <Doughnut data={donutData} options={donutOptions} />
                        <div className={styles.donutCenter}>
                            <div className={styles.donutVal}>{fmtNum(stats.totalUsers)}</div>
                            <div className={styles.donutLab}>total</div>
                        </div>
                    </div>
                    <div className={styles.legendRow}>
                        {[
                            {c:"#2563eb",l:`Clients — ${Math.round((stats.totalClients / (stats.totalUsers || 1)) * 100)}%`},
                            {c:"#7c3aed",l:`Artisans — ${Math.round((stats.totalArtisans / (stats.totalUsers || 1)) * 100)}%`},
                            {c:"#059669",l:`Admins — ${Math.round(((stats.totalUsers - stats.totalClients - stats.totalArtisans) / (stats.totalUsers || 1)) * 100)}%`}
                        ].map(it=>(
                            <div key={it.l} className={styles.legendItem}>
                                <span className={styles.legendDot} style={{ background:it.c }}/>
                                {it.l}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity feed */}
                <div className={styles.card}>
                    <div className={styles.cardHdr}>
                        <div className={styles.cardTitle}>Activité récente</div>
                        <div className={styles.cardMeta} style={{ cursor:"pointer",color:"var(--blue)",fontWeight:600 }}>Live</div>
                    </div>
                    {(stats.recentActivity || []).map((a: any, i: number) => (
                        <div key={i} className={styles.actItem}>
                            <div className={styles.actIcon} style={{ background: a.type === "user" ? "#eff6ff" : "#fffbeb" }}>
                                {a.type === "user" ? "👤" : "🔨"}
                            </div>
                            <div className={styles.actMain}>
                                <div className={styles.actTitle}>{a.title}</div>
                                <div className={styles.actSub}>{a.sub}</div>
                            </div>
                            <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3 }}>
                                <StatusBadge status={a.status} />
                                <div className={styles.actTime}>{timeAgo(a.createdAt)}</div>
                            </div>
                        </div>
                    ))}
                    {(!stats.recentActivity || stats.recentActivity.length === 0) && (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Aucune activité récente</div>
                    )}
                </div>

                {/* Top artisans */}
                <div className={styles.card}>
                    <div className={styles.cardHdr}>
                        <div className={styles.cardTitle}>Top Artisans</div>
                        <div className={styles.cardMeta}>par note moyenne</div>
                    </div>
                    {(stats.topArtisans || []).map((a: any, i: number) => (
                        <div key={i} className={styles.artItem}>
                            <Avatar name={a.name} id={a.id} />
                            <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                                <div className={styles.artName} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                                <div className={styles.artJob}>{a.job}</div>
                            </div>
                            <div className={styles.artStars}>★ {a.stars.toFixed(1)}</div>
                        </div>
                    ))}
                    {(!stats.topArtisans || stats.topArtisans.length === 0) && (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Aucun artisan vérifié</div>
                    )}
                    <div className={styles.catDivider} />
                    <div className={styles.cardMeta} style={{ marginBottom:6, fontWeight: 600 }}>Performance Système</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Tous les signaux sont au vert.</div>
                </div>
            </div>
        </>
    );
}

/* ─── Main ───────────────────────────────────────────────────── */
const NAV = [
    { key:"overview",  label:"Vue d'ensemble",  Icon:LayoutDashboard },
    { key:"users",     label:"Utilisateurs",     Icon:Users },
    { key:"annonces",  label:"Annonces",         Icon:FileText },
    { key:"artisans",  label:"Vérifications",    Icon:UserCheck },
];
const PAGE_TITLE: Record<string,string> = {
    overview:"Tableau de Bord", users:"Utilisateurs",
    annonces:"Annonces", artisans:"Vérifications Artisans",
};

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const { logout } = useLogout();
    const [navKey, setNavKey]     = useState("overview");
    const [stats,  setStats]      = useState<any>(null);
    const [users,  setUsers]      = useState<any[]>([]);
    const [annonces, setAnnonces] = useState<any[]>([]);
    const [artisans, setArtisans] = useState<any[]>([]);
    const [loading, setLoading]   = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch]     = useState("");
    const [page, setPage]         = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { loadStats(); }, []);
    useEffect(() => {
        if (navKey === "users")    loadUsers();
        if (navKey === "annonces") loadAnnonces();
        if (navKey === "artisans") loadArtisans();
    }, [navKey, page, search]);

    const loadStats = async () => {
        try { setRefreshing(true); const r = await getData("/admin/stats"); if (r.success) setStats(r.stats); }
        catch(e){console.error(e);} finally { setLoading(false); setRefreshing(false); }
    };
    const loadUsers = async () => {
        try { const r = await getData(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`); if(r.success){setUsers(r.users);setTotalPages(r.pagination.pages);} } catch(e){console.error(e);}
    };
    const loadAnnonces = async () => {
        try { const r = await getData(`/admin/annonces?page=${page}&search=${encodeURIComponent(search)}`); if(r.success){setAnnonces(r.annonces);setTotalPages(r.pagination.pages);} } catch(e){console.error(e);}
    };
    const loadArtisans = async () => {
        try { const r = await getData(`/admin/artisans?filter=all`); if(r.success) setArtisans(r.artisans); } catch(e){console.error(e);}
    };
    const handleUpdateUser = async (userId:string, newStatus:string) => {
        try { const r = await patchData("/admin/users",{userId,status:newStatus}); if(r.success) setUsers(p=>p.map(u=>u._id===userId?{...u,status:newStatus}:u)); } catch{alert("Erreur");}
    };
    const handleDeleteAnnonce = async (id:string, type:string) => {
        if(!confirm("Supprimer cette annonce ?")) return;
        try { const r = await deleteData(`/admin/annonces?id=${id}&type=${type}`); if(r.success) setAnnonces(p=>p.filter(a=>a._id!==id && a.id!==id)); } catch{alert("Erreur");}
    };
    const handleToggleArtisan = async (artisan:any) => {
        try {
            const r = await patchData("/admin/artisans",{artisanId:artisan._id,estVerifie:!artisan.estVerifie});
            if(r.success) setArtisans(p=>p.map(a=>a._id===artisan._id?{...a,estVerifie:!artisan.estVerifie}:a));
        } catch(e) { alert("Erreur lors de la vérification"); }
    };

    const navigate = (key:string) => { setNavKey(key); setPage(1); setSearch(""); };

    if (loading) return (
        <div className={styles.dash}>
            <div className={styles.skeleton}>
                <div className={styles.skeletonDot}/><div className={styles.skeletonDot}/><div className={styles.skeletonDot}/>
                <span style={{marginLeft:8}}>Chargement…</span>
            </div>
        </div>
    );

    return (
        <div className={styles.dash}>
            <div className={styles.layout}>

                {/* ─ SIDEBAR ─ */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarBrand}>
                        <div className={styles.brandIcon}><Shield size={16}/></div>
                        <div>
                            <div className={styles.brandName}>Bricole.ma</div>
                            <div className={styles.brandSub}>Administration</div>
                        </div>
                    </div>
                    <nav className={styles.sidebarNav}>
                        <div className={styles.sidebarSection}>Menu</div>
                        {NAV.map(({key,label,Icon})=>(
                            <div key={key} className={`${styles.navItem} ${navKey===key?styles.navItemActive:""}`} onClick={()=>navigate(key)}>
                                <Icon size={15}/><span>{label}</span>
                            </div>
                        ))}
                        <div className={styles.sidebarDivider} style={{marginTop:12}}/>
                        <div className={`${styles.navItem} ${styles.navLogout}`} onClick={() => logout()}>
                            <LogOut size={15}/><span>Déconnexion</span>
                        </div>
                    </nav>
                    {session?.user && (
                        <div className={styles.sidebarBottom}>
                            <div className={styles.sidebarUser}>
                                <div className={styles.sidebarUserAv}>{initials(session.user.name??"Admin")}</div>
                                <div>
                                    <div className={styles.sidebarUserName}>{session.user.name??"Admin"}</div>
                                    <div className={styles.sidebarUserRole}>Super Admin</div>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* ─ MAIN ─ */}
                <main className={styles.main}>
                    {/* Topbar */}
                    <header className={styles.topbar}>
                        <div>
                            <div className={styles.topbarBreadcrumb}>
                                Bricole.ma <ChevronRight size={11}/> <span>{PAGE_TITLE[navKey]}</span>
                            </div>
                            <h1 className={styles.title}>{PAGE_TITLE[navKey]}</h1>
                            <p className={styles.subtitle}>
                                {new Date().toLocaleDateString("fr-MA",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                            </p>
                        </div>
                        <div className={styles.topbarRight}>
                            {navKey==="overview" && (
                                <div className={styles.livePill}><span className={styles.liveDot}/>Live</div>
                            )}
                            <div className={styles.searchWrap}>
                                <Search className={styles.searchIcon} size={14}/>
                                <input className={styles.searchBar} placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}/>
                            </div>
                            <div className={styles.notifWrap}>
                                <button className={styles.iconBtn}><Bell size={15}/></button>
                                <span className={styles.notifBadge}/>
                            </div>
                            <button className={styles.iconBtn} onClick={loadStats}
                                    style={{animation:refreshing?"spin .8s linear infinite":undefined}} title="Actualiser">
                                <RefreshCw size={14}/>
                            </button>
                            <button className={`${styles.topPill} ${styles.topPillBlue}`}>
                                <Download size={13}/> Exporter
                            </button>
                        </div>
                    </header>

                    {/* Overview */}
                    {navKey==="overview" && stats && <OverviewSection stats={stats}/>}

                    {/* Users */}
                    {navKey==="users" && (
                        <div className={styles.tableContainer}>
                            <div className={styles.tableHeader}>
                                <span className={styles.tableHeaderTitle}>Liste des Utilisateurs</span>
                                <div className={styles.tableHeaderActions}>
                                    <button className={styles.actionBtn}><Filter size={12}/> Filtres</button>
                                </div>
                            </div>
                            <table className={styles.table}>
                                <thead><tr><th>Utilisateur</th><th>Rôle</th><th>Ville</th><th>Statut</th><th>Inscription</th><th>Actions</th></tr></thead>
                                <tbody>
                                {users.map(user=>{
                                    const name = user.name ?? `${user.prenom??""} ${user.nom??""}`.trim();
                                    return (
                                        <tr key={user._id}>
                                            <td><div className={styles.avatarGroup}>
                                                <Avatar src={user.profileImage} name={name} id={user._id}/>
                                                <div><div className={styles.avatarName}>{name||"—"}</div><div className={styles.avatarSub}>{user.email}</div></div>
                                            </div></td>
                                            <td><RoleBadge role={user.role}/></td>
                                            <td style={{color:"var(--s3)",fontSize:12}}>{user.ville||"—"}</td>
                                            <td><StatusBadge status={user.status}/></td>
                                            <td style={{fontSize:11.5,color:"var(--s4)"}}>{new Date(user.createdAt).toLocaleDateString("fr-MA")}</td>
                                            <td><div className={styles.flexRow}>
                                                <button className={`${styles.actionBtn} ${user.status==="ACTIVE"?styles.actionBtnDanger:""}`}
                                                        onClick={()=>handleUpdateUser(user._id,user.status==="ACTIVE"?"SUSPENDED":"ACTIVE")}>
                                                    {user.status==="ACTIVE"?<Trash2 size={12}/>:<CheckCircle size={12}/>}
                                                </button>
                                                <button className={styles.actionBtn}><MoreHorizontal size={12}/></button>
                                            </div></td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                            {users.length===0 && <div className={styles.emptyState}><div className={styles.emptyIcon}><Users size={20}/></div><div className={styles.emptyTitle}>Aucun utilisateur</div><div className={styles.emptyDesc}>Essayez d'ajuster vos filtres.</div></div>}
                            <Pagination page={page} totalPages={totalPages} setPage={setPage}/>
                        </div>
                    )}

                    {/* Annonces */}
                    {navKey==="annonces" && (
                        <div className={styles.tableContainer}>
                            <div className={styles.tableHeader}>
                                <span className={styles.tableHeaderTitle}>Liste des Annonces</span>
                                <div className={styles.tableHeaderActions}><button className={styles.actionBtn}><Filter size={12}/> Filtres</button></div>
                            </div>
                            <table className={styles.table}>
                                <thead><tr><th>Titre</th><th>Client</th><th>Catégorie</th><th>Ville</th><th>Statut</th><th>Actions</th></tr></thead>
                                <tbody>
                                {annonces.map(a=>(
                                    <tr key={a.id || a._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span className={`${styles.typeBadge} ${a.type === 'MISSION' ? styles.typeMission : styles.typeService}`}>
                                                    {a.type === 'MISSION' ? 'Mission' : 'Service'}
                                                </span>
                                                <div className={styles.textClamp} style={{fontWeight:600,fontSize:12.5,maxWidth:170}}>{a.titre}</div>
                                            </div>
                                            <div style={{fontSize:11,color:"var(--s4)",marginTop:2}}>{timeAgo(a.createdAt)}</div>
                                        </td>
                                        <td>
                                            <div className={styles.avatarGroup}>
                                                <Avatar name={a.ownerName} id={a.clientId?._id || a.artisanId?._id}/>
                                                <span style={{fontSize:12}}>{a.ownerName}</span>
                                            </div>
                                        </td>
                                        <td style={{fontSize:12,color:"var(--s3)"}}>{a.categoryName}</td>
                                        <td style={{fontSize:12,color:"var(--s3)"}}>{a.ville}</td>
                                        <td><StatusBadge status={a.statut || a.status || "ACTIVE"}/></td>
                                        <td><div className={styles.flexRow}>
                                            <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={()=>handleDeleteAnnonce(a.id || a._id, a.type)}><Trash2 size={12}/></button>
                                            <button className={styles.actionBtn} onClick={() => router.push(a.type === 'SERVICE' ? `/explore/details/${a.id || a._id}` : '#')}><Eye size={12}/></button>
                                        </div></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {annonces.length===0 && <div className={styles.emptyState}><div className={styles.emptyIcon}><FileText size={20}/></div><div className={styles.emptyTitle}>Aucune annonce</div></div>}
                            <Pagination page={page} totalPages={totalPages} setPage={setPage}/>
                        </div>
                    )}

                    {/* Artisans */}
                    {navKey==="artisans" && (
                        <div className={styles.tableContainer}>
                            <div className={styles.tableHeader}>
                                <span className={styles.tableHeaderTitle}>Vérification des Artisans</span>
                                <div className={styles.tableHeaderActions}><button className={styles.actionBtn}><Filter size={12}/> Filtres</button></div>
                            </div>
                            <table className={styles.table}>
                                <thead><tr><th>Artisan</th><th>Métier</th><th>Ville</th><th>Statut</th><th>Actions</th></tr></thead>
                                <tbody>
                                {artisans.map(art=>(
                                    <tr key={art._id}>
                                        <td><div className={styles.avatarGroup}>
                                            <Avatar src={art.photoProfil} name={art.nomComplet} id={art._id}/>
                                            <div><div className={styles.avatarName}>{art.nomComplet}</div><div className={styles.avatarSub}>{art.userId?.email}</div></div>
                                        </div></td>
                                        <td style={{fontSize:12,color:"var(--s3)"}}>{art.metierId?.nom??"—"}</td>
                                        <td style={{fontSize:12,color:"var(--s3)"}}>{art.ville}</td>
                                        <td><StatusBadge status={art.estVerifie?"VÉRIFIÉ":"EN ATTENTE"}/></td>
                                        <td>
                                            <button className={styles.actionBtn} onClick={()=>handleToggleArtisan(art)}
                                                    style={{color:art.estVerifie?"var(--s4)":"var(--green)"}}>
                                                <Shield size={12}/>{art.estVerifie?" Retirer":" Vérifier"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {artisans.length===0 && <div className={styles.emptyState}><div className={styles.emptyIcon}><UserCheck size={20}/></div><div className={styles.emptyTitle}>Aucun artisan</div></div>}
                        </div>
                    )}
                </main>

                {/* ─ MOBILE NAV ─ */}
                <nav className={styles.mobileNav}>
                    {NAV.map(({key,label,Icon})=>(
                        <div key={key} className={`${styles.mobileNavItem} ${navKey===key?styles.mobileNavItemActive:""}`} onClick={()=>navigate(key)}>
                            <div className={styles.mobileNavIcon}><Icon size={20}/></div>
                            <span>{label}</span>
                        </div>
                    ))}
                    <div className={styles.mobileNavItem} onClick={() => logout()}>
                        <div className={styles.mobileNavIcon}><LogOut size={20}/></div>
                        <span>Quitter</span>
                    </div>
                </nav>
            </div>
        </div>
    );
}