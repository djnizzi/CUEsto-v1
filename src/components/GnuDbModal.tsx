import React, { useState } from 'react';
import { fetchGnuDbMetadata, GnuDbResult } from '../lib/gnudb';

interface GnuDbModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (result: GnuDbResult) => void;
}

export const GnuDbModal: React.FC<GnuDbModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [gnucdid, setGnucdid] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleImport = async () => {
        if (!gnucdid.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchGnuDbMetadata(gnucdid.trim());
            if (response?.result) {
                onSuccess(response.result);
                setGnucdid('');
                onClose();
            } else if (response?.error) {
                setError(response.error);
            } else {
                setError('An unknown error occurred during fetch.');
            }
        } catch (e: any) {
            setError(e.message || 'Failed to connect to GnuDB.');
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

    const resetAndClose = () => {
        setError(null);
        setGnucdid('');
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div
                className="bg-[#3A3632] p-6 rounded-[32px] shadow-2xl w-full max-w-md border border-white/10 transition-all duration-300"
                onKeyDown={handleKeyDown}
            >
                {!error ? (
                    <div className="flex items-center gap-3">
                        <div className={`flex-1 border ${isLoading ? 'border-white/10' : 'border-white/20'} rounded-full px-4 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors`}>
                            <input
                                disabled={isLoading}
                                type="text"
                                value={gnucdid}
                                onChange={(e) => setGnucdid(e.target.value)}
                                className="bg-transparent w-full outline-none text-brand-text placeholder-[#787169] font-light text-sm"
                                placeholder={isLoading ? "fetching..." : "gnucdid"}
                            />
                        </div>
                        <button
                            disabled={isLoading || !gnucdid.trim()}
                            onClick={handleImport}
                            className={`${isLoading ? 'bg-brand-orange/50' : 'bg-brand-orange'} text-brand-darker font-medium rounded-full px-6 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] focus:shadow-[0_0_8px_var(--color-brand-orange)] outline-none transition-all text-sm whitespace-nowrap disabled:cursor-not-allowed`}
                        >
                            {isLoading ? 'Wait...' : 'get metadata'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-2">
                        <div className="text-brand-orange text-sm font-medium text-center px-4">
                            {error}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleImport}
                                className="bg-brand-orange text-brand-darker font-medium rounded-full px-6 py-1.5 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition-all text-xs"
                            >
                                Retry
                            </button>
                            <button
                                onClick={resetAndClose}
                                className="bg-white/10 text-brand-text font-medium rounded-full px-6 py-1.5 hover:bg-white/20 transition-all text-xs border border-white/10"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Click outside to close (only if not loading) */}
            <div className="absolute inset-0 -z-10" onClick={isLoading ? undefined : onClose} />
        </div>
    );
};
