'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../api/context/AuthContext';
import { 
    User, Building2, Wrench, Zap, Paintbrush, 
    Axe, Wind, LayoutGrid, TreePalm, Key, HelpCircle, 
    Phone, MapPin, Mail, Lock, Eye, EyeOff, ArrowLeft, 
    CheckCircle2, Building, Plus, Info
} from 'lucide-react';
import styles from './register.module.css';
import axios from "axios";

const DOMAINES = [
    { key: 'plomberie', label: 'Plomberie', icon: <Wrench size={18} /> },
    { key: 'electricite', label: 'Électricité', icon: <Zap size={18} /> },
    { key: 'maconnerie', label: 'Maçonnerie', icon: <Building size={18} /> },
    { key: 'peinture', label: 'Peinture', icon: <Paintbrush size={18} /> },
    { key: 'menuiserie', label: 'Menuiserie', icon: <Axe size={18} /> },
    { key: 'climatisation', label: 'Climatisation', icon: <Wind size={18} /> },
    { key: 'carrelage', label: 'Carrelage', icon: <LayoutGrid size={18} /> },
    { key: 'jardinage', label: 'Jardinage', icon: <TreePalm size={18} /> },
    { key: 'serrurerie', label: 'Serrurerie', icon: <Key size={18} /> },
    { key: 'autre', label: 'Autre', icon: <HelpCircle size={18} /> },
];

const TYPING_LINES = [
    'Vérification des informations...',
    'Création du profil sécurisé...',
    'Configuration de votre espace...',
    'Finalisation du compte...',
];

function getPwStrength(pw: string) {
    if (!pw) return { level: 0, label: '', cls: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'Faible', cls: styles.weak };
    if (score <= 2) return { level: 2, label: 'Moyen', cls: styles.medium };
    return { level: 3, label: 'Fort', cls: styles.strong };
}

interface SuccessFlowProps {
    prenom: string;
    nom?: string;
    email?: string;
    role?: string;
    domaine?: string;
    customDomaine?: string;
    nomEntreprise?: string;
    artisanType?: string;
}

function SuccessFlow({ prenom }: SuccessFlowProps) {
    const [step, setStep]         = useState(1);
    const [typingText, setTyping] = useState('');
    const lineIdx = useRef(0), charIdx = useRef(0);

    // Typing animation
    useEffect(() => {
        if (step !== 1) return;
        let t: NodeJS.Timeout;
        const tick = () => {
            if (lineIdx.current >= TYPING_LINES.length) {
                setStep(2);
                return;
            }
            const line = TYPING_LINES[lineIdx.current];
            if (charIdx.current <= line.length) {
                setTyping(line.slice(0, charIdx.current++));
                t = setTimeout(tick, 15);
            } else {
                t = setTimeout(() => {
                    charIdx.current = 0;
                    lineIdx.current++;
                    if (lineIdx.current >= TYPING_LINES.length) setStep(2);
                    else tick();
                }, 300);
            }
        };
        t = setTimeout(tick, 300);
        return () => clearTimeout(t);
    }, [step]);

    const progress = step === 1 ? (lineIdx.current / TYPING_LINES.length) * 100 : 100;

    return (
        <div className={styles.scene}>
            <div className={styles.bgLayer} />
            <div className={styles.bgGrid} />
            <div className={`${styles.shape} ${styles.sh1}`} />
            <div className={`${styles.shape} ${styles.sh2}`} />
            <div className={`${styles.shape} ${styles.sh3}`} />

            <div className={styles.card}>
                <div className={styles.surface}>
                    <div className={styles.progTrack}>
                        <div className={styles.progFill} style={{ width: `${progress}%` }} />
                    </div>

                    <div className={`${styles.step} ${step === 1 ? styles.stepOn : ''}`}>
                        <div className={styles.logoRow}>
                            <div className={styles.logoGem}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M3 9h4M9 3v4M9 11v4M11 9h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="9" cy="9" r="2" fill="white"/>
                                </svg>
                            </div>
                            <span className={styles.logoText}>bricole<span>.ma</span></span>
                        </div>
                        
                        <div className={styles.arcWrap}>
                            <svg viewBox="0 0 56 56">
                                <circle cx="28" cy="28" r="22" className={styles.arcTrack} />
                                <path d="M28 6 A22 22 0 0 1 50 28" className={styles.arcLine} />
                                <defs>
                                    <linearGradient id="ag" x1="28" y1="6" x2="50" y2="28" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#60a5fa"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className={styles.arcCenter}><div className={styles.arcDot} /></div>
                        </div>
                        
                        <div className={styles.loadLabel}>Initialisation</div>
                        <div className={styles.typeLine}>{typingText}</div>
                        
                        <div className={styles.loadDots}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`${styles.loadDot} ${lineIdx.current > i ? styles.loadDotDone : ''}`} />
                            ))}
                        </div>
                    </div>

                    <div className={`${styles.step} ${step === 2 ? styles.stepOn : ''}`}>
                        <div className={styles.burstWrap}>
                            <div className={styles.burstRing} /><div className={styles.burstRing} /><div className={styles.burstRing} />
                            <div className={styles.checkBall}>
                                <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                                    <path className={styles.checkPath} d="M8 16l6 6 10-10"
                                          stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <div className={styles.wPill}>Inscription réussie</div>
                        <h2 className={styles.wTitle}>Bienvenue, <em>{prenom}</em></h2>
                        <p className={styles.wDesc}>
                            Votre compte a été créé avec succès. <strong>Vous devez vérifier votre e-mail pour que votre compte soit activé.</strong> Un lien de confirmation a été envoyé à votre boîte de réception.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    const { state: globalState, dispatch: globalDispatch } = useAuth();
    
    const [step, setStep] = useState(1); 
    const [role, setRole] = useState(''); 
    const [artisanType, setArtisanType] = useState('INDIVIDUAL'); 
    const [domaine, setDomaine] = useState('');
    const [customDomaine, setCustomDomaine] = useState('');
    
    const [showPw, setShowPw] = useState(false);
    const [showPw2, setShowPw2] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        prenom: '', 
        nom: '', 
        nomEntreprise: '',
        email: '', 
        telephone: '', 
        ville: '', 
        password: '', 
        confirm: ''
    });

    useEffect(() => { 
        setMounted(true); 
    }, []);

    const pwStrength = getPwStrength(form.password);

    const updateForm = useCallback((k: string, v: string) => {
        setForm(f => ({ ...f, [k]: v }));
        
        if (localErrors[k]) {
            setLocalErrors(prev => {
                const next = { ...prev };
                delete next[k];
                return next;
            });
        }
    }, [localErrors]);

    const validateStep1 = () => {
        const errs: Record<string, string> = {};
        if (!role) errs.role = 'Veuillez choisir un profil.';
        if (role === 'ARTISAN') {
            if (!domaine) errs.domaine = 'Veuillez choisir votre domaine.';
            if (domaine === 'autre' && !customDomaine.trim()) errs.customDomaine = 'Précisez votre domaine.';
        }
        
        if (Object.keys(errs).length > 0) {
            setLocalErrors(errs);
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        const errs: Record<string, string> = {};
        if (!form.prenom.trim()) errs.prenom = 'Prénom requis';
        if (!form.nom.trim()) errs.nom = 'Nom requis';
        if (role === 'ARTISAN' && artisanType === 'COMPANY' && !form.nomEntreprise.trim()) errs.nomEntreprise = 'Nom de l\'entreprise requis';
        if (!form.email.includes('@')) errs.email = 'Email invalide';
        if (!form.telephone.trim()) errs.telephone = 'Téléphone requis';
        if (form.password.length < 6) errs.password = 'Min. 6 caractères';
        if (form.password !== form.confirm) errs.confirm = 'Les mots de passe ne correspondent pas';
        if (!agreed) errs.agreed = 'Veuillez accepter les conditions';
        
        if (Object.keys(errs).length > 0) {
            setLocalErrors(errs);
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setLocalErrors({});
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
        setLocalErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep2()) return;

        globalDispatch({ type: "REGISTER_START" });

        try {
            const userData = {
                prenom: form.prenom,
                nom: form.nom,
                nomEntreprise: form.nomEntreprise,
                email: form.email,
                telephone: form.telephone,
                ville: form.ville,
                password: form.password,
                role: role,
                artisanType: role === "ARTISAN" ? artisanType : null,
                domaine: role === "ARTISAN"
                ? (domaine === "autre" ? customDomaine : domaine)
                : null
            };

            const res = await axios.post("/api/register", userData);

            if (res.data?.success) {
                globalDispatch({
                    type: "REGISTER_SUCCESS",
                    payload: res.data.user
                });
            } else {
                globalDispatch({
                    type: "REGISTER_FAILURE",
                    payload: res.data?.message || "Erreur lors de l'inscription."
                });
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "Erreur serveur lors de l'inscription.";
            globalDispatch({
                type: "REGISTER_FAILURE",
                payload: message
            });
        }
    };

    if (!mounted) return null;

    if (globalState.isSuccess) {
        return (
            <SuccessFlow
                prenom={form.prenom}
                nom={form.nom}
                email={form.email}
                role={role}
                domaine={domaine}
                customDomaine={customDomaine}
                nomEntreprise={form.nomEntreprise}
                artisanType={artisanType}
            />
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.logoWrap}>
                {!logoError ? (
                  <Link href={'/'}>
                      <img src="/assets/media/images/logo.png" alt="Logo" onError={() => setLogoError(true)} />
                  </Link>
                ) : (
                    <Link href="/" className={styles.logoFallback}>
                        <div className={styles.logoIcon}><Building2 size={18} color="white" /></div>
                        <span className={styles.logoText}>bricole<span>.ma</span></span>
                    </Link>
                )}
            </div>

            <div className={styles.left}>
                <div className={styles.zelijWrapper}>
                    <div className={styles.zelijBg}/><div className={styles.zelijOverlay}/><div className={styles.glowOrb}/><div className={styles.glowOrb2}/>
                </div>
                <div className={`${styles.floatingBadge} ${styles.animateIn} ${styles.delay3}`}>
                    <CheckCircle2 size={16} /> Inscription Gratuite
                </div>
                <div className={`${styles.floatingBadge2} ${styles.animateIn} ${styles.delay4}`}>
                    <User size={15} /> +12K Membres
                </div>
                <div className={`${styles.leftInner} ${styles.animateUp} ${styles.delay1}`}>
                    <div className={styles.glassCard}>
                        <h1 className={styles.leftTagline}>Rejoignez <span>Bricole.ma</span></h1>
                        <p className={styles.leftSub}>Créez votre compte gratuitement et accédez à notre réseau d'artisans.</p>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{
                                    width: '34px', height: '34px', borderRadius: '50%',
                                    border: '2px solid white',
                                    background: `hsl(${210 + i * 12}, 60%, ${70 + i * 3}%)`,
                                    marginLeft: i > 1 ? '-10px' : '0',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}/>
                            ))}
                            <span style={{ marginLeft: '14px', fontSize: '0.83rem', fontWeight: '600', color: '#334155' }}>
                                +12K Professionnels
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.right}>
                {globalState.error && (
                    <div className={styles.errorBanner}>
                        <CheckCircle2 size={18} />
                        <span>{globalState.error}</span>
                    </div>
                )}
                <div className={styles.animateUp}>
                    <div className={styles.stepLabel}>Étape <span>{step}</span> sur 2</div>
                    <div className={styles.progressWrap}>
                        <div className={`${styles.progressStep} ${step >= 1 ? (step > 1 ? styles.done : styles.active) : ''}`}/>
                        <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}/>
                    </div>
                </div>

                {step === 1 && (
                    <div className={styles.animateUp}>
                        <div className={styles.formHeader}>
                            <p className={styles.formTitle}>Quel est votre profil ?</p>
                            <p className={styles.formDesc}>Choisissez le type de compte qui correspond à votre activité.</p>
                        </div>

                        <div className={styles.roleGrid}>
                            <div className={`${styles.roleCard} ${role === 'CLIENT' ? styles.selected : ''}`} onClick={() => setRole('CLIENT')}>
                                <div className={styles.roleCheck}><CheckCircle2 size={11} color="white" /></div>
                                <div className={styles.roleIconWrap}><User size={24} color={role === 'CLIENT' ? 'white' : '#64748B'} /></div>
                                <div className={styles.roleName}>Client</div>
                                <div className={styles.roleDesc}>Je cherche des artisans qualifiés</div>
                            </div>

                            <div className={`${styles.roleCard} ${role === 'ARTISAN' ? styles.selected : ''}`} onClick={() => setRole('ARTISAN')}>
                                <div className={styles.roleCheck}><CheckCircle2 size={11} color="white" /></div>
                                <div className={styles.roleIconWrap}><Wrench size={24} color={role === 'ARTISAN' ? 'white' : '#64748B'} /></div>
                                <div className={styles.roleName}>Professionnel</div>
                                <div className={styles.roleDesc}>Je propose mes services</div>
                            </div>
                        </div>

                        {localErrors.role && <p className={styles.fieldError}>{localErrors.role}</p>}

                        {role === 'ARTISAN' && (
                            <div className={styles.artisanExtras + " " + styles.animateIn}>
                                <div className={styles.typeSelectorLabel}>
                                    <Info size={14} />
                                    <span>Vous exercez en tant que :</span>
                                </div>
                                <div className={styles.typeSelector}>
                                    <div 
                                        className={`${styles.typeOption} ${artisanType === 'INDIVIDUAL' ? styles.typeActive : ''}`} 
                                        onClick={() => setArtisanType('INDIVIDUAL')}
                                    >
                                        <div className={styles.typeRadio} />
                                        <div className={styles.typeInfo}>
                                            <span className={styles.typeTitle}>Individuel</span>
                                            <span className={styles.typeDescription}>Artisan indépendant ou auto-entrepreneur</span>
                                        </div>
                                    </div>
                                    <div 
                                        className={`${styles.typeOption} ${artisanType === 'COMPANY' ? styles.typeActive : ''}`} 
                                        onClick={() => setArtisanType('COMPANY')}
                                    >
                                        <div className={styles.typeRadio} />
                                        <div className={styles.typeInfo}>
                                            <span className={styles.typeTitle}>Entreprise</span>
                                            <span className={styles.typeDescription}>SARL, Auto-entreprise avec marque, etc.</span>
                                        </div>
                                    </div>
                                </div>

                                <label className={styles.domaineLabel}>Votre domaine d'expertise *</label>
                                <div className={styles.domaineGrid}>
                                    {DOMAINES.map(d => (
                                        <div key={d.key} className={`${styles.domaineChip} ${domaine === d.key ? styles.selected : ''}`} onClick={() => setDomaine(d.key)}>
                                            <span className={styles.domaineIcon}>{d.icon}</span>
                                            <span className={styles.domaineName}>{d.label}</span>
                                            <div className={styles.domaineDot} />
                                        </div>
                                    ))}
                                </div>
                                
                                {domaine === 'autre' && (
                                    <div className={styles.field + " " + styles.animateIn} style={{ marginTop: '15px' }}>
                                        <div className={styles.inputWrap}>
                                            <Plus size={18} className={styles.inputIcon} />
                                            <input 
                                                placeholder="Précisez votre métier..." 
                                                value={customDomaine} 
                                                onChange={(e) => setCustomDomaine(e.target.value)} 
                                            />
                                        </div>
                                        {localErrors.customDomaine && <p className={styles.fieldError}>{localErrors.customDomaine}</p>}
                                    </div>
                                )}
                                {localErrors.domaine && <p className={styles.fieldError}>{localErrors.domaine}</p>}
                            </div>
                        )}

                        <button className={styles.btnSubmit} onClick={handleNext}>Continuer →</button>
                        <div className={styles.loginDivider}>Déjà un compte ?<Link href="/login">Se connecter</Link></div>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.animateUp}>
                        <button className={styles.btnBack} onClick={handleBack}>
                            <ArrowLeft size={16} /> Retour
                        </button>

                        <div className={styles.formHeader}>
                            <p className={styles.formTitle}>Vos informations</p>
                            <p className={styles.formDesc}>Remplissez vos informations pour finaliser votre inscription.</p>
                        </div>

                        <form onSubmit={handleSubmit} autoComplete="off">
                            {role === 'ARTISAN' && artisanType === 'COMPANY' && (
                                <div className={styles.field + " " + styles.animateIn}>
                                    <label>Nom de l'entreprise *</label>
                                    <div className={`${styles.inputWrap} ${localErrors.nomEntreprise ? styles.inputError : ''}`}>
                                        <Building2 className={styles.inputIcon} size={18} />
                                        <input 
                                            placeholder="Ex: Bricole Maroc SARL" 
                                            value={form.nomEntreprise} 
                                            onChange={e => updateForm('nomEntreprise', e.target.value)} 
                                            autoComplete="organization"
                                        />
                                    </div>
                                    {localErrors.nomEntreprise && <p className={styles.fieldError}>{localErrors.nomEntreprise}</p>}
                                </div>
                            )}

                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label>Prénom *</label>
                                    <div className={`${styles.inputWrap} ${localErrors.prenom ? styles.inputError : ''}`}>
                                        <User className={styles.inputIcon} size={18} />
                                        <input placeholder="Mohammed" value={form.prenom} onChange={e => updateForm('prenom', e.target.value)} autoComplete="given-name" />
                                    </div>
                                    {localErrors.prenom && <p className={styles.fieldError}>{localErrors.prenom}</p>}
                                </div>
                                <div className={styles.field}>
                                    <label>Nom *</label>
                                    <div className={`${styles.inputWrap} ${localErrors.nom ? styles.inputError : ''}`}>
                                        <User className={styles.inputIcon} size={18} />
                                        <input placeholder="Benali" value={form.nom} onChange={e => updateForm('nom', e.target.value)} autoComplete="family-name" />
                                    </div>
                                    {localErrors.nom && <p className={styles.fieldError}>{localErrors.nom}</p>}
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Adresse e-mail *</label>
                                <div className={`${styles.inputWrap} ${localErrors.email ? styles.inputError : ''}`}>
                                    <Mail className={styles.inputIcon} size={18} />
                                    <input type="email" placeholder="contact@exemple.ma" value={form.email} onChange={e => updateForm('email', e.target.value)} autoComplete="email" />
                                </div>
                                {localErrors.email && <p className={styles.fieldError}>{localErrors.email}</p>}
                            </div>

                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label>Téléphone *</label>
                                    <div className={`${styles.inputWrap} ${localErrors.telephone ? styles.inputError : ''}`}>
                                        <Phone className={styles.inputIcon} size={18} />
                                        <input placeholder="06 XX XX XX XX" value={form.telephone} onChange={e => updateForm('telephone', e.target.value)} autoComplete="tel" />
                                    </div>
                                    {localErrors.telephone && <p className={styles.fieldError}>{localErrors.telephone}</p>}
                                </div>
                                <div className={styles.field}>
                                    <label>Ville</label>
                                    <div className={styles.inputWrap}>
                                        <MapPin className={styles.inputIcon} size={18} />
                                        <input placeholder="Casablanca" value={form.ville} onChange={e => updateForm('ville', e.target.value)} autoComplete="address-level2" />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Mot de passe *</label>
                                <div className={`${styles.inputWrap} ${localErrors.password ? styles.inputError : ''}`}>
                                    <Lock className={styles.inputIcon} size={18} />
                                    <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => updateForm('password', e.target.value)} autoComplete="new-password" />
                                    <button type="button" className={styles.toggleEye} onClick={() => setShowPw(!showPw)}>
                                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {form.password && (
                                    <div className={styles.pwStrengthWrap}>
                                        <div className={styles.pwStrengthBar}>
                                            {[1, 2, 3].map(i => <div key={i} className={`${styles.pwBarSeg} ${i <= pwStrength.level ? pwStrength.cls : ''}`}/>)}
                                        </div>
                                        <span className={`${styles.pwStrengthText} ${pwStrength.cls}`}>{pwStrength.label}</span>
                                    </div>
                                )}
                                {localErrors.password && <p className={styles.fieldError}>{localErrors.password}</p>}
                            </div>

                            <div className={styles.field}>
                                <label>Confirmer le mot de passe *</label>
                                <div className={`${styles.inputWrap} ${localErrors.confirm ? styles.inputError : ''}`}>
                                    <Lock className={styles.inputIcon} size={18} />
                                    <input type={showPw2 ? 'text' : 'password'} placeholder="••••••••" value={form.confirm} onChange={e => updateForm('confirm', e.target.value)} autoComplete="new-password" />
                                    <button type="button" className={styles.toggleEye} onClick={() => setShowPw2(!showPw2)}>
                                        {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {localErrors.confirm && <p className={styles.fieldError}>{localErrors.confirm}</p>}
                            </div>

                            <label className={styles.checkWrap}>
                                <input type="checkbox" checked={agreed} onChange={e => {
                                    setAgreed(e.target.checked);
                                    if (localErrors.agreed) {
                                        setLocalErrors(prev => {
                                            const next = { ...prev };
                                            delete next.agreed;
                                            return next;
                                        });
                                    }
                                }}/>
                                <span className={styles.checkBox}><CheckCircle2 size={11} color="white" /></span>
                                <span className={styles.checkLabel}>J'accepte les conditions d'utilisation</span>
                            </label>
                            {localErrors.agreed && <p className={styles.fieldError}>{localErrors.agreed}</p>}

                            <button type="submit" className={`${styles.btnSubmit} ${globalState.loading ? styles.loading : ''}`} disabled={globalState.loading}>
                                {globalState.loading ? 'Création du compte...' : 'Créer mon compte →'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
