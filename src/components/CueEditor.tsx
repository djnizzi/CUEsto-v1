import React, { useState } from 'react';
import { MetadataHeader } from './MetadataHeader';
import { TrackRow } from './TrackRow';
import { MusicBrainzModal } from './MusicBrainzModal';
import { musicbrainzToCue, MusicBrainzResult } from '../lib/musicbrainz';
import { CueSheet, CueTrack, generateCue, parseCue } from '../lib/cueParser';
import { timeToFrames, parseAudacityLabels } from '../lib/timeUtils';
import { parse1001Tracklist } from '../lib/tracklistParser';
import { GnuDbModal } from './GnuDbModal';
import { GnuDbResult, OverwriteOptions } from '../lib/gnudb';
import { DiscogsModal } from './DiscogsModal';
import { DiscogsOptions, DiscogsResult, interpolateTimings, discogsTracksToCueTracks } from '../lib/discogs';
import { ConfirmModal } from './ConfirmModal';

type MusicBrainzOptions = DiscogsOptions;

// Dummy initial state or empty
const INITIAL_CUE: CueSheet = {
    title: '',
    performer: '',
    file: '',
    tracks: [
        { number: 1, title: '', performer: '', index01: 0 }, // 00:00:00
        // Example duration 3:28:45 -> 12480 + 2100 + 45 = 15645 frames roughly? 
        // 3 mins = 180s. 3:28 = 208s. 208 * 75 = 15600. .45 -> 45 frames. Total 15645.
        // Next track start: 15645
    ]
};

export const CueEditor: React.FC = () => {
    const [cue, setCue] = useState<CueSheet>(INITIAL_CUE);
    const [showToast, setShowToast] = useState(false);
    const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
    const [isGnuDbModalOpen, setIsGnuDbModalOpen] = useState(false);
    const [isDiscogsModalOpen, setIsDiscogsModalOpen] = useState(false);
    const [isMusicBrainzModalOpen, setIsMusicBrainzModalOpen] = useState(false);
    const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
    const [appVersion, setAppVersion] = useState('1.0.7');

    const showSaveToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleUpdateMetadata = (field: string, value: string) => {
        setCue(prev => ({
            ...prev,
            [field === 'fileName' ? 'file' : field]: value
        }));
    };

    React.useEffect(() => {
        console.log('CueEditor mounted');
        const setAppTitle = async () => {
            try {
                if ((window as any).ipcRenderer) {
                    const version = await (window as any).ipcRenderer.invoke('getAppVersion');
                    setAppVersion(version);
                    document.title = `CUEsto ${version}`;
                }
            } catch (e) {
                console.error('Failed to get app version', e);
            }
        };
        setAppTitle();

        // Listen for file-opened event from main process (File Association)
        if ((window as any).ipcRenderer) {
            (window as any).ipcRenderer.on('file-opened', (_: any, data: { content: string, filePath: string }) => {
                if (data && data.content) {
                    const parsed = parseCue(data.content);
                    setCue(parsed);
                    if (data.filePath) {
                        setCurrentFilePath(data.filePath);
                    }
                }
            });
        }

        // Cleanup? 
        return () => {
            if ((window as any).ipcRenderer) {
                (window as any).ipcRenderer.removeAllListeners('file-opened');
            }
        };
    }, []);

    const handleTrackUpdate = (index: number, field: keyof CueTrack, value: any) => {
        setCue(prev => {
            const newTracks = [...prev.tracks];
            newTracks[index] = { ...newTracks[index], [field]: value };
            return { ...prev, tracks: newTracks };
        });
    };

    const handleStartTimeChange = (index: number, newTimeStr: string) => {
        const newFrames = timeToFrames(newTimeStr);
        setCue(prev => {
            const newTracks = [...prev.tracks];
            // Logic: Move this track. Do NOT move subsequent tracks.
            // Constraint: Must be > Prev Start and < Next Start.
            // But we can relax constraints or warn. For now just set it.
            newTracks[index] = { ...newTracks[index], index01: newFrames };
            // Sort tracks? Usually CUE must be sorted. 
            // User might want to reorder by changing time? 
            // Let's keep order fixed for now, sorting index01 might act as reorder.
            return { ...prev, tracks: newTracks };
        });
    };

    const handleDurationChange = (index: number, newDurationStr: string) => {
        const durationFrames = timeToFrames(newDurationStr);
        setCue(prev => {
            const newTracks = [...prev.tracks];
            if (index >= newTracks.length) return prev; // Should not happen

            // Duration of track[i] = track[i+1].index - track[i].index
            // We want newDuration. So track[i+1].index should become track[i].index + newDuration
            // And we shift all subsequent tracks by the delta to preserve their relative durations?
            // "Editing Duration shifts the Start Time of all subsequent tracks." => Yes.

            // However, last track duration implies Total Length. If last track, we can't really shift "next start".
            // We just store/render. But CUE format doesn't natively store duration for last track unless we have total.
            // If it's the last track, we probably just can't do much unless we track total audio duration.
            // For now, ignore last track duration change or treat as metadata?

            if (index === newTracks.length - 1) {
                // Last track. Nothing to shift. 
                // Maybe just store it in ephemeral state or ignore?
                // User requirement: "Edit a large duration (e.g., 105:00:00). Verify it is accepted."
                // This suggests we might just update "Total Length" implicitly?
                return prev;
            }

            const currentStart = newTracks[index].index01;
            const nextStartWrapper = newTracks[index + 1].index01;
            const currentDuration = nextStartWrapper - currentStart;
            const diff = durationFrames - currentDuration;

            // Shift all subsequent tracks by diff
            for (let i = index + 1; i < newTracks.length; i++) {
                newTracks[i].index01 += diff;
            }

            return { ...prev, tracks: newTracks };
        });
    };

    const handleDeleteTrack = (index: number) => {
        setCue(prev => ({
            ...prev,
            tracks: prev.tracks.filter((_, i) => i !== index)
        }));
    };

    const handleAddRow = () => {
        setCue(prev => {
            const lastTrack = prev.tracks[prev.tracks.length - 1];
            const newStart = lastTrack ? lastTrack.index01 + 15000 : 0; // Default add 3:20 approx?
            return {
                ...prev,
                tracks: [
                    ...prev.tracks,
                    {
                        number: prev.tracks.length + 1,
                        title: '',
                        performer: '',
                        index01: newStart
                    }
                ]
            };
        });
    };

    const handleClear = () => {
        setIsConfirmClearOpen(true);
    };

    const confirmClear = () => {
        setCue(INITIAL_CUE);
        setCurrentFilePath(null);
        setIsConfirmClearOpen(false);
    };

    const handleOpenFile = async () => {
        try {
            if (!(window as any).ipcRenderer) return;
            const result = await (window as any).ipcRenderer.invoke('dialog:openFile');
            if (result) {
                const { content, filepath } = result;
                const parsed = parseCue(content);
                setCue(parsed);
                setCurrentFilePath(filepath);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelectAudioFile = async () => {
        try {
            if (!(window as any).ipcRenderer) return;
            const result = await (window as any).ipcRenderer.invoke('dialog:openAudioFile');
            if (result) {
                const { filename, durationFrames, metadata } = result;
                setCue(prev => ({
                    ...prev,
                    file: filename,
                    totalDuration: durationFrames,
                    performer: metadata?.artist || prev.performer,
                    title: metadata?.title || prev.title,
                    date: metadata?.year || prev.date,
                    genre: metadata?.genre || prev.genre
                }));
            }
        } catch (e) {
            console.error('Failed to select audio file', e);
        }
    };

    const handleImport = async (source: string) => {
        if (source === '1001tracklists') {
            try {
                // Reuse the same dialog:openFile but we need to tell it to filter for HTML?
                // The current dialog:openFile filters for CUE.
                // We should probably modify main process to accept filters or add a new 'dialog:openHtml' handler.
                // Or we can just ask user to pick file and use a generic openFile?
                // Let's call a new IPC method for clarity: 'dialog:openHtml'
                // But since I cannot modify main.ts easily without restarting or reloading... 
                // Wait, I CAN modify main.ts. I should.

                const result = await (window as any).ipcRenderer.invoke('dialog:openHtml');
                if (result) {
                    const { content } = result;
                    const parsed = parse1001Tracklist(content);
                    setCue(prev => ({
                        ...parsed,
                        // Keep existing file/title if valid? No, usually import overwrites.
                        // Maybe preserve file name if it was already set?
                        file: prev.file || parsed.file
                    }));
                }
            } catch (e) {
                console.error('Import failed', e);
            }
        } else if (source === 'gnudb') {
            setIsGnuDbModalOpen(true);
        } else if (source === 'discogs') {
            setIsDiscogsModalOpen(true);
        } else if (source === 'audacity') {
            try {
                if (!(window as any).ipcRenderer) return;
                const result = await (window as any).ipcRenderer.invoke('dialog:openLabels');
                if (result) {
                    const { content } = result;
                    const audacityTracks = parseAudacityLabels(content);
                    setCue(prev => ({
                        ...prev,
                        tracks: audacityTracks.map((at, i) => {
                            const prevTrack = prev.tracks[i];
                            return {
                                number: i + 1,
                                title: (prevTrack?.title && prevTrack.title.trim()) ? prevTrack.title : at.title,
                                performer: (prevTrack?.performer && prevTrack.performer.trim()) ? prevTrack.performer : at.performer,
                                index01: at.index01
                            };
                        })
                    }));
                }
            } catch (e) {
                console.error('Audacity import failed', e);
            }
        } else if (source === 'musicbrainz') {
            setIsMusicBrainzModalOpen(true);
        } else {
            console.log('Import source not implemented:', source);
        }
    };

    const handleMusicBrainzSuccess = (data: MusicBrainzResult, options: MusicBrainzOptions) => {
        const mbCue = musicbrainzToCue(data);

        setCue(prev => {
            const newCue = { ...prev };
            newCue.mb_discid = mbCue.mb_discid;
            newCue.barcode = mbCue.barcode;
            newCue.label = mbCue.label;
            newCue.catalog = mbCue.catalog;

            if (options.header || !prev.performer) newCue.performer = mbCue.performer || prev.performer;
            if (options.header || !prev.title) newCue.title = mbCue.title || prev.title;
            if (options.header || !prev.date) newCue.date = mbCue.date || prev.date;
            if (options.header || !prev.genre) newCue.genre = mbCue.genre || prev.genre;

            if (options.trackTitles || options.trackPerformers || options.timings || prev.tracks.length === 0) {
                let finalTracks = mbCue.tracks || [];

                if (options.interpolate && prev.totalDuration && finalTracks.length > 0) {
                    // Inject durations for interpolation if missing
                    const tracksWithDurations = finalTracks.map((t, i) => {
                        const next = finalTracks[i + 1];
                        const duration = next ? next.index01 - t.index01 : 0;
                        return { ...t, duration };
                    });
                    finalTracks = interpolateTimings(tracksWithDurations, prev.totalDuration);
                }

                newCue.tracks = finalTracks.map((mTrack, i) => {
                    const prevTrack = prev.tracks[i];
                    return {
                        number: mTrack.number,
                        title: (options.trackTitles || !prevTrack?.title) ? mTrack.title : (prevTrack?.title || mTrack.title),
                        performer: (options.trackPerformers || !prevTrack?.performer) ? mTrack.performer : (prevTrack?.performer || mTrack.performer),
                        index01: (options.timings || prevTrack?.index01 === undefined) ? mTrack.index01 : (prevTrack?.index01 || mTrack.index01)
                    };
                });
            }

            return newCue;
        });
    };

    const handleGnuDbSuccess = (result: GnuDbResult, options: OverwriteOptions) => {
        setCue(prev => {
            const newCue = { ...prev };

            // Store the source CD ID
            newCue.gnucdid = result.id;

            // Header: Update if option checked OR if current value is missing/empty
            if (options.header || !prev.performer) newCue.performer = result.artist;
            if (options.header || !prev.title) newCue.title = result.album;
            if (options.header || !prev.date) newCue.date = result.year || prev.date;
            if (options.header || !prev.genre) newCue.genre = result.genre || prev.genre;

            // Tracks: We use the GnuDB tracklist if any track change is requested OR if current tracklist is empty
            if (options.trackTitles || options.trackPerformers || options.timings || prev.tracks.length === 0) {
                newCue.tracks = result.tracks.map((gTrack, i) => {
                    const prevTrack = prev.tracks[i];
                    return {
                        number: gTrack.number,
                        // Update if option checked OR if current value is missing/empty
                        title: (options.trackTitles || !prevTrack?.title) ? gTrack.title : (prevTrack?.title || gTrack.title),
                        performer: (options.trackPerformers || !prevTrack?.performer) ? gTrack.performer : (prevTrack?.performer || gTrack.performer),
                        index01: (options.timings || prevTrack?.index01 === undefined) ? gTrack.index01 : (prevTrack?.index01 || gTrack.index01)
                    };
                });
            }

            return newCue;
        });
    };

    const handleDiscogsSuccess = (result: DiscogsResult, options: DiscogsOptions) => {
        setCue(prev => {
            const newCue = { ...prev };

            // Header: Update if option checked OR if current value is missing/empty
            if (options.header || !prev.performer) newCue.performer = result.artist;
            if (options.header || !prev.title) newCue.title = result.album;
            if (options.header || !prev.date) newCue.date = result.year || prev.date;
            if (options.header || !prev.genre) newCue.genre = result.genre || prev.genre;

            // Store Discogs release code
            if (result.releaseCode) {
                newCue.discogs = result.releaseCode;
            }

            // Filter tracks by Disc # if provided
            let discTracks = result.tracks;
            if (options.discNumber) {
                const prefix = `${options.discNumber}-`;
                discTracks = result.tracks.filter(t => t.position.startsWith(prefix));
                // If discTracks is empty, it might mean the position format is different or only one disc
                if (discTracks.length === 0) discTracks = result.tracks;
            }

            // Tracks: Update if any track change is requested OR if current tracklist is empty/initial
            const isInitial = prev.tracks.length === 1 && !prev.tracks[0].title && !prev.tracks[0].performer && prev.tracks[0].index01 === 0;
            if (options.trackTitles || options.trackPerformers || options.timings || options.interpolate || isInitial) {
                let newTracks: CueTrack[] = [];

                if (options.interpolate && prev.totalDuration) {
                    newTracks = interpolateTimings(discTracks as any, prev.totalDuration);
                } else {
                    newTracks = discogsTracksToCueTracks(discTracks);
                }

                newCue.tracks = newTracks.map((nt, i) => {
                    const prevTrack = prev.tracks[i];

                    // Determine final values index-by-index
                    const finalTitle = (options.trackTitles || !prevTrack?.title) ? (nt.title || 'Untitled') : prevTrack.title;
                    const finalPerformer = (options.trackPerformers || !prevTrack?.performer) ? (nt.performer || '') : prevTrack.performer;
                    const finalIndex = (options.timings || options.interpolate || prevTrack?.index01 === undefined) ? nt.index01 : prevTrack.index01;

                    return {
                        number: nt.number,
                        title: finalTitle,
                        performer: finalPerformer,
                        index01: finalIndex
                    };
                });
            }

            return newCue;
        });
    };

    const handleSave = async () => {
        const data = generateCue(cue, appVersion);
        try {
            if (!(window as any).ipcRenderer) return;

            if (currentFilePath) {
                // Overwrite existing file
                const success = await (window as any).ipcRenderer.invoke('dialog:saveFile', data, currentFilePath);
                if (success) {
                    showSaveToast();
                }
            } else {
                // No path known, do Save As
                await handleSaveAs();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveAs = async () => {
        const data = generateCue(cue, appVersion);
        let baseName = `${cue.performer} - ${cue.title}`;
        if (cue.file) {
            const lastDot = cue.file.lastIndexOf('.');
            baseName = lastDot > 0 ? cue.file.substring(0, lastDot) : cue.file;
        }
        const suggestedName = `${baseName}.cue`.replace(/[\\/:"*?<>|]/g, ''); // Clean filename
        try {
            if (!(window as any).ipcRenderer) return;
            const savedPath = await (window as any).ipcRenderer.invoke('dialog:saveFile', data, suggestedName);
            if (savedPath && typeof savedPath === 'string') {
                setCurrentFilePath(savedPath);
                showSaveToast();
            } else if (savedPath === true) {
                // Should not really happen with name passed but for safety
                showSaveToast();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleViewCue = () => {
        if (!(window as any).ipcRenderer) return;
        const data = generateCue(cue, appVersion);
        (window as any).ipcRenderer.invoke('window:open-viewer', data);
    };

    // Rendering Helper: Calculate durations for display

    // Rendering Helper: Calculate durations for display
    const getRenderDuration = (index: number) => {
        if (index < cue.tracks.length - 1) {
            return cue.tracks[index + 1].index01 - cue.tracks[index].index01;
        }
        if (cue.totalDuration) {
            return Math.max(0, cue.totalDuration - cue.tracks[index].index01);
        }
        return 0; // Last track unknown/infinity
    };

    const isDurationReadOnly = (index: number) => {
        return index === cue.tracks.length - 1 && cue.totalDuration !== undefined && cue.totalDuration > 0;
    };

    return (
        <div className="min-h-screen bg-brand-dark text-brand-text font-sans selection:bg-brand-orange selection:text-white">
            {/* Brand Header */}
            <div className="flex justify-center py-6">
                <h1 className="text-4xl font-bold flex items-center gap-2">
                    <img src="images/logo.png" alt="CUEsto Logo" className="h-20 w-auto" />
                </h1>
            </div>

            <MetadataHeader
                fileName={cue.file}
                albumTitle={cue.title}
                performer={cue.performer}
                date={cue.date || ''}
                genre={cue.genre || ''}
                totalDuration={cue.totalDuration}
                onUpdate={handleUpdateMetadata}
                onImport={handleImport}
                onOpenFile={handleOpenFile}
                onSelectAudioFile={handleSelectAudioFile}
            />

            <div className="max-w-5xl mx-auto px-6 mt-1 pb-10">
                {/* Table Header */}
                <div className="flex gap-2 text-sm text-brand-text mb-2 px-2 font-normal">
                    <div className="w-3 text-right">#</div>
                    <div className="flex-1 pl-6">title</div>
                    <div className="flex-1 pl-5">performer</div>
                    <div className="w-24 pl-6">start time</div>
                    <div className="w-24 pl-7">duration</div>
                    <div className="w-8"></div>
                </div>

                <div className="flex flex-col gap-0">
                    {cue.tracks.map((track, i) => (
                        <TrackRow
                            key={i}
                            index={i}
                            track={track}
                            durationFrames={getRenderDuration(i)}
                            isDurationReadOnly={isDurationReadOnly(i)}
                            showDuration={!(i === cue.tracks.length - 1 && (!cue.totalDuration || cue.totalDuration <= 0))}
                            onUpdate={handleTrackUpdate}
                            onDurationChange={handleDurationChange}
                            onStartTimeChange={handleStartTimeChange}
                            onDelete={handleDeleteTrack}
                        />
                    ))}
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={handleAddRow} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                        add row
                    </button>
                    <button onClick={handleViewCue} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                        view cue
                    </button>
                    <button onClick={handleClear} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                        clear
                    </button>
                    {currentFilePath && (
                        <button onClick={handleSave} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                            save
                        </button>
                    )}
                    <button onClick={handleSaveAs} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                        save as
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-brand-placeholder text-brand-text px-6 py-2 rounded-full shadow-lg font-medium transition-opacity animate-fade-in-up">
                    Saved successfully
                </div>
            )}

            <GnuDbModal
                isOpen={isGnuDbModalOpen}
                onClose={() => setIsGnuDbModalOpen(false)}
                onSuccess={handleGnuDbSuccess}
            />

            <DiscogsModal
                isOpen={isDiscogsModalOpen}
                onClose={() => setIsDiscogsModalOpen(false)}
                onSuccess={handleDiscogsSuccess}
                totalDuration={cue.totalDuration}
            />

            <MusicBrainzModal
                isOpen={isMusicBrainzModalOpen}
                onClose={() => setIsMusicBrainzModalOpen(false)}
                onSuccess={handleMusicBrainzSuccess}
            />

            <ConfirmModal
                isOpen={isConfirmClearOpen}
                title="clear all fields?"
                message="this will reset the entire cue sheet and tracklist. any unsaved changes will be lost."
                onConfirm={confirmClear}
                onCancel={() => setIsConfirmClearOpen(false)}
            />
        </div>
    );
};
