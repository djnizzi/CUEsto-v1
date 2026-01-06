import React, { useState, useEffect } from 'react';
import { isValidTimeFormat } from '../lib/timeUtils';

interface TimeInputProps {
    value: string;
    onChange: (val: string) => void;
    onBlur?: () => void;
    className?: string;
    placeholder?: string;
    readOnly?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, onBlur, className, placeholder, readOnly }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow typing only valid chars (digits and colon)
        if (/^[0-9:]*$/.test(val)) {
            setLocalValue(val);
        }
    };

    const handleBlur = () => {
        // Validate on blur
        // If valid, call onChange. If not, revert or keep? 
        // Let's try to fix or just pass.
        // For now simple pass if valid-ish.
        if (isValidTimeFormat(localValue)) {
            onChange(localValue);
        } else {
            // Maybe try to auto-format? for now, revert if completely broken, or just emit if user forcing.
            // But parent logic depends on validity.
            // Let's revert to last valid prop value if invalid
            if (value !== localValue) {
                // Check if it's correctable e.g. "75:00" -> "75:00:00"
                // TODO: Add smart correction.
                onChange(localValue); // Pass it up, let parent validate or calculation fail gracefully (0 frames).
            }
        }
        if (onBlur) onBlur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        <input
            type="text"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`bg-transparent text-brand-text outline-none text-center font-light ${className}`}
            placeholder={placeholder || "MM:SS:FF"}
            readOnly={readOnly}
        />
    );
};
