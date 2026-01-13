import React, { useState } from 'react';
import { fetchMusicBrainzMetadata, MusicBrainzResult } from '../lib/musicbrainz';
import { DiscogsOptions as MusicBrainzOptions } from '../lib/discogs'; // Reuse the options structure

interface MusicBrainzModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (result: MusicBrainzResult, options: MusicBrainzOptions) => void;
}

export const MusicBrainzModal: React.FC<MusicBrainzModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [discId, setDiscId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [options, setOptions] = useState<MusicBrainzOptions>({
        header: false,
        trackTitles: true,
        trackPerformers: true,
        timings: true,
        interpolate: false
    });

    if (!isOpen) return null;

    const handleImport = async () => {
        if (!discId.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchMusicBrainzMetadata(discId.trim());
            if (response?.result) {
                onSuccess(response.result, options);
                setDiscId('');
                onClose();
            } else {
                setError(response?.error || 'Failed to fetch metadata from MusicBrainz.');
            }
        } catch (e: any) {
            setError('Connection with MusicBrainz failed. Please retry.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleImport();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const toggleOption = (key: keyof MusicBrainzOptions) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div
                className="bg-[#34302C] p-8 rounded-[32px] shadow-2xl w-full max-w-[480px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6"
                onKeyDown={handleKeyDown}
            >
                {/* Title */}
                <h2 className="text-brand-text font-semibold text-[15px] leading-tight">
                    import metadata from MusicBrainz
                </h2>

                {/* Help Text */}
                <p className="text-[#A8A29E] text-[13px] font-light leading-relaxed">
                    provide a MusicBrainz Disc ID (e.g., I5X4feIW6Bs0uji.rK4eiIJshog-). you can find it on a release page at{' '}
                    <a
                        href="https://musicbrainz.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-orange hover:underline"
                    >
                        musicbrainz.org
                    </a>
                </p>

                {/* Input Field */}
                <div className="border border-white/20 rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors">
                    <input
                        disabled={isLoading}
                        type="text"
                        value={discId}
                        onChange={(e) => setDiscId(e.target.value)}
                        className="bg-transparent w-full outline-none text-brand-text placeholder-[#787169] font-light text-sm"
                        placeholder="Disc ID"
                    />
                </div>

                {/* Overwrite Options Checkboxes */}
                <div className="flex flex-col gap-4 mb-2">
                    <CheckboxItem
                        label="overwrite header (album title, performer etc.)"
                        checked={options.header}
                        onChange={() => toggleOption('header')}
                    />
                    <CheckboxItem
                        label="overwrite track titles"
                        checked={options.trackTitles}
                        onChange={() => toggleOption('trackTitles')}
                    />
                    <CheckboxItem
                        label="overwrite track performers"
                        checked={options.trackPerformers}
                        onChange={() => toggleOption('trackPerformers')}
                    />
                    <CheckboxItem
                        label="overwrite start times/durations"
                        checked={options.timings}
                        onChange={() => toggleOption('timings')}
                    />
                </div>

                {/* Inline Error Display */}
                {error && (
                    <div className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="w-[1.5px] min-h-[36px] bg-brand-orange self-stretch" />
                        <div className="flex gap-2.5 items-start">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
                                <path d="M9.87109 0.410156L13.6172 4.12891C13.8633 4.375 14 4.70312 14 5.05859V8.96875C14 9.32422 13.8633 9.65234 13.6172 9.89844L9.87109 13.6172C9.625 13.8633 9.29688 14 8.94141 14H5.03125C4.67578 14 4.34766 13.8633 4.10156 13.6172L0.382812 9.89844C0.136719 9.65234 0 9.32422 0 8.96875V5.05859C0 4.70312 0.136719 4.375 0.382812 4.12891L4.10156 0.410156C4.34766 0.164062 4.67578 0 5.03125 0H8.94141C9.29688 0 9.625 0.164062 9.87109 0.410156ZM13.125 8.96875V5.05859C13.125 4.94922 13.0703 4.83984 12.9883 4.75781L9.24219 1.01172C9.16016 0.929688 9.05078 0.875 8.94141 0.875H5.03125C4.92188 0.875 4.8125 0.929688 4.73047 1.01172L0.984375 4.75781C0.902344 4.83984 0.875 4.94922 0.875 5.05859V8.96875C0.875 9.07812 0.902344 9.1875 0.984375 9.26953L4.73047 13.0156C4.8125 13.0977 4.92188 13.125 5.03125 13.125H8.94141C9.05078 13.125 9.16016 13.0977 9.24219 13.0156L12.9883 9.26953C13.0703 9.1875 13.125 9.07812 13.125 8.96875Z" fill="#E8D7C9" />
                            </svg>
                            <span className="text-brand-orange text-[13px] leading-tight font-light whitespace-pre-wrap">
                                {error}
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer with Button */}
                <div className="flex justify-end mt-2">
                    <button
                        disabled={isLoading || !discId.trim()}
                        onClick={handleImport}
                        className={`${isLoading ? 'bg-brand-orange/50' : 'bg-brand-orange'} text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm whitespace-nowrap disabled:cursor-not-allowed`}
                    >
                        {isLoading ? 'Wait...' : 'get metadata'}
                    </button>
                </div>
            </div>
            {/* Click outside to close (only if not loading) */}
            <div className="absolute inset-0 -z-10" onClick={isLoading ? undefined : onClose} />
        </div>
    );
};

interface CheckboxItemProps {
    label: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, checked, onChange, disabled }) => (
    <div
        className={`flex items-center gap-3 group ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={disabled ? undefined : onChange}
    >
        <div className={`w-5 h-5 rounded-[4px] border border-white/20 flex items-center justify-center transition-all duration-200 ${checked && !disabled ? 'bg-brand-orange border-brand-orange shadow-[0_0_8px_rgba(255,116,0,0.4)]' : 'group-hover:border-white/40'} ${disabled ? 'bg-transparent' : ''}`}>
            {checked && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            )}
        </div>
        <span className={`text-brand-text/80 text-[15px] font-light leading-none ${!disabled && 'group-hover:text-brand-text'} transition-colors`}>
            {label}
        </span>
    </div>
);
