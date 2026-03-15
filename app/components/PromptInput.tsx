'use client';

import { useRef, useState } from 'react';
import styles from './PromptInput.module.css';

interface Props {
    prompt: string;
    onPromptChange: (v: string) => void;
    onGenerateImage: () => void;
    onGenerateVideo: () => void;
    isGeneratingImage: boolean;
    isGeneratingVideo: boolean;
}

const EXAMPLE_PROMPTS = [
    'A futuristic city at night with neon lights...',
    'A dragon flying over a pixel art mountain...',
    'A robot learning to paint in a studio...',
    'An astronaut surfing on Saturn rings...',
];

export default function PromptInput({
    prompt,
    onPromptChange,
    onGenerateImage,
    onGenerateVideo,
    isGeneratingImage,
    isGeneratingVideo,
}: Props) {
    const [charCount, setCharCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onPromptChange(e.target.value);
        setCharCount(e.target.value.length);
    };

    const handleExampleClick = (ex: string) => {
        onPromptChange(ex);
        setCharCount(ex.length);
        textareaRef.current?.focus();
    };

    const isGenerating = isGeneratingImage || isGeneratingVideo;

    return (
        <section className={`pixel-panel ${styles.section}`}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>⌨</span>
                <span className="font-pixel" style={{ fontSize: 11 }}>PROMPT INPUT</span>
                <span className={`pixel-badge ${styles.badge}`}>TERMINAL</span>
            </div>

            <div className={styles.terminalLine}>
                <span className="text-accent">ROOT@AI-STUDIO:~$</span>&nbsp;
                <span className="text-dim">awaiting your prompt...</span>
            </div>

            <div className={styles.inputWrapper}>
                <textarea
                    ref={textareaRef}
                    className={`pixel-input ${styles.textarea}`}
                    value={prompt}
                    onChange={handleChange}
                    placeholder="Describe what you want to create... be as detailed as possible!"
                    rows={5}
                    maxLength={1000}
                    disabled={isGenerating}
                    aria-label="Prompt input"
                    id="prompt-textarea"
                />
                <div className={styles.charCount}>
                    <span className={charCount > 900 ? 'text-accent2' : 'text-dim'}>
                        {charCount}/1000 CHARS
                    </span>
                </div>
            </div>

            <div className={styles.examples}>
                <span className="font-pixel text-dim" style={{ fontSize: 8 }}>QUICK EXAMPLES:</span>
                <div className={styles.exampleList}>
                    {EXAMPLE_PROMPTS.map((ex, i) => (
                        <button
                            key={i}
                            className={styles.exampleBtn}
                            onClick={() => handleExampleClick(ex)}
                            disabled={isGenerating}
                            title={ex}
                        >
                            [{i + 1}] {ex.length > 38 ? ex.slice(0, 38) + '…' : ex}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    id="generate-image-btn"
                    className={`pixel-btn pixel-btn-green ${styles.btn}`}
                    onClick={onGenerateImage}
                    disabled={!prompt.trim() || isGenerating}
                >
                    {isGeneratingImage ? (
                        <>
                            <span className={styles.spinner}>▓▓▓</span> GENERATING...
                        </>
                    ) : (
                        <>🖼 GENERATE IMAGE</>
                    )}
                </button>
                <button
                    id="generate-video-btn"
                    className={`pixel-btn pixel-btn-pink ${styles.btn}`}
                    onClick={onGenerateVideo}
                    disabled={!prompt.trim() || isGenerating}
                >
                    {isGeneratingVideo ? (
                        <>
                            <span className={styles.spinner}>▓▓▓</span> RENDERING...
                        </>
                    ) : (
                        <>🎬 GENERATE VIDEO</>
                    )}
                </button>
                <button
                    id="clear-prompt-btn"
                    className={`pixel-btn pixel-btn-blue ${styles.btn}`}
                    onClick={() => { onPromptChange(''); setCharCount(0); }}
                    disabled={isGenerating || !prompt}
                >
                    ✕ CLEAR
                </button>
            </div>
        </section>
    );
}
