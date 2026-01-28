import React from 'react';
import { useTheme } from '../lib/themeContext';
import { getTranslations, Language } from '../lib/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageChange: (lang: Language) => void;
  currentLanguage: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onLanguageChange,
  currentLanguage,
}) => {
  const { theme, setTheme } = useTheme();
  const t = getTranslations(currentLanguage);

  if (!isOpen) return null;

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'english' },
    { code: 'de', name: 'deutsch' },
    { code: 'es', name: 'español' },
    { code: 'fr', name: 'français' },
    { code: 'it', name: 'italiano' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div
        className="bg-brand-surface p-8 rounded-modal shadow-2xl w-full max-w-[280px] border border-white/5 transition-all duration-300 relative overflow-hidden flex flex-col gap-6"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        autoFocus
      >
        {/* Title */}
        <h2 className="text-brand-text font-semibold text-modal-body leading-tight">
          {t.settings}
        </h2>

        {/* Content */}
        <div className="flex gap-8">
          {/* Language Section */}
          <div className="flex-1">
            <div className="space-y-3">
              {languages.map((lang) => (
                <label key={lang.code} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={currentLanguage === lang.code}
                    onChange={() => onLanguageChange(lang.code)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-1 flex items-center justify-center ${currentLanguage === lang.code
                    ? 'border-brand-orange bg-brand-orange'
                    : 'border-brand-muted-text'
                    }`}>
                    {currentLanguage === lang.code && (
                      <div className="w-2 h-2 rounded-full bg-brand-surface"></div>
                    )}
                  </div>
                  <span className="text-brand-text text-modal-body font-light leading-relaxed">{lang.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Theme Section */}
          <div className="flex">
            <div className="flex py-10 flex-col gap-4 pr-10">

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border-1 transition-all hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] ${theme === 'dark'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-brand-muted-text/0 hover:border-brand-orange text-brand-muted-text'
                  }`}
                data-tooltip={t.darkMode}
              >
                <img src="icons/moon.svg" alt="Dark mode" className="w-6 h-6" style={{ filter: theme === 'dark' ? 'none' : 'brightness(0.9)' }} />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border-1 transition-all hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] ${theme === 'light'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-brand-muted-text/0 hover:border-brand-orange text-brand-muted-text'
                  }`}
                data-tooltip={t.lightMode}
              >
                <img src="icons/sun.svg" alt="Light mode" className="w-6 h-6" style={{ filter: theme === 'light' ? 'none' : 'brightness(0.9)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-brand-orange hover:drop-shadow-[0_0_8px_var(--color-brand-orange)] transition-all"
            data-tooltip={t.close}
          >
            <img src="icons/ok.svg" alt="Close" className="size-6" />
          </button>
        </div>
      </div>
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};