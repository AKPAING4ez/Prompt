'use client';

import styles from './PromptCard.module.css';

export interface PromptData {
    id: string;
    image: string;
    line1: string;
    line2: string;
    line2Color: string;
    type: 'image' | 'video' | 'both';
    aspectRatio?: string;
    prompt: string;
}

interface Props {
    data: PromptData;
    onClick: () => void;
}

const TYPE_COLORS: Record<string, string> = {
    image: '#39ff14',
    video: '#ff2d78',
    both: '#00d4ff',
};

const TYPE_LABELS: Record<string, string> = {
    image: '🖼 IMAGE',
    video: '🎬 VIDEO',
    both: '✦ IMAGE + VIDEO',
};

export default function PromptCard({ data, onClick }: Props) {
    const ratioStr = data.aspectRatio?.replace(':', '/') || '9/16';
    return (
        <button
            className={styles.card}
            onClick={onClick}
            aria-label={`${data.line1} ${data.line2}`}
            id={`card-${data.id}`}
            style={{ aspectRatio: ratioStr }}
        >
            {/* cover image */}
            <div className={styles.imageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={data.image}
                    alt={`${data.line1} ${data.line2}`}
                    className={styles.image}
                    loading="lazy"
                />
                <div className={styles.overlay} />
            </div>

            {/* type badge top-right */}
            <span
                className={`${styles.typeBadge} pixel-badge`}
                style={{ color: TYPE_COLORS[data.type], borderColor: TYPE_COLORS[data.type] }}
            >
                {TYPE_LABELS[data.type]}
            </span>

            {/* title text over image */}
            <div className={styles.titleBlock}>
                <span className={styles.titleLine1}>{data.line1}</span>
                <span className={styles.titleLine2} style={{ color: data.line2Color }}>
                    {data.line2}
                </span>
            </div>
        </button>
    );
}
