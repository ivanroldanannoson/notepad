import { useState, useEffect } from 'react';

const STORAGE_KEY = 'notepad_settings';

const DEFAULT_SETTINGS = {
    fontSize: 14,
    tabSize: 4,
    wordWrap: true,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
    showMinimap: false,
    autoSave: false,
    showIndentationGuides: true,
};

/**
 * Persisted editor settings hook.
 */
export function useSettings() {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const increaseFontSize = () => updateSetting('fontSize', Math.min(settings.fontSize + 1, 32));
    const decreaseFontSize = () => updateSetting('fontSize', Math.max(settings.fontSize - 1, 8));
    const toggleWordWrap = () => updateSetting('wordWrap', !settings.wordWrap);

    return { settings, updateSetting, increaseFontSize, decreaseFontSize, toggleWordWrap };
}
