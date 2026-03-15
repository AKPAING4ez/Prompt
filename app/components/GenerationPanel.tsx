'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './GenerationPanel.module.css';

type PanelType = 'image' | 'video';
type Status = 'idle' | 'loading' | 'done';

interface Props {
    type: PanelType;
    status: Status;
    prompt: string;
    progress: number;
}

const PIXEL_ART_PLACEHOLDERS: Record<PanelType, string[]> = {
    image: [
        '⠀⠀⠀⠀⠀⣠⣤⣤⣤⣄⠀⠀⠀⠀',
        '⠀⠀⠀⢠⣾⣿⣿⣿⣿⣿⣷⡄⠀⠀',
        '⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀',
        '⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀',
        '⠀⠀⠀⠀⠈⠻⢿⣿⡿⠛⠁⠀⠀⠀',
    ],
    video: [
        '⠀⠀⠀▄█████████▄⠀⠀⠀',
        '⠀⠀▄█████████████▄⠀',
        '⠀⠀████ ▶ PLAY ████⠀',
        '⠀⠀▀█████████████▀⠀',
        '⠀⠀⠀▀█████████▀⠀⠀⠀',
    ],
};

const GENERATION_LOG_MSGS: Record<PanelType, string[]> = {
    image: [
        'Initializing render engine...',
        'Parsing prompt tokens...',
        'Building latent space...',
        'Applying diffusion steps...',
        'Upscaling pixels...',
        'Applying style transfer...',
        'Finalizing output...',
        'Image ready!',
    ],
    video: [
        'Initializing video codec...',
        'Parsing scene description...',
        'Generating keyframes...',
        'Interpolating motion...',
        'Rendering frames...',
        'Encoding audio stream...',
        'Finalizing video...',
        'Video ready!',
    ],
};

export default function GenerationPanel({ type, status, prompt, progress }: Props) {
    const [logs, setLogs] = useState<string[]>([]);
    const [visiblePlaceholder, setVisiblePlaceholder] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);

    const isImage = type === 'image';
    const panelClass = isImage ? 'pixel-panel' : 'pixel-panel-pink';
    const accentColor = isImage ? 'var(--color-accent)' : 'var(--color-accent2)';
    const progressColor = isImage ? '#39ff14' : '#ff2d78';
    const borderColor = isImage ? 'var(--color-border)' : 'var(--color-accent2)';

    useEffect(() => {
        if (status === 'loading') {
            setLogs([]);
            setVisiblePlaceholder(false);
            const msgs = GENERATION_LOG_MSGS[type];
            let i = 0;
            const interval = setInterval(() => {
                if (i < msgs.length) {
                    setLogs(prev => [...prev, msgs[i]]);
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 700);
            return () => clearInterval(interval);
        }
        if (status === 'done') {
            setVisiblePlaceholder(true);
        }
        if (status === 'idle') {
            setLogs([]);
            setVisiblePlaceholder(false);
        }
    }, [status, type]);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className={`${panelClass} ${styles.panel}`}>
            <div className={styles.panelHeader} style={{ borderColor }}>
                <span className={styles.panelIcon}>{isImage ? '🖼' : '🎬'}</span>
                <span className="font-pixel" style={{ fontSize: 10, color: accentColor }}>
                    {isImage ? 'IMAGE OUTPUT' : 'VIDEO OUTPUT'}
                </span>
                <span className={styles.statusBadge} data-status={status}>
                    {status === 'idle' && '○ IDLE'}
                    {status === 'loading' && '◉ PROCESSING'}
                    {status === 'done' && '● DONE'}
                </span>
            </div>

            <div className={styles.content}>
                {status === 'idle' && (
                    <div className={styles.idleState}>
                        <div className={styles.pixelArt} style={{ color: accentColor }}>
                            {PIXEL_ART_PLACEHOLDERS[type].map((line, i) => (
                                <div key={i} className={styles.pixelArtLine}>{line}</div>
                            ))}
                        </div>
                        <p className={`${styles.idleText} font-pixel`}>
                            AWAITING{'\n'}PROMPT
                        </p>
                        <div className={styles.idleHint}>
                            Enter a prompt and click{' '}
                            <strong style={{ color: accentColor }}>
                                {isImage ? 'GENERATE IMAGE' : 'GENERATE VIDEO'}
                            </strong>
                        </div>
                    </div>
                )}

                {status === 'loading' && (
                    <div className={styles.loadingState}>
                        <div className={styles.progressSection}>
                            <div className={styles.progressLabel}>
                                <span className="font-pixel" style={{ fontSize: 9, color: accentColor }}>
                                    {isImage ? 'RENDERING IMAGE' : 'ENCODING VIDEO'}
                                </span>
                                <span className="font-pixel" style={{ fontSize: 9, color: 'var(--color-text-dim)' }}>
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div
                                className="pixel-progress-bar-outer"
                                style={{ borderColor: accentColor }}
                            >
                                <div
                                    className="pixel-progress-bar-inner"
                                    style={{
                                        width: `${progress}%`,
                                        background: progressColor,
                                        boxShadow: `0 0 10px ${progressColor}`
                                    }}
                                />
                            </div>
                            <div className={styles.progressPixels}>
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <span
                                        key={i}
                                        className={styles.progressPixel}
                                        style={{
                                            background: i < Math.floor(progress / 5) ? progressColor : '#1a1a2e',
                                            animationDelay: `${i * 0.05}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.logSection} ref={logRef}>
                            {logs.map((log, i) => (
                                <div key={i} className={styles.logLine}>
                                    <span style={{ color: accentColor }}>{'>'}</span>
                                    <span className="text-dim">{log}</span>
                                    {i === logs.length - 1 && (
                                        <span className={styles.logCursor} style={{ color: accentColor }}>█</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {status === 'done' && (
                    <div className={styles.doneState}>
                        <div
                            className={styles.resultBox}
                            style={{ borderColor, animation: visiblePlaceholder ? `pixel-float 3s ease-in-out infinite` : 'none' }}
                        >
                            {isImage ? (
                                <div className={styles.imageResult}>
                                    <div className={styles.mockImageGrid}>
                                        {Array.from({ length: 64 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={styles.mockPixel}
                                                style={{
                                                    background: getPixelColor(i, prompt),
                                                    animationDelay: `${(i * 0.03) % 2}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className={styles.resultOverlay}>
                                        <span className="font-pixel" style={{ fontSize: 7, color: accentColor }}>
                                            SIMULATED OUTPUT
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.videoResult}>
                                    <div className={styles.videoControls}>
                                        <div className={styles.playBtn} style={{ borderColor, color: accentColor }}>▶</div>
                                        <div className={styles.videoProgress} style={{ borderColor: 'var(--color-accent2)' }}>
                                            <div className={styles.videoProgressBar} style={{ background: 'var(--color-accent2)' }} />
                                        </div>
                                        <span className="font-pixel" style={{ fontSize: 7, color: 'var(--color-text-dim)' }}>
                                            00:15
                                        </span>
                                    </div>
                                    <div className={styles.filmstrip}>
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <div key={i} className={styles.frame}>
                                                <div className={styles.frameGrid}>
                                                    {Array.from({ length: 16 }).map((_, j) => (
                                                        <div
                                                            key={j}
                                                            className={styles.framePixel}
                                                            style={{ background: getPixelColor(i * 16 + j + i * 7, prompt + i) }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.resultOverlay}>
                                        <span className="font-pixel" style={{ fontSize: 7, color: 'var(--color-accent2)' }}>
                                            SIMULATED OUTPUT
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.promptEcho}>
                            <span className="font-pixel" style={{ fontSize: 8, color: 'var(--color-text-dim)' }}>PROMPT:</span>
                            <span className="font-retro" style={{ color: accentColor }}>
                                &nbsp;{prompt.length > 80 ? prompt.slice(0, 80) + '...' : prompt}
                            </span>
                        </div>

                        <div className={styles.doneActions}>
                            <button className={`pixel-btn pixel-btn-blue ${styles.smallBtn}`}>
                                ⬇ DOWNLOAD
                            </button>
                            <button className={`pixel-btn pixel-btn-green ${styles.smallBtn}`}>
                                ↗ SHARE
                            </button>
                            <button className={`pixel-btn pixel-btn-pink ${styles.smallBtn}`}>
                                ↺ REGENERATE
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Deterministic pseudo-random pixel colors based on prompt + index
function getPixelColor(i: number, seed: string) {
    const colors = [
        '#39ff14', '#00d4ff', '#ff2d78', '#ffe000',
        '#a020f0', '#ff6b35', '#00ff88', '#ff0099',
        '#003d7a', '#1a3d15', '#3d0a1e', '#0a0a14',
        '#1a1a2e', '#12121a', '#0a200a', '#200a0a',
    ];
    const hash = (seed.charCodeAt(i % seed.length || 1) * 31 + i * 17) % colors.length;
    return colors[Math.abs(hash)];
}
