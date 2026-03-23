/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PROFESSIONNEL — MODERN, RESPONSIVE, MAALAM.MA INSPIRED
   Mobile-First PWA Design with Desktop CRM Quick Access
═══════════════════════════════════════════════════════════════ */

:root {
    /* Primary Colors - Moroccan Palette */
    --primary: #1a4fd6;
    --primary-light: #3b6ef8;
    --primary-dark: #0f2a7a;

    /* Accents */
    --success: #2d8a5f;
    --warning: #d89a3d;
    --danger: #d8547d;
    --info: #1a4fd6;

    /* Surfaces */
    --surface-1: #ffffff;
    --surface-2: #f9f9fb;
    --surface-3: #f0f0f5;

    /* Text */
    --text-primary: #0f1419;
    --text-secondary: #6b7280;
    --text-tertiary: #a0a0a8;
    --text-light: #ffffff;

    /* UI */
    --border: #e4e4eb;
    --border-light: #efeff4;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.12);

    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 20px;
    --spacing-2xl: 24px;
    --spacing-3xl: 32px;

    /* Radius */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 20px;
}

/* Note: Universal selectors removed - use global.css for reset styles instead */

button { font-family: inherit; cursor: pointer; }

/* ═══════════════════════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════════════════════ */

.dash {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--surface-1);
}

.layout {
    display: flex;
    flex: 1;
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR — MOBILE HORIZONTAL / DESKTOP VERTICAL
═══════════════════════════════════════════════════════════════ */

.sidebar {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 70px;
    padding: 0 var(--spacing-lg);
    gap: var(--spacing-lg);
    background: var(--surface-1);
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    overflow-y: hidden;
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
}

@media (min-width: 1024px) {
.sidebar {
        flex-direction: column;
        width: 260px;
        height: 100vh;
        padding: var(--spacing-lg);
        gap: var(--spacing-md);
        border-right: 1px solid var(--border);
        border-bottom: none;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
    }
}

/* Brand */
.sidebarBrand {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: 0 var(--spacing-sm);
    flex-shrink: 0;
    cursor: pointer;
}

@media (min-width: 1024px) {
.sidebarBrand {
        padding: 0;
        margin-bottom: var(--spacing-lg);
    }
}

.brandIcon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--text-light);
}

.brandName {
    font-weight: 700;
    font-size: 14px;
    color: var(--text-primary);
}

.brandSub {
    font-size: 11px;
    color: var(--text-tertiary);
}

/* Navigation */
.sidebarNav {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-xs);
    flex: 1;
    align-items: center;
    overflow-x: auto;
}

@media (min-width: 1024px) {
.sidebarNav {
        flex-direction: column;
        flex: 0;
        gap: var(--spacing-sm);
        width: 100%;
        overflow-x: visible;
    }
}

.navItem {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: 6px 12px;
    border-radius: var(--radius-md);
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
    position: relative;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.navItem:hover {
    color: var(--primary);
    background: var(--surface-3);
}

.navItem.active {
    color: var(--primary);
    background: var(--surface-3);
    font-weight: 600;
}

.navItem.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary);
    border-radius: 1px;
}

@media (min-width: 1024px) {
.navItem {
        width: 100%;
        justify-content: flex-start;
        padding: var(--spacing-md) var(--spacing-lg);
        font-size: 13px;
    }

.navItem span {
        display: inline;
    }

.navItem.active::after {
        display: none;
    }

.navItem.active {
        background: var(--primary);
        color: var(--text-light);
    }

.navItem.active:hover {
        background: var(--primary-dark);
    }
}

@media (max-width: 1023px) {
.navItem span {
        display: none;
    }
}

.navBadge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--danger);
    color: var(--text-light);
    font-size: 9px;
    font-weight: 700;
    flex-shrink: 0;
}

/* CRM Quick Access (Desktop Only) */
.quickAccessSection {
    display: none;
    width: 100%;
    padding: var(--spacing-lg) 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
}

@media (min-width: 1024px) {
.quickAccessSection {
        display: block;
    }
}

.quickAccessTitle {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--spacing-md);
    padding: 0 var(--spacing-lg);
}

.crmCardsGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    padding: 0 var(--spacing-md);
}

.crmCard {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    background: var(--surface-3);
    border: 1px solid var(--border);
    color: var(--text-primary);
    font-size: 12px;
    font-weight: 500;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.crmCard:hover {
    background: var(--surface-2);
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.crmCardIcon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--primary);
    color: var(--text-light);
    display: flex;
    align-items: center;
    justify-content: center;
}

.crmCardLabel {
    font-size: 11px;
    color: var(--text-secondary);
}

.crmCardCount {
    font-size: 18px;
    font-weight: 700;
    color: var(--primary);
}

/* User Profile */
.sidebarUser {
    display: none;
    width: 100%;
    padding: var(--spacing-lg) 0;
    border-top: 1px solid var(--border);
    align-items: center;
    gap: var(--spacing-md);
    margin-top: auto;
}

@media (min-width: 1024px) {
.sidebarUser {
        display: flex;
    }
}

.sidebarAvatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-lg);
    object-fit: cover;
}

.sidebarAvatarFallback {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    color: var(--text-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
}

.sidebarUserInfo { min-width: 0; }

.sidebarUserName {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sidebarUserRole {
    font-size: 11px;
    color: var(--text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CONTENT
═══════════════════════════════════════════════════════════════ */

.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 0;
}

/* Topbar */
.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    background: var(--surface-1);
    border-bottom: 1px solid var(--border);
    gap: var(--spacing-lg);
    flex-shrink: 0;
}

@media (min-width: 1024px) {
.topbar {
        padding: var(--spacing-2xl);
    }
}

.topbarTitle {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
}

.topbarSub {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
}

.topbarRight {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
    margin-left: auto;
}

.topbarBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: 8px 12px;
    border-radius: var(--radius-md);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.topbarBtn:hover {
    background: var(--surface-3);
    color: var(--text-primary);
}

.topbarBtnLabel {
    display: none;
}

@media (min-width: 1024px) {
.topbarBtn {
        padding: 8px 16px;
        font-size: 13px;
    }

.topbarBtnLabel {
        display: inline;
    }
}

.topbarBtnPrimary {
    background: var(--primary);
    color: var(--text-light);
    border-color: var(--primary);
}

.topbarBtnPrimary:hover {
    background: var(--primary-dark);
    border-color: var(--primary-dark);
    box-shadow: var(--shadow-md);
}

.topbarBtnGhost:hover {
    background: var(--surface-3);
}

/* Content Area */
.content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-xl);
}

@media (min-width: 1024px) {
.content {
        padding: var(--spacing-2xl);
    }
}

/* ═══════════════════════════════════════════════════════════════
   HERO BANNER
═══════════════════════════════════════════════════════════════ */

.heroBanner {
    border-radius: var(--radius-2xl);
    padding: var(--spacing-2xl);
    margin-bottom: var(--spacing-2xl);
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--primary-dark) 100%);
    border: 1px solid rgba(59, 110, 248, 0.2);
    color: var(--text-light);
}

@media (max-width: 640px) {
.heroBanner {
        padding: var(--spacing-xl);
        margin-bottom: var(--spacing-xl);
    }
}

.heroBannerInner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-2xl);
    align-items: center;
    position: relative;
    z-index: 2;
}

@media (max-width: 768px) {
.heroBannerInner {
        grid-template-columns: 1fr;
        gap: var(--spacing-xl);
    }
}

.heroBannerLeft h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: var(--spacing-md);
    line-height: 1.3;
}

.heroBannerLeft p {
    font-size: 14px;
    opacity: 0.95;
    margin-bottom: var(--spacing-lg);
}

.heroBannerBadge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-md);
    font-size: 12px;
    font-weight: 600;
    width: fit-content;
}

.heroBannerStats {
    display: flex;
    gap: var(--spacing-md);
}

.heroBannerStat {
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
}

.heroBannerStatVal {
    display: block;
    font-size: 22px;
    font-weight: 700;
}

.heroBannerStatLbl {
    display: block;
    font-size: 11px;
    opacity: 0.9;
    margin-top: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   KPI GRID
═══════════════════════════════════════════════════════════════ */

.kpiGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-2xl);
}

@media (min-width: 768px) {
.kpiGrid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-lg);
    }
}

@media (min-width: 1024px) {
.kpiGrid {
        grid-template-columns: repeat(4, 1fr);
        gap: var(--spacing-lg);
    }
}

.kpiCard {
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    background: var(--surface-2);
    border: 1px solid var(--border);
    animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
}

@media (max-width: 640px) {
.kpiCard {
        padding: var(--spacing-md);
    }
}

.kpiHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-md);
}

.kpiIconWrap {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: var(--primary);
    color: var(--text-light);
    display: flex;
    align-items: center;
    justify-content: center;
}

.kpiTrend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
}

.kpiTrendUp {
    background: rgba(45, 138, 95, 0.1);
    color: var(--success);
}

.kpiTrendDown {
    background: rgba(216, 84, 125, 0.1);
    color: var(--danger);
}

.kpiTrendNeutral {
    background: rgba(160, 160, 168, 0.1);
    color: var(--text-tertiary);
}

.kpiVal {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

@media (max-width: 640px) {
.kpiVal {
        font-size: 22px;
    }
}

.kpiLabel {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
}

.kpiSub {
    font-size: 11px;
    color: var(--text-tertiary);
}

.kpiBar {
    height: 4px;
    border-radius: 2px;
    background: var(--border);
    overflow: hidden;
    margin-top: var(--spacing-md);
}

.kpiBarFill {
    height: 100%;
    background: var(--primary);
    transition: width 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ═══════════════════════════════════════════════════════════════
   PANELS & CARDS
═══════════════════════════════════════════════════════════════ */

.dashGrid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-2xl);
    margin-bottom: var(--spacing-2xl);
}

@media (min-width: 1024px) {
.dashGrid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.panel {
    border-radius: var(--radius-lg);
    background: var(--surface-2);
    border: 1px solid var(--border);
    overflow: hidden;
    animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
    animation-delay: 200ms;
}

.panelHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border);
}

.panelTitle {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
}

.panelSub {
    font-size: 11px;
    color: var(--text-tertiary);
    margin-top: 4px;
}

.panelAction {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 6px 12px;
    border-radius: var(--radius-md);
    background: transparent;
    border: none;
    color: var(--primary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.panelAction:hover {
    background: var(--primary);
    color: var(--text-light);
}

.panelBody {
    padding: var(--spacing-lg);
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVITY & SERVICES
═══════════════════════════════════════════════════════════════ */

.actList {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.actItem {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    background: var(--surface-3);
}

.actIco {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.actBody {
    flex: 1;
    min-width: 0;
}

.actTitle {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
}

.actDesc {
    font-size: 11px;
    color: var(--text-tertiary);
    margin-top: 2px;
}

.actTime {
    font-size: 11px;
    color: var(--text-tertiary);
    flex-shrink: 0;
}

.serviceRow {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border);
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.serviceRow:last-child {
    border-bottom: none;
}

.serviceRow:hover {
    background: var(--surface-3);
}

.serviceRank {
    font-size: 12px;
    font-weight: 700;
    color: var(--primary);
    min-width: 24px;
}

.serviceThumb {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    object-fit: cover;
    flex-shrink: 0;
}

.serviceInfo {
    flex: 1;
    min-width: 0;
}

.serviceName {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.serviceCat {
    font-size: 11px;
    color: var(--text-tertiary);
    margin-top: 2px;
}

.serviceMeta {
    display: flex;
    gap: var(--spacing-md);
}

.serviceMetaItem {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   CATALOGUE SECTION
═══════════════════════════════════════════════════════════════ */

.catSearch {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-2xl);
    flex-wrap: wrap;
    align-items: center;
}

@media (max-width: 640px) {
.catSearch {
        flex-direction: column;
    }
}

.searchInput {
    flex: 1;
    min-width: 200px;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    font-size: 13px;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.searchInput:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(26, 79, 214, 0.1);
}

.filterButtons {
    display: flex;
    gap: var(--spacing-sm);
}

.filterBtn {
    padding: 6px 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--surface-1);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.filterBtn:hover,
.filterBtn.active {
    background: var(--primary);
    color: var(--text-light);
    border-color: var(--primary);
}

/* Catalogue Grid */
.catGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-2xl);
}

@media (min-width: 640px) {
.catGrid {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-lg);
    }
}

@media (min-width: 1024px) {
.catGrid {
        grid-template-columns: repeat(4, 1fr);
        gap: var(--spacing-lg);
    }
}

.catCard {
    border-radius: var(--radius-lg);
    background: var(--surface-2);
    border: 1px solid var(--border);
    overflow: hidden;
    animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.catCard:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
}

.catCardImg {
    position: relative;
    width: 100%;
    height: 200px;
    background: var(--surface-3);
    overflow: hidden;
}

@media (max-width: 640px) {
.catCardImg {
        height: 140px;
    }
}

.catCardImg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.catCard:hover .catCardImg img {
    transform: scale(1.05);
}

.catCardImgEmpty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
}

.imgCountBadge {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    background: rgba(0, 0, 0, 0.6);
    color: var(--text-light);
    font-size: 11px;
    font-weight: 600;
}

.favsBadge {
    position: absolute;
    top: var(--spacing-md);
    left: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    background: rgba(216, 84, 125, 0.9);
    color: var(--text-light);
    font-size: 11px;
    font-weight: 600;
}

.statusBadge {
    position: absolute;
    bottom: var(--spacing-md);
    right: var(--spacing-md);
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
}

.statusActive {
    background: var(--success);
    color: var(--text-light);
}

.statusPaused {
    background: var(--text-tertiary);
    color: var(--text-light);
}

.catCardActions {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.catCard:hover .catCardActions {
    opacity: 1;
}

.catActionBtn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    border: none;
    background: rgba(255, 255, 255, 0.95);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.catActionBtn:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
}

.catActionEdit { color: var(--primary); }
.catActionEdit:hover { background: var(--primary); color: var(--text-light); }

.catActionPlay { color: var(--success); }
.catActionPlay:hover { background: var(--success); color: var(--text-light); }

.catActionPause { color: var(--warning); }
.catActionPause:hover { background: var(--warning); color: var(--text-light); }

.catActionDelete { color: var(--danger); }
.catActionDelete:hover { background: var(--danger); color: var(--text-light); }

.catCardBody {
    padding: var(--spacing-lg);
}

.catCardTitle {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.catCardCat {
    font-size: 11px;
    color: var(--primary);
    font-weight: 600;
    margin-bottom: var(--spacing-md);
}

.catCardFooter {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md);
}

.catCardPrice {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
}

.catCardPriceSub {
    font-size: 10px;
    color: var(--text-tertiary);
    margin-top: 2px;
}

.catCardMeta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: flex-end;
}

.catCardMetaItem {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   FORMS
═══════════════════════════════════════════════════════════════ */

.formGroup {
    margin-bottom: var(--spacing-lg);
}

.formLabel {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

.formInput,
.formSelect,
.formTextarea {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    font-family: inherit;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--surface-1);
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.formInput:focus,
.formSelect:focus,
.formTextarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(26, 79, 214, 0.1);
}

.formTextarea {
    min-height: 100px;
    resize: vertical;
}

.formRow {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
}

@media (max-width: 640px) {
.formRow {
        grid-template-columns: 1fr;
    }
}

.uploadZone {
    border: 2px dashed var(--border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-2xl);
    text-align: center;
    cursor: pointer;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.uploadZone:hover,
.uploadZone.dragOver {
    border-color: var(--primary);
    background: var(--surface-3);
}

.uploadIcon {
    font-size: 32px;
    margin-bottom: var(--spacing-md);
    color: var(--primary);
}

.uploadLabel {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

.uploadSub {
    font-size: 11px;
    color: var(--text-tertiary);
}

.imgPreviewList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
}

.imgChip {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    aspect-ratio: 1;
}

.imgChip img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.imgChipDel {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: var(--text-light);
    cursor: pointer;
    opacity: 0;
    transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.imgChip:hover .imgChipDel {
    opacity: 1;
}

/* ═══════════════════════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════════════════════ */

.modalOverlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-lg);
}

.modal,
.confirmModal {
    background: var(--surface-1);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

@media (max-width: 640px) {
.modal,
.confirmModal {
        border-radius: var(--radius-lg);
        max-height: none;
    }
}

.modalHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-2xl);
    border-bottom: 1px solid var(--border);
}

.modalTitle {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
}

.modalClose {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    border: none;
    background: var(--surface-3);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modalClose:hover {
    background: var(--border);
    color: var(--text-primary);
}

.modalBody {
    padding: var(--spacing-2xl);
}

.modalFooter {
    display: flex;
    gap: var(--spacing-lg);
    padding: var(--spacing-2xl);
    border-top: 1px solid var(--border);
}

.confirmModal {
    padding: var(--spacing-2xl);
    text-align: center;
}

.confirmIcon {
    font-size: 48px;
    color: var(--danger);
    margin-bottom: var(--spacing-lg);
}

.confirmTitle {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.confirmDesc {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-2xl);
    line-height: 1.5;
}

.confirmBtns {
    display: flex;
    gap: var(--spacing-lg);
}

/* ═══════════════════════════════════════════════════════════════
   BUTTONS
═══════════════════════════════════════════════════════════════ */

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: 8px 16px;
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btnPrimary {
    background: var(--primary);
    color: var(--text-light);
}

.btnPrimary:hover:not(:disabled) {
    background: var(--primary-dark);
    box-shadow: var(--shadow-md);
}

.btnGhost {
    background: transparent;
    color: var(--text-secondary);
    border-color: var(--border);
}

.btnGhost:hover:not(:disabled) {
    background: var(--surface-3);
    color: var(--text-primary);
}

.btnDanger {
    background: var(--danger);
    color: var(--text-light);
}

.btnDanger:hover:not(:disabled) {
    background: #c74470;
    box-shadow: var(--shadow-md);
}

/* ═══════════════════════════════════════════════════════════════
   CHARTS
═══════════════════════════════════════════════════════════════ */

.chartWrap {
    margin-bottom: var(--spacing-lg);
}

.chartBars {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 120px;
    gap: var(--spacing-sm);
}

.chartBarCol {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
}

.chartBar {
    width: 100%;
    max-width: 32px;
    background: var(--primary);
    border-radius: 4px 4px 0 0;
    animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
}

.chartBar.active {
    background: var(--warning);
}

.chartBarLabel {
    font-size: 10px;
    color: var(--text-tertiary);
}

.chartLegend {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    font-size: 11px;
    color: var(--text-secondary);
    padding: var(--spacing-md) 0;
    border-top: 1px solid var(--border);
}

.chartLegendDot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.progressRow {
    margin-bottom: var(--spacing-lg);
}

.progressLabel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
    font-size: 12px;
}

.progressVal {
    color: var(--text-tertiary);
}

.progressTrack {
    height: 6px;
    border-radius: 3px;
    background: var(--surface-3);
    overflow: hidden;
}

.progressFill {
    height: 100%;
    background: var(--primary);
    border-radius: 3px;
    transition: width 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATES
═══════════════════════════════════════════════════════════════ */

.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-3xl);
    text-align: center;
    min-height: 300px;
}

.emptyIconWrap {
    font-size: 48px;
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-lg);
}

.emptyTitle {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.emptyBody {
    font-size: 13px;
    color: var(--text-secondary);
    max-width: 400px;
    line-height: 1.5;
}

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */

.toast {
    position: fixed;
    bottom: var(--spacing-2xl);
    right: var(--spacing-2xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) var(--spacing-2xl);
    border-radius: var(--radius-lg);
    background: var(--surface-2);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    z-index: 900;
    animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toastSuccess {
    border-left: 4px solid var(--success);
}

.toastError {
    border-left: 4px solid var(--danger);
}

.toastIcon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.toastMsg {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════════ */

.sk {
    background: linear-gradient(90deg, var(--surface-3) 25%, var(--surface-2) 50%, var(--surface-3) 75%);
    background-size: 200% 100%;
    animation: skeleton 1.5s infinite;
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════════════════════ */

@keyframes skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideUp {
    from {
        height: 0;
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(24px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE REFINEMENTS
═══════════════════════════════════════════════════════════════ */

@media (max-width: 640px) {
.topbarTitle { font-size: 16px; }
.topbarBtn { padding: 6px 10px; font-size: 11px; }
.catCardImg { height: 140px; }
.catCardBody { padding: var(--spacing-md); }
.panelHead { flex-direction: column; align-items: flex-start; gap: var(--spacing-md); }
.toast { bottom: var(--spacing-lg); right: var(--spacing-lg); left: var(--spacing-lg); }
.searchInput { width: 100%; }
}

@media print {
.topbar,
.sidebar,
.modalOverlay {
        display: none;
    }
}
