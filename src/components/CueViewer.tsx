import React, { useEffect, useState } from 'react';

export const CueViewer: React.FC = () => {
    const [content, setContent] = useState<string>('');

    useEffect(() => {
        const fetchContent = async () => {
            if ((window as any).ipcRenderer) {
                const data = await (window as any).ipcRenderer.invoke('viewer:get-content');
                setContent(data || '');
            }
        };
        fetchContent();
        document.title = 'CUE Viewer';
    }, []);

    const highlightLine = (line: string) => {
        const trimmed = line.trim();

        // Whole line coloring
        if (trimmed.startsWith('REM')) {
            return <span className="text-[var(--color-syntax-rem)]">{line}</span>;
        }
        if (trimmed.startsWith('TRACK')) {
            return <span className="text-[var(--color-syntax-track)]">{line}</span>;
        }

        // Keyword based coloring
        const parts = line.split(/(\s+)/); // Preserve whitespace
        return parts.map((part, i) => {
            const upper = part.toUpperCase();

            if (upper === 'PERFORMER') {
                return <span key={i} className="text-[var(--color-syntax-performer)]">{part}</span>;
            }
            if (upper === 'TITLE') {
                return <span key={i} className="text-[var(--color-syntax-title)]">{part}</span>;
            }
            if (upper === 'FILE') {
                return <span key={i} className="text-[var(--color-syntax-file)]">{part}</span>;
            }
            if (upper === 'INDEX') {
                // If it's INDEX, also check next part for '01' (or any number)
                return <span key={i} className="text-[var(--color-syntax-index)]">{part}</span>;
            }
            // Check for INDEX's number
            const prevPart = i > 0 ? parts[i - 2]?.toUpperCase() : null;
            if (prevPart === 'INDEX' && /^\d+$/.test(part)) {
                return <span key={i} className="text-[var(--color-syntax-index)]">{part}</span>;
            }

            // Check for file types at the end of FILE lines
            if (['MP3', 'WAVE', 'WAV', 'FLAC', 'M4A', 'OGG'].includes(upper)) {
                return <span key={i} className="text-[var(--color-syntax-file)]">{part}</span>;
            }

            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div
            className="min-h-screen bg-brand-dark p-6 font-mono text-[var(--color-brand-text)] selection:bg-brand-orange selection:text-white overflow-auto whitespace-pre leading-tight"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
            {content.split('\n').map((line, i) => (
                <div key={i} className="min-h-[1.2em]">
                    {highlightLine(line)}
                </div>
            ))}
        </div>
    );
};
