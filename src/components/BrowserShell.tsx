import React, { useEffect, useState } from 'react';

export const BrowserShell: React.FC = () => {
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [title, setTitle] = useState('Loading...');
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (!(window as any).ipcRenderer) return;

        const updateStatus = async () => {
            const status = await (window as any).ipcRenderer.invoke('browser:get-status');
            if (status) {
                setCanGoBack(status.canGoBack);
                setCanGoForward(status.canGoForward);
                setTitle(status.title);
                setUrl(status.url);
            }
        };

        const interval = setInterval(updateStatus, 500);

        // Also listen for events from main process
        (window as any).ipcRenderer.on('browser:status-updated', (_: any, status: any) => {
            setCanGoBack(status.canGoBack);
            setCanGoForward(status.canGoForward);
            setTitle(status.title);
            setUrl(status.url);
        });

        updateStatus();

        return () => {
            clearInterval(interval);
            (window as any).ipcRenderer.removeAllListeners('browser:status-updated');
        };
    }, []);

    const handleBack = () => {
        (window as any).ipcRenderer.send('browser:go-back');
    };

    const handleForward = () => {
        (window as any).ipcRenderer.send('browser:go-forward');
    };

    return (
        <div className="flex flex-col h-screen bg-brand-surface text-brand-text font-sans">
            {/* Navigation Header */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 bg-brand-header drag">
                <div className="flex items-center gap-2 no-drag">
                    <button
                        onClick={handleBack}
                        disabled={!canGoBack}
                        className={`p-2 rounded-full transition-colors ${canGoBack ? 'text-brand-orange hover:bg-white/5' : 'text-white/10 cursor-not-allowed'}`}
                        data-tooltip="Back"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        onClick={handleForward}
                        disabled={!canGoForward}
                        className={`p-2 rounded-full transition-colors ${canGoForward ? 'text-brand-orange hover:bg-white/5' : 'text-white/10 cursor-not-allowed'}`}
                        data-tooltip="Forward"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <h1 className="text-sm font-medium truncate opacity-90">{title}</h1>
                    <span className="text-tiny font-light opacity-90 truncate">{url}</span>
                </div>

                {/* Logo and App Title */}
                <div className="flex items-center gap-2 drag">
                    {(() => {
                        if (url.includes('musicbrainz.org')) {
                            return <img src="images/musicbrainz.svg" alt="MusicBrainz" className="w-[116px] h-[18px]" />;
                        }
                        if (url.includes('gnudb.org')) {
                            return <img src="images/gnudb.svg" alt="GnuDB" className="w-[100px] h-[31px]" />;
                        }
                        if (url.includes('discogs.com')) {
                            return <img src="images/discogs.svg" alt="Discogs" className="w-[67px] h-[25px]" />;
                        }
                        if (url.includes('1001tracklists.com')) {
                            return <img src="images/tracklists.svg" alt="1001Tracklists" className="w-[116px] h-[13px]" />;
                        }
                        return <img src="images/logo.png" alt="Logo" className="h-6 w-auto" />;
                    })()}
                </div>
            </div>

            {/* The WebContentsView will be placed below this header by the main process */}
            <div className="flex-1 bg-black" id="browser-view-container" />
        </div>
    );
};
