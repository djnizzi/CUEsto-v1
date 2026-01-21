import React, { useState } from 'react';
import { Language, languageNames, getCurrentLanguage, setCurrentLanguage } from '../lib/i18n';
import { getTranslations } from '../lib/i18n';


interface LanguageSelectorProps {
    onLanguageChange: (lang: Language) => void;
    variant?: 'default' | 'icon';
    direction?: 'up' | 'down';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    onLanguageChange,
    variant = 'default',
    direction = 'down'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage());
    const handleLanguageSelect = (lang: Language) => {
        setCurrentLang(lang);
        setCurrentLanguage(lang);
        onLanguageChange(lang);
        setIsOpen(false);
    };

    const languages: Language[] = ['en', 'de', 'es', 'fr', 'it'];
    const t = getTranslations(currentLang);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all flex items-center gap-2 ${variant === 'icon' ? '' : ''}`}
                data-tooltip={t.selectLanguage}
            >
                <img src="icons/language.svg" alt="language" className="size-6" />
                {variant === 'default' && (
                    <span className="text-sm font-light text-brand-text">{languageNames[currentLang]}</span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className={`absolute right-0 bg-brand-surface border rounded-dropdown border-white/10 shadow-2xl overflow-hidden z-50 min-w-[80px] ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
                        }`}>
                        {languages.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => handleLanguageSelect(lang)}
                                className={`w-full px-4 py-1 text-center transition-colors ${lang === currentLang
                                    ? 'text-black bg-brand-orange'
                                    : 'text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)]'
                                    }`}
                            >
                                <span className="font-light">{languageNames[lang]}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
