import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onConfirm();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div
                className="bg-[#34302C] p-8 rounded-[32px] shadow-2xl w-full max-w-[440px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6"
                onKeyDown={handleKeyDown}
                tabIndex={0}
                autoFocus
            >
                {/* Title */}
                <h2 className="text-brand-text font-semibold text-[15px] leading-tight capitalize">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-[#A8A29E] text-[15px] font-light leading-relaxed">
                    {message}
                </p>

                {/* Footer with Buttons */}
                <div className="flex justify-end gap-5 mt-4">

                    <button
                        onClick={onCancel}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        title="cancel"
                    >
                        <img src="icons/cancel.svg" alt="cancel" className="w-[24px] h-[24px]" />
                    </button>
                    <button
                        onClick={onConfirm}
                        className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
                        title="clear all"
                    >
                        <img src="icons/ok.svg" alt="clear all" className="w-[24px] h-[24px]" />
                    </button>


                </div>
            </div>
            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onCancel} />
        </div>
    );
};
