'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PixelFooter.module.css';

export default function PixelFooter() {
    const [time, setTime] = useState('00:00:00');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            setTime(`${h}:${m}:${s}`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.sysInfoRow}>
                    ★ VISIONARY BURMA v1.0
                </div>
                <span className="font-pixel text-dim" style={{ fontSize: 8 }}>
                    Made by <a href="https://akp-dev.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#39ff14', textDecoration: 'none' }}>AKPAING</a>
                </span>
                <span className="font-pixel text-accent" style={{ fontSize: 8 }}>
                    SYS_TIME: {time}
                </span>
            </div>
        </footer>
    );
}
