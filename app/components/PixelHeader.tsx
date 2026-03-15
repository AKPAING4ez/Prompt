'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PixelHeader.module.css';

const TITLE = 'VISIONARY BURMA';

export default function PixelHeader() {
    const [displayTitle, setDisplayTitle] = useState('');
    const [cursor, setCursor] = useState(true);
    const idx = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (idx.current < TITLE.length) {
                setDisplayTitle(TITLE.slice(0, idx.current + 1));
                idx.current++;
            } else {
                clearInterval(interval);
            }
        }, 80);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const blink = setInterval(() => setCursor(c => !c), 530);
        return () => clearInterval(blink);
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.topBar}>
                <div className={styles.dot} style={{ background: '#ff2d78' }} />
                <div className={styles.dot} style={{ background: '#ffe000' }} />
                <div className={styles.dot} style={{ background: '#39ff14' }} />
                <span className={styles.windowLabel}>SYSTEM: AI_STUDIO_v1.0</span>
            </div>
            <div className={styles.titleWrap}>
                <div className={styles.preTitle}>
                    <span className="font-pixel text-accent" style={{ fontSize: 9 }}>★ LEARNER PLATFORM ★</span>
                </div>
                <h1 className={styles.title}>
                    {displayTitle}
                    <span className={styles.cursor} style={{ opacity: cursor ? 1 : 0 }}>█</span>
                </h1>
                <p className={styles.subtitle}>
                    Upload your prompt • Generate images • Create videos • All in one place
                </p>
                <div className={styles.stats}>
                    <span className={styles.stat}><span className="text-accent">▶</span> PROMPTS: UNLIMITED</span>
                    <span className={styles.stat}><span className="text-blue">▶</span> IMAGE GEN: ACTIVE</span>
                    <span className={styles.stat}><span className="text-accent2">▶</span> VIDEO GEN: ACTIVE</span>
                </div>
            </div>
        </header>
    );
}
