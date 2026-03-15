'use client';

import { useEffect, useState } from 'react';
import type { PromptData } from './PromptCard';
import styles from './PromptModal.module.css';

interface Props {
    data: PromptData | null;
    onClose: () => void;
}

export default function PromptModal({ data, onClose }: Props) {
    const [copied, setCopied] = useState(false);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        if (data) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [data]);

    if (!data) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(data.prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback for insecure contexts
            const ta = document.createElement('textarea');
            ta.value = data.prompt;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div
            className={styles.backdrop}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={`${data.line1} ${data.line2}`}
        >
            <div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                id="prompt-modal"
            >
                {/* Close button */}
                <button
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="Close"
                    id="modal-close-btn"
                >
                    ✕
                </button>

                {/* Cover Image */}
                <div className={styles.imageWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={data.image}
                        alt={`${data.line1} ${data.line2}`}
                        className={styles.image}
                    />
                    <div className={styles.imageOverlay} />
                    {/* Big title over image */}
                    <div className={styles.imageTitleBlock}>
                        <span className={styles.imageTitleLine1}>{data.line1}</span>
                        <span className={styles.imageTitleLine2} style={{ color: data.line2Color }}>
                            {data.line2}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Subtitle / section label */}
                    <div className={styles.metaRow}>
                        <span className="pixel-badge" style={{ color: '#888', borderColor: '#333' }}>
                            PROMPT
                        </span>
                    </div>

                    {/* Prompt text scrollable */}
                    <div className={styles.promptWrap} id="modal-prompt-text">
                        <p className={styles.promptText}>{data.prompt}</p>
                    </div>
                </div>

                {/* Copy Button */}
                <div className={styles.footer}>
                    <button
                        className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                        onClick={handleCopy}
                        id="modal-copy-btn"
                    >
                        {copied ? (
                            <>✓ COPIED!</>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Copy Prompt
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
