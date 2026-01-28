import React from 'react';
import { framesToTime } from '../lib/timeUtils';
import { Translations } from '../lib/i18n';

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
    t: Translations;
}

const InputGroup = ({ label, value, field, onUpdate }: { label: string, value: string, field: string, onUpdate: (field: string, value: string) => void }) => (
    <div className="flex flex-col flex-1 mx-2">
        <div className="border border-brand-input-border rounded-full px-3 py-1 flex items-center bg-transparent focus-within:border-brand-orange transition-colors">
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
    showAudioError,
    t
}) => {
    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-center mb-6 gap-6">
                <button
                    onClick={onOpenFile}
                    className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                    data-tooltip={t.openFile}
                >
                    <img src="icons/open.svg" alt="open file" className="size-6" />
                </button>

                <div className="flex items-center gap-6 border-l border-white/20 pl-6 h-6 middle">
                    <span className="text-brand-text text-sm font-light select-none">{t.getDataFrom}</span>

                    <button
                        onClick={() => onImport('musicbrainz')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={t.importFromMusicBrainz}
                    >
                        <img src="images/musicbrainz.svg" alt="musicbrainz" className="w-[21.69px] h-[24px]" />
                    </button>

                    <button
                        onClick={() => onImport('gnudb')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={t.importFromGnudb}
                    >
                        <img src="images/gnudb.svg" alt="gnudb" className="w-[23.65px] h-[24px]" />
                    </button>

                    <button
                        onClick={() => onImport('audacity')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={t.importAudacityLabels}
                    >
                        <img src="images/audacity.svg" alt="audacity" className="w-[24px] h-[19.69px]" />
                    </button>

                    <button
                        onClick={() => onImport('1001tracklists')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={t.importFrom1001Tracklists}
                    >
                        <img src="images/tracklists.svg" alt="1001tracklists" className="w-[24px] h-[19.75px]" />
                    </button>

                    <button
                        onClick={() => onImport('discogs')}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        data-tooltip={t.importFromDiscogs}
                    >
                        <img src="images/discogs.svg" alt="discogs" className="w-[23.78px] h-[24px]" />
                    </button>
                </div>
            </div>

            <div className="w-full">
                <div className={`mx-2 border rounded-full px-3 py-1 flex items-center bg-transparent transition-colors mb-2 ${isAudioResolved ? 'border-brand-input-border focus-within:border-brand-orange' : (showAudioError ? 'border-red-500/50 focus-within:border-red-500' : 'border-brand-input-border focus-within:border-brand-orange')}`}>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => onUpdate('fileName', e.target.value)}
                        className="bg-transparent w-full min-w-0 outline-none text-brand-text placeholder-brand-placeholder font-light"
                        placeholder={t.fileName}
                    />
                    {totalDuration !== undefined && totalDuration > 0 && (
                        <span className="text-brand-text text-sm font-light px-2 whitespace-nowrap">
                            {framesToTime(totalDuration)}
                        </span>
                    )}
                    <button
                        onClick={onSelectAudioFile}
                        className={`${isAudioResolved ? 'text-brand-orange' : (showAudioError ? 'text-red-500' : 'text-brand-orange')} hover:drop-shadow-[0_0_8px_currentColor] transition ml-1`}
                        data-tooltip={isAudioResolved ? t.audioFileResolved : t.audioFileNotFound}
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
                    <InputGroup label={t.albumTitle} value={albumTitle} field="title" onUpdate={onUpdate} />
                    <InputGroup label={t.date} value={date} field="date" onUpdate={onUpdate} />
                </div>
                <div className="flex">
                    <InputGroup label={t.performer} value={performer} field="performer" onUpdate={onUpdate} />
                    <InputGroup label={t.genre} value={genre} field="genre" onUpdate={onUpdate} />
                </div>
            </div>
        </div>
    );
};
