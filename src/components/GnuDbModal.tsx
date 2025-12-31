import React, { useState } from 'react';

interface GnuDbModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (gnucdid: string) => void;
}

export const GnuDbModal: React.FC<GnuDbModalProps> = ({ isOpen, onClose, onImport }) => {
    const [gnucdid, setGnucdid] = useState('');

    if (!isOpen) return null;

    const handleImport = () => {
        if (gnucdid.trim()) {
            onImport(gnucdid.trim());
            setGnucdid('');
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleImport();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div
                className="bg-[#3A3632] p-6 rounded-[32px] shadow-2xl w-full max-w-md border border-white/10"
                onKeyDown={handleKeyDown}
            >
                <div className="flex items-center gap-3">
                    <div className="flex-1 border border-white/20 rounded-full px-4 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors">
                        <input
                            type="text"
                            value={gnucdid}
                            onChange={(e) => setGnucdid(e.target.value)}
                            className="bg-transparent w-full outline-none text-brand-text placeholder-[#787169] font-light text-sm"
                            placeholder="gnucdid"
                        />
                    </div>
                    <button
                        onClick={handleImport}
                        className="bg-brand-orange text-brand-darker font-medium rounded-full px-6 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] focus:shadow-[0_0_8px_var(--color-brand-orange)] outline-none transition-all text-sm whitespace-nowrap"
                    >
                        get metadata
                    </button>
                </div>
            </div>
            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};
