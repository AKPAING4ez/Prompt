'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

interface PromptRow {
    id: string;
    line1: string;
    line2: string;
    line2Color: string;
    type: string;
    aspectRatio: string;
    prompt: string;
    image: string;
    createdAt: string;
}

// ─── Login Form ─────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        if (res.ok) {
            onLogin();
        } else {
            setError('Incorrect password. Try again.');
        }
        setLoading(false);
    };

    return (
        <div className={styles.loginWrap}>
            <div className={styles.loginBox}>
                <div className={styles.loginHeader}>
                    <div className={styles.dots}>
                        <span style={{ background: '#ff2d78' }} />
                        <span style={{ background: '#ffe000' }} />
                        <span style={{ background: '#39ff14' }} />
                    </div>
                    <span className={styles.loginWindowTitle}>ADMIN_AUTH.exe</span>
                </div>
                <div className={styles.loginBody}>
                    <div className={styles.loginIcon}>🔐</div>
                    <h1 className={styles.loginTitle}>ADMIN ACCESS</h1>
                    <p className={styles.loginSub}>VISIONARY BURMA — Admin Panel</p>
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor="admin-password">PASSWORD</label>
                            <input
                                id="admin-password"
                                type="password"
                                className={styles.input}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter admin password..."
                                autoFocus
                            />
                        </div>
                        {error && <p className={styles.errorMsg}>⚠ {error}</p>}
                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.btnGreen}`}
                            disabled={loading || !password}
                        >
                            {loading ? '▓▓▓ AUTHENTICATING...' : '▶ LOGIN'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────
const LINE2_COLORS = [
    { label: 'Pink', value: '#ff2d78' },
    { label: 'Green', value: '#39ff14' },
    { label: 'Yellow', value: '#ffe000' },
    { label: 'Cyan', value: '#00d4ff' },
    { label: 'Orange', value: '#ff6b35' },
    { label: 'White', value: '#ffffff' },
];

function AdminPanel({ onLogout }: { onLogout: () => void }) {
    const [prompts, setPrompts] = useState<PromptRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Form state
    const [line1, setLine1] = useState('');
    const [line2, setLine2] = useState('');
    const [line2Color, setLine2Color] = useState('#ff2d78');
    const [type, setType] = useState<'image' | 'video' | 'both'>('image');
    const [aspectRatio, setAspectRatio] = useState('9:16');
    const [promptText, setPromptText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const fetchPrompts = async () => {
        setLoading(true);
        const res = await fetch('/api/prompts');
        const data = await res.json();
        setPrompts(data);
        setLoading(false);
    };

    useEffect(() => { fetchPrompts(); }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = ev => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        if (!imageFile) {
            setErrorMsg('Please select a cover image.');
            return;
        }

        setSaving(true);

        // 1. Upload image to Cloudinary
        setUploading(true);
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        setUploading(false);

        if (!uploadRes.ok) {
            setErrorMsg('Image upload failed. Check your Cloudinary credentials.');
            setSaving(false);
            return;
        }

        const { url } = await uploadRes.json();

        // 2. Save prompt to database
        const createRes = await fetch('/api/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line1, line2, line2Color, type, aspectRatio, prompt: promptText, image: url }),
        });

        if (createRes.ok) {
            setSuccessMsg('✓ Prompt saved successfully!');
            // Reset form
            setLine1(''); setLine2(''); setLine2Color('#ff2d78');
            setType('image'); setAspectRatio('9:16'); setPromptText('');
            setImageFile(null); setImagePreview(null);
            if (fileRef.current) fileRef.current.value = '';
            fetchPrompts();
        } else {
            setErrorMsg('Failed to save prompt. Check your database connection.');
        }

        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this prompt? This cannot be undone.')) return;
        setDeleting(id);
        await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
        await fetchPrompts();
        setDeleting(null);
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        onLogout();
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerLeft}>
                        <div className={styles.dots}>
                            <span style={{ background: '#ff2d78' }} />
                            <span style={{ background: '#ffe000' }} />
                            <span style={{ background: '#39ff14' }} />
                        </div>
                        <span className={styles.headerTitle}>VISIONARY BURMA — ADMIN PANEL</span>
                    </div>
                    <div className={styles.headerRight}>
                        <a href="/" className={`${styles.btn} ${styles.btnBlue} ${styles.btnSm}`}>
                            ← VIEW GALLERY
                        </a>
                        <button
                            onClick={handleLogout}
                            className={`${styles.btn} ${styles.btnPink} ${styles.btnSm}`}
                        >
                            ⏻ LOGOUT
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.layout}>
                    {/* ─── LEFT: Add Prompt Form ─── */}
                    <section className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>➕ ADD NEW PROMPT</h2>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* LEFT COLUMN: Image Upload & Preview */}
                            <div className={styles.leftColumn}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>COVER IMAGE *</label>
                                    <div
                                        className={styles.uploadZone}
                                        style={{ aspectRatio: aspectRatio.replace(':', '/') }}
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                                        ) : (
                                            <div className={styles.uploadPlaceholder}>
                                                <span className={styles.uploadIcon}>🖼</span>
                                                <span className={styles.uploadText}>Click to upload</span>
                                                <span className={styles.uploadHint}>{aspectRatio} layout</span>
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className={styles.uploadingOverlay}>
                                                <span>UPLOADING TO CLOUDINARY...</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                        id="image-file-input"
                                    />
                                </div>

                                {/* Preview badge */}
                                {(line1 || line2) && (
                                    <div className={styles.cardPreview} style={{ marginTop: '16px' }}>
                                        <span className={styles.label}>CARD PREVIEW</span>
                                        <div className={styles.previewCard} style={{ backgroundImage: imagePreview ? `url(${imagePreview})` : undefined, aspectRatio: aspectRatio.replace(':', '/') }}>
                                            {!imagePreview && <div className={styles.previewNoImg}>No image</div>}
                                            <div className={styles.previewOverlay} />
                                            <div className={styles.previewTitle}>
                                                <span className={styles.previewLine1}>{line1 || 'TITLE'}</span>
                                                <span className={styles.previewLine2} style={{ color: line2Color }}>{line2 || 'SUBTITLE'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN: Text fields */}
                            <div className={styles.rightColumn}>
                                {/* Title Line 1 */}
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label} htmlFor="line1-input">TITLE LINE 1 *</label>
                                    <input
                                        id="line1-input"
                                        className={styles.input}
                                        value={line1}
                                        onChange={e => setLine1(e.target.value)}
                                        placeholder="e.g. TUTORIAL"
                                        required
                                        maxLength={20}
                                    />
                                </div>

                                {/* Title Line 2 + Color */}
                                <div className={styles.fieldRow}>
                                    <div className={styles.fieldGroup} style={{ flex: 1 }}>
                                        <label className={styles.label} htmlFor="line2-input">TITLE LINE 2 *</label>
                                        <input
                                            id="line2-input"
                                            className={styles.input}
                                            value={line2}
                                            onChange={e => setLine2(e.target.value)}
                                            placeholder="e.g. SPIDERMAN"
                                            required
                                            maxLength={20}
                                        />
                                    </div>
                                    <div className={styles.fieldGroup} style={{ width: 120 }}>
                                        <label className={styles.label}>LINE 2 COLOR</label>
                                        <div className={styles.colorPicker}>
                                            {LINE2_COLORS.map(c => (
                                                <button
                                                    key={c.value}
                                                    type="button"
                                                    className={`${styles.colorSwatch} ${line2Color === c.value ? styles.colorSwatchActive : ''}`}
                                                    style={{ background: c.value }}
                                                    onClick={() => setLine2Color(c.value)}
                                                    title={c.label}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Type and Ratio */}
                                <div className={styles.fieldRow}>
                                    <div className={styles.fieldGroup} style={{ flex: 1 }}>
                                        <label className={styles.label}>TYPE *</label>
                                        <div className={styles.typeRow}>
                                            {(['image', 'video', 'both'] as const).map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ''}`}
                                                    onClick={() => setType(t)}
                                                >
                                                    {t === 'image' ? '🖼 IMAGE' : t === 'video' ? '🎬' : '✦ BOTH'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.fieldGroup} style={{ flex: 1 }}>
                                        <label className={styles.label}>RATIO *</label>
                                        <div className={styles.typeRow}>
                                            {(['9:16', '16:9', '1:1'] as const).map(r => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    className={`${styles.typeBtn} ${aspectRatio === r ? styles.typeBtnActive : ''}`}
                                                    onClick={() => setAspectRatio(r)}
                                                >
                                                    {r === '9:16' ? 'PORTRAIT' : r === '16:9' ? 'LANDSCAPE' : 'SQUARE'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Prompt Text */}
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label} htmlFor="prompt-textarea">
                                        PROMPT TEXT * ({promptText.length} chars)
                                    </label>
                                    <textarea
                                        id="prompt-textarea"
                                        className={styles.textarea}
                                        value={promptText}
                                        onChange={e => setPromptText(e.target.value)}
                                        placeholder="Write the full AI prompt here..."
                                        rows={6}
                                        required
                                    />
                                </div>

                                {/* Messages */}
                                {successMsg && <p className={styles.successMsg} style={{ marginTop: '16px' }}>{successMsg}</p>}
                                {errorMsg && <p className={styles.errorMsg} style={{ marginTop: '16px' }}>⚠ {errorMsg}</p>}

                                <button
                                    type="submit"
                                    className={`${styles.btn} ${styles.btnGreen}`}
                                    style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                                    disabled={saving || !line1 || !line2 || !promptText}
                                >
                                    {saving ? '▓▓▓ SAVING...' : '💾 SAVE PROMPT'}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* ─── RIGHT: Existing Prompts ─── */}
                    <section className={styles.listSection}>
                        <h2 className={styles.sectionTitle}>
                            📋 EXISTING PROMPTS
                            <span className={styles.countBadge}>{prompts.length}</span>
                        </h2>

                        {loading ? (
                            <div className={styles.loadingMsg}>Loading prompts...</div>
                        ) : prompts.length === 0 ? (
                            <div className={styles.emptyMsg}>No prompts yet. Add your first one!</div>
                        ) : (
                            <div className={styles.promptList}>
                                {prompts.map(p => (
                                    <div key={p.id} className={styles.promptItem}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p.image} alt={p.line1} className={styles.promptThumb} />
                                        <div className={styles.promptMeta}>
                                            <span className={styles.promptTitle}>
                                                {p.line1}{' '}
                                                <span style={{ color: p.line2Color }}>{p.line2}</span>
                                            </span>
                                            <span className={styles.promptType}>{p.type.toUpperCase()}</span>
                                            <span className={styles.promptSnippet}>
                                                {p.prompt.slice(0, 80)}...
                                            </span>
                                        </div>
                                        <button
                                            className={`${styles.btn} ${styles.btnPink} ${styles.btnSm} ${styles.deleteBtn}`}
                                            onClick={() => handleDelete(p.id)}
                                            disabled={deleting === p.id}
                                        >
                                            {deleting === p.id ? '...' : '🗑 DEL'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    // Check if already logged in on mount
    useEffect(() => {
        fetch('/api/prompts')
            .then(res => {
                // If the API is accessible we try a quick admin check
                setAuthenticated(false); // default to needing login; it's cookie-checked per action
            })
            .catch(() => setAuthenticated(false));
    }, []);

    if (authenticated === null) {
        return <div className={styles.splash}>INITIALIZING...</div>;
    }

    if (!authenticated) {
        return <LoginForm onLogin={() => setAuthenticated(true)} />;
    }

    return <AdminPanel onLogout={() => setAuthenticated(false)} />;
}
