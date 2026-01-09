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
        <div className="flex flex-col h-screen bg-[#34302C] text-brand-text font-sans">
            {/* Navigation Header */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 bg-[#2A2623] drag">
                <div className="flex items-center gap-2 no-drag">
                    <button
                        onClick={handleBack}
                        disabled={!canGoBack}
                        className={`p-2 rounded-full transition-colors ${canGoBack ? 'text-brand-orange hover:bg-white/5' : 'text-white/10 cursor-not-allowed'}`}
                        title="Back"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        onClick={handleForward}
                        disabled={!canGoForward}
                        className={`p-2 rounded-full transition-colors ${canGoForward ? 'text-brand-orange hover:bg-white/5' : 'text-white/10 cursor-not-allowed'}`}
                        title="Forward"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <h1 className="text-sm font-medium truncate opacity-90">{title}</h1>
                    <span className="text-[11px] font-light opacity-90 truncate">{url}</span>
                </div>

                {/* Logo and App Title */}
                <div className="flex items-center gap-2 drag">
                    <img src="images/logo.png" alt="Logo" className="h-6 w-auto" />
                </div>
            </div>

            {/* The WebContentsView will be placed below this header by the main process */}
            <div className="flex-1 bg-black" id="browser-view-container" />
        </div>
    );
};
