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
}

const InputGroup = ({ label, value, field, onUpdate }: { label: string, value: string, field: string, onUpdate: (field: string, value: string) => void }) => (
    <div className="flex flex-col flex-1 mx-2">
        <div className="border border-white/20 rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors">
            <input
                type="text"
                value={value}
                onChange={(e) => onUpdate(field, e.target.value)}
                className="bg-transparent w-full outline-none text-brand-text placeholder-[#E8D7C9] font-light"
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
    onSelectAudioFile
}) => {
    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-4 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
                <button onClick={onOpenFile} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                    open file
                </button>
                <button onClick={() => onImport('gnudb')} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                    import from gnudb
                </button>
                <button onClick={() => onImport('1001tracklists')} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                    import from 1001tracklists
                </button>
                <button onClick={() => onImport('discogs')} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                    import from discogs
                </button>
                <button onClick={() => onImport('musicbrainz')} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                    import from musicbrainz
                </button>
                <button onClick={() => onImport('audacity')} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                    import audacity labels
                </button>
            </div>

            <div className="w-full">
                <div className="border border-white/20 rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors mb-4 mx-2">
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => onUpdate('fileName', e.target.value)}
                        className="bg-transparent w-full outline-none text-brand-text placeholder-[#E8D7C9] font-light"
                        placeholder="file name"
                    />
                    {totalDuration !== undefined && totalDuration > 0 && (
                        <span className="text-brand-text text-sm font-light px-2 whitespace-nowrap">
                            {framesToTime(totalDuration)}
                        </span>
                    )}
                    <button
                        onClick={onSelectAudioFile}
                        className="text-brand-orange hover:text-brand-text transition ml-1"
                        title="Select audio file"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.625 0C18.0469 0 23.25 5.20312 23.25 11.625C23.25 18.0469 18.0469 23.25 11.625 23.25C5.20312 23.25 0 18.0469 0 11.625C0 5.20312 5.20312 0 11.625 0ZM11.625 21.75C17.2031 21.75 21.75 17.25 21.75 11.625C21.75 6.04688 17.2031 1.5 11.625 1.5C6 1.5 1.5 6.04688 1.5 11.625C1.5 17.25 6 21.75 11.625 21.75ZM11.625 7.125C14.1094 7.125 16.125 9.14062 16.125 11.625C16.125 14.1094 14.1094 16.125 11.625 16.125C9.14062 16.125 7.125 14.1094 7.125 11.625C7.125 9.14062 9.14062 7.125 11.625 7.125ZM11.625 14.625C13.2656 14.625 14.625 13.3125 14.625 11.625C14.625 9.98438 13.2656 8.625 11.625 8.625C9.9375 8.625 8.625 9.98438 8.625 11.625C8.625 13.3125 9.9375 14.625 11.625 14.625ZM11.625 10.5C12.2344 10.5 12.75 11.0156 12.75 11.625C12.75 12.2812 12.2344 12.75 11.625 12.75C10.9688 12.75 10.5 12.2812 10.5 11.625C10.5 11.0156 10.9688 10.5 11.625 10.5ZM11.25 3.75V5.25C7.92188 5.25 5.25 7.96875 5.25 11.25H3.75C3.75 7.125 7.07812 3.75 11.25 3.75Z" fill="currentColor" />
                        </svg>
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
