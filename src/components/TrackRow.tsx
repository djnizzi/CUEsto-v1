import React from 'react';
import { TimeInput } from './TimeInput';
import { CueTrack } from '../lib/cueParser';
import { framesToTime } from '../lib/timeUtils';
import { Translations } from '../lib/i18n';

interface TrackRowProps {
    track: CueTrack;
    index: number;
    durationFrames: number;
    onUpdate: (index: number, field: keyof CueTrack, value: any) => void;
    onDurationChange: (index: number, newDurationStr: string) => void;
    onStartTimeChange: (index: number, newStartTimeStr: string) => void;
    onDelete: (index: number) => void;
    isDurationReadOnly?: boolean;
    showDuration?: boolean;
    t: Translations;
}

export const TrackRow: React.FC<TrackRowProps> = ({
    track,
    index,
    durationFrames,
    onUpdate,
    onDurationChange,
    onStartTimeChange,
    onDelete,
    isDurationReadOnly,
    showDuration = true,
    t
}) => {
    return (
        <div className="flex items-center gap-2 py-1 text-brand-text">
            {/* Index */}
            <div className="w-8 text-center text-brand-text text-sm">{index + 1}</div>

            {/* Title */}
            <div className="flex-1">
                <div className="border border-white/20 rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange">
                    <input
                        className="bg-transparent w-full outline-none text-sm text-brand-text font-light"
                        value={track.title}
                        onChange={(e) => onUpdate(index, 'title', e.target.value)}
                        placeholder={t.title}
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
                        placeholder={t.performer}
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
                {showDuration ? (
                    <div className={`${isDurationReadOnly ? 'border-none' : 'border border-white/20 rounded-full'} px-3 py-1 flex items-center justify-center bg-transparent ${isDurationReadOnly ? '' : 'focus-within:border-brand-orange'}`}>
                        <TimeInput
                            value={framesToTime(durationFrames)}
                            onChange={(val) => !isDurationReadOnly && onDurationChange(index, val)}
                            className={`bg-transparent w-full text-center text-sm text-brand-text ${isDurationReadOnly ? 'cursor-default' : ''}`}
                            readOnly={isDurationReadOnly}
                        />
                    </div>
                ) : (
                    <div className="h-[30px]" /> /* Spacer to maintain alignment */
                )}
            </div>

            {/* Delete */}
            <button
                onClick={() => onDelete(index)}
                className="w-8 flex justify-center text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                data-tooltip={t.deleteTrack}
            >
                <img src="icons/trash.svg" alt="delete" className="w-6 h-6" />
            </button>
        </div>
    );
};
