import React from 'react';
import { TimeInput } from './TimeInput';
import { CueTrack } from '../lib/cueParser';
import { framesToTime } from '../lib/timeUtils';

interface TrackRowProps {
    track: CueTrack;
    index: number;
    durationFrames: number;
    onUpdate: (index: number, field: keyof CueTrack, value: any) => void;
    onDurationChange: (index: number, newDurationStr: string) => void;
    onStartTimeChange: (index: number, newStartTimeStr: string) => void;
    onDelete: (index: number) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
    track,
    index,
    durationFrames,
    onUpdate,
    onDurationChange,
    onStartTimeChange,
    onDelete
}) => {
    return (
        <div className="flex items-center gap-2 py-1 text-brand-text">
            {/* Index */}
            <div className="w-8 text-center text-gray-400 text-sm">{index + 1}</div>

            {/* Title */}
            <div className="flex-1">
                <div className="border border-white/20 rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange">
                    <input
                        className="bg-transparent w-full outline-none text-sm text-brand-text font-light"
                        value={track.title}
                        onChange={(e) => onUpdate(index, 'title', e.target.value)}
                        placeholder="title"
                    />
                </div>
            </div>

            {/* Performer */}
            <div className="flex-1">
                <div className="border border-white/20 rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange">
                    <input
                        className="bg-transparent w-full outline-none text-sm text-brand-text font-light"
                        value={track.performer}
                        onChange={(e) => onUpdate(index, 'performer', e.target.value)}
                        placeholder="performer"
                    />
                </div>
            </div>

            {/* Start Time */}
            <div className="w-24">
                <div className="border border-white/20 rounded-full px-3 py-1 flex items-center justify-center bg-transparent focus-within:border-brand-orange">
                    <TimeInput
                        value={framesToTime(track.index01)}
                        onChange={(val) => onStartTimeChange(index, val)}
                        className="bg-transparent w-full text-center text-sm"
                    />
                </div>
            </div>

            {/* Duration */}
            <div className="w-24">
                <div className="border border-white/20 rounded-full px-3 py-1 flex items-center justify-center bg-transparent focus-within:border-brand-orange">
                    <TimeInput
                        value={framesToTime(durationFrames)}
                        onChange={(val) => onDurationChange(index, val)}
                        className="bg-transparent w-full text-center text-sm"
                    />
                </div>
            </div>

            {/* Delete */}
            <button onClick={() => onDelete(index)} className="w-8 flex justify-center text-brand-orange hover:text-brand-text transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 448 512"><path d="M177.7 32h92.5c5.5 0 10.6 2.8 13.6 7.5L299.1 64H148.9l15.3-24.5c2.9-4.7 8.1-7.5 13.6-7.5zM336.9 64L311 22.6C302.2 8.5 286.8 0 270.3 0H177.7C161.2 0 145.8 8.5 137 22.6L111.1 64H64.1 32 16C7.2 64 0 71.2 0 80s7.2 16 16 16H34.3L59.8 452.6C62.1 486.1 90 512 123.6 512H324.4c33.6 0 61.4-25.9 63.8-59.4L413.7 96H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H416 383.9 336.9zm44.8 32L356.3 450.3C355.1 467 341.2 480 324.4 480H123.6c-16.8 0-30.7-13-31.9-29.7L66.4 96H381.6z" /></svg>
            </button>
        </div>
    );
};
