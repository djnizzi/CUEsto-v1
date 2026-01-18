import React from 'react';
import { framesToTime } from '../lib/timeUtils';

interface MetadataHeaderProps {
    fileName: string;
    albumTitle: string;
    performer: string;
    date: string;
    genre: string;
    totalDuration?: number;
    onUpdate: (field: string, value: string) => void;
    onImport: (source: string) => void;
    onOpenFile: () => void;
    onSelectAudioFile: () => void;
    isAudioResolved: boolean;
    showAudioError: boolean;
}

const InputGroup = ({ label, value, field, onUpdate }: { label: string, value: string, field: string, onUpdate: (field: string, value: string) => void }) => (
    <div className="flex flex-col flex-1 mx-2">
        <div className="border border-white/20 rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors">
            <input
                type="text"
                value={value}
                onChange={(e) => onUpdate(field, e.target.value)}
                className="bg-transparent w-full outline-none text-brand-text placeholder-brand-placeholder font-light"
                placeholder={label}
            />
        </div>
    </div>
);

export const MetadataHeader: React.FC<MetadataHeaderProps> = ({
    fileName,
    albumTitle,
    performer,
    date,
    genre,
    totalDuration,
    onUpdate,
    onImport,
    onOpenFile,
    onSelectAudioFile,
    isAudioResolved,
    showAudioError
}) => {
    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-center mb-6 gap-6">
                <button
                    onClick={onOpenFile}
                    className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                    data-tooltip="open file"
                >
                    <img src="icons/open.svg" alt="open file" className="size-6" />
                </button>

                <div className="flex items-center gap-6 border-l border-white/20 pl-6 h-6 middle">
                    <span className="text-brand-text text-sm font-light select-none">get data from</span>

                    <button
                        onClick={() => onImport('musicbrainz')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip="import from musicbrainz"
                    >
                        <img src="images/musicbrainz.svg" alt="musicbrainz" className="w-[116px] h-[18px]" />
                    </button>

                    <button
                        onClick={() => onImport('gnudb')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip="import from gnudb"
                    >
                        <img src="images/gnudb.svg" alt="gnudb" className="w-[100px] h-[31px]" />
                    </button>

                    <button
                        onClick={() => onImport('audacity')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip="import audacity labels"
                    >
                        <img src="images/audacity.svg" alt="audacity" className="w-[112px] h-[32px]" />
                    </button>

                    <button
                        onClick={() => onImport('1001tracklists')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip="import from 1001tracklists"
                    >
                        <img src="images/tracklists.svg" alt="1001tracklists" className="w-[116px] h-[13px]" />
                    </button>

                    <button
                        onClick={() => onImport('discogs')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip="import from discogs"
                    >
                        <img src="images/discogs.svg" alt="discogs" className="w-[67px] h-[25px]" />
                    </button>
                </div>
            </div>

            <div className="w-full">
                <div className={`border rounded-full px-3 py-1 flex items-center bg-transparent transition-colors mb-4 ${isAudioResolved ? 'border-white/20 focus-within:border-brand-orange' : (showAudioError ? 'border-red-500/50 focus-within:border-red-500' : 'border-white/20 focus-within:border-brand-orange')}`}>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => onUpdate('fileName', e.target.value)}
                        className="bg-transparent w-full min-w-0 outline-none text-brand-text placeholder-brand-placeholder font-light"
                        placeholder="file name"
                    />
                    {totalDuration !== undefined && totalDuration > 0 && (
                        <span className="text-brand-text text-sm font-light px-2 whitespace-nowrap">
                            {framesToTime(totalDuration)}
                        </span>
                    )}
                    <button
                        onClick={onSelectAudioFile}
                        className={`${isAudioResolved ? 'text-brand-orange' : (showAudioError ? 'text-red-500' : 'text-brand-orange')} hover:drop-shadow-[0_0_8px_currentColor] transition ml-1`}
                        data-tooltip={isAudioResolved ? "audio file resolved" : "audio file NOT found - click to select"}
                    >
                        <img
                            src="icons/audiofile.svg"
                            alt="audio file"
                            className="size-6"
                            style={{ filter: isAudioResolved ? 'none' : (showAudioError ? 'sepia(1) saturate(5) hue-rotate(-50deg)' : 'none') }}
                        />
                    </button>
                </div>
                <div className="flex mb-2">
                    <InputGroup label="album title" value={albumTitle} field="title" onUpdate={onUpdate} />
                    <InputGroup label="date" value={date} field="date" onUpdate={onUpdate} />
                </div>
                <div className="flex">
                    <InputGroup label="performer" value={performer} field="performer" onUpdate={onUpdate} />
                    <InputGroup label="genre" value={genre} field="genre" onUpdate={onUpdate} />
                </div>
            </div>
        </div>
    );
};
