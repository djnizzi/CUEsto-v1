import React, { useState } from 'react';
import { MetadataHeader } from './MetadataHeader';
import { TrackRow } from './TrackRow';
import { CueSheet, CueTrack, generateCue, parseCue } from '../lib/cueParser';
import { timeToFrames } from '../lib/timeUtils';

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

    const handleOpenFile = async () => {
        try {
            const result = await (window as any).ipcRenderer.invoke('dialog:openFile');
            if (result) {
                const { content } = result;
                const parsed = parseCue(content);
                setCue(parsed);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        const data = generateCue(cue);
        try {
            // Force Save As behavior by passing undefined as the path
            const savedPath = await (window as any).ipcRenderer.invoke('dialog:saveFile', data, undefined);
            if (savedPath) {
                showSaveToast();
            } else if (savedPath === true) {
                showSaveToast();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Rendering Helper: Calculate durations for display
    const getRenderDuration = (index: number) => {
        if (index < cue.tracks.length - 1) {
            return cue.tracks[index + 1].index01 - cue.tracks[index].index01;
        }
        return 0; // Last track unknown/infinity
    };

    return (
        <div className="min-h-screen bg-brand-dark text-brand-text font-sans selection:bg-brand-orange selection:text-white">
            {/* Brand Header */}
            <div className="flex justify-center py-6">
                <h1 className="text-4xl font-bold flex items-center gap-2">
                    <img src="/images/logo.png" alt="CUEsto Logo" className="h-20 w-auto" />
                </h1>
            </div>

            <MetadataHeader
                fileName={cue.file}
                albumTitle={cue.title}
                performer={cue.performer}
                date={cue.date || ''}
                genre={cue.genre || ''}
                onUpdate={handleUpdateMetadata}
                onImport={(src) => console.log('Import', src)}
                onOpenFile={handleOpenFile}
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
                    <button onClick={handleSave} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                        save
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-brand-placeholder text-brand-text px-6 py-2 rounded-full shadow-lg font-medium transition-opacity animate-fade-in-up">
                    Saved successfully
                </div>
            )}
        </div>
    );
};
