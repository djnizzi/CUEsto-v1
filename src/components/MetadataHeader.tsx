import React from 'react';

interface MetadataHeaderProps {
    fileName: string;
    albumTitle: string;
    performer: string;
    date: string;
    genre: string;
    onUpdate: (field: string, value: string) => void;
    onImport: (source: string) => void;
    onOpenFile: () => void;
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
    onUpdate,
    onImport,
    onOpenFile
}) => {
    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-4 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
                <button onClick={onOpenFile} className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm">
                    open file
                </button>
                {['gnudb', '1001tracklists', 'discogs', 'audacity'].map(src => (
                    <button
                        key={src}
                        onClick={() => onImport(src)}
                        className="bg-brand-orange text-brand-darker font-medium rounded-full px-4 py-2 hover:shadow-[0_0_8px_var(--color-brand-orange)] transition text-sm"
                    >
                        import from {src}
                    </button>
                ))}
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
