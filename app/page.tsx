'use client';

import { useEffect, useState } from 'react';
import PromptCard, { type PromptData } from './components/PromptCard';
import PromptModal from './components/PromptModal';
import styles from './page.module.css';

const CATEGORIES = ['ALL', 'IMAGE', 'VIDEO', 'IMAGE + VIDEO'];

export default function GalleryPage() {
    const [prompts, setPrompts] = useState<PromptData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        fetch('/api/prompts')
            .then(res => res.json())
            .then((data: Array<{
                id: string;
                line1: string;
                line2: string;
                line2Color: string;
                type: string;
                aspectRatio: string;
                prompt: string;
                image: string;
            }>) => {
                // Map from DB shape to PromptData shape
                const mapped: PromptData[] = data.map(p => ({
                    id: p.id,
                    line1: p.line1,
                    line2: p.line2,
                    line2Color: p.line2Color,
                    type: p.type as 'image' | 'video' | 'both',
                    aspectRatio: p.aspectRatio,
                    prompt: p.prompt,
                    image: p.image,
                }));
                setPrompts(mapped);
            })
            .catch(err => console.error('Failed to fetch prompts', err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = prompts.filter(p => {
        const matchCat =
            activeCategory === 'ALL' ||
            (activeCategory === 'IMAGE' && p.type === 'image') ||
            (activeCategory === 'VIDEO' && p.type === 'video') ||
            (activeCategory === 'IMAGE + VIDEO' && p.type === 'both');
        const matchSearch =
            !search.trim() ||
            `${p.line1} ${p.line2}`.toLowerCase().includes(search.toLowerCase()) ||
            p.prompt.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className={styles.page}>
            {/* ─── Header ─── */}
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    {/* Logo + Tagline */}
                    <div className={styles.logoRow}>
                        <span className={styles.pixelDot} style={{ color: '#39ff14' }}>■</span>
                        <span className={styles.pixelDot} style={{ color: '#ff2d78' }}>■</span>
                        <span className={styles.pixelDot} style={{ color: '#ffe000' }}>■</span>
                        <span className={styles.logoIcon}>✦</span>
                        <span className={styles.logoText}>VISIONARY BURMA</span>
                    </div>
                    <p className={styles.tagline}>
                        Prompt gallery for learners — browse, copy &amp; create
                    </p>

                    {/* Desktop admin link */}
                    <a href="/admin" className={styles.adminLink}>
                        ⚙ ADMIN
                    </a>

                    {/* Hamburger button (mobile only) */}
                    <button
                        className={styles.hamburger}
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle menu"
                        id="hamburger-btn"
                    >
                        <span className={`${styles.bar} ${menuOpen ? styles.barTop : ''}`} />
                        <span className={`${styles.bar} ${menuOpen ? styles.barMid : ''}`} />
                        <span className={`${styles.bar} ${menuOpen ? styles.barBot : ''}`} />
                    </button>
                </div>

                {/* Mobile nav drawer */}
                {menuOpen && (
                    <nav className={styles.mobileMenu}>
                        <a href="/admin" className={styles.mobileMenuItem} onClick={() => setMenuOpen(false)}>
                            ⚙ ADMIN PANEL
                        </a>
                        <div className={styles.mobileMenuDivider} />
                        <span className={styles.mobileMenuLabel}>FILTER</span>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`${styles.mobileMenuFilter} ${activeCategory === cat ? styles.mobileMenuFilterActive : ''}`}
                                onClick={() => { setActiveCategory(cat); setMenuOpen(false); }}
                            >
                                {cat}
                            </button>
                        ))}
                    </nav>
                )}
            </header>

            {/* ─── Main ─── */}
            <main className={styles.main}>
                <h1 className={styles.title}>PROMPT GALLERY</h1>

                {/* Filter + Search row */}
                <div className={styles.controlRow}>
                    <div className={styles.filters}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
                                onClick={() => setActiveCategory(cat)}
                                id={`filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Count */}
                <p className={styles.countText}>
                    {loading ? 'Loading...' : `${filtered.length} prompt${filtered.length !== 1 ? 's' : ''}`}
                </p>

                {/* Grid */}
                <div className={styles.grid}>
                    {loading ? (
                        <div className={styles.empty}>
                            <span>Loading prompts...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className={styles.empty}>
                            <span>No prompts yet. <a href="/admin" style={{ color: '#39ff14' }}>Add from admin →</a></span>
                        </div>
                    ) : (
                        filtered.map(p => (
                            <PromptCard
                                key={p.id}
                                data={p}
                                onClick={() => setSelectedPrompt(p)}
                            />
                        ))
                    )}
                </div>
            </main>

            {/* ─── Footer ─── */}
            <footer className={styles.footer}>
                <span>★ VISIONARY BURMA — LEARNER PLATFORM</span>
                <span>
                    Made by <a href="https://akp-dev.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#39ff14', textDecoration: 'none' }}>AKPAING</a> © {new Date().getFullYear()}
                </span>
            </footer>

            {/* ─── Modal ─── */}
            <PromptModal
                data={selectedPrompt}
                onClose={() => setSelectedPrompt(null)}
            />
        </div>
    );
}
