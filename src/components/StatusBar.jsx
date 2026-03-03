import React from 'react';
import { languages } from '../constants/languages';
import { Settings } from 'lucide-react';

export default function StatusBar({ cursorPos, activeTab, isDark, settings, onOpenSettings }) {
    const langName = languages.find(l => l.id === activeTab?.language)?.name || 'Plain Text';

    return (
        <div className={`h-[26px] flex items-center justify-between px-4 text-[11px] font-medium select-none shrink-0 ${isDark ? 'bg-[#007acc] text-white/90' : 'bg-[#f8f8f8] text-gray-500 border-t border-gray-200/60'
            }`}>
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                    <div className={`w-[6px] h-[6px] rounded-full ${isDark ? 'bg-green-300' : 'bg-green-500'}`} />
                    <span>Ready</span>
                </div>
                <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>
            </div>
            <div className="flex items-center gap-4">
                <span>{langName}</span>
                <span>UTF-8</span>
                {settings && <span>Spaces: {settings.tabSize}</span>}
                <button
                    onClick={onOpenSettings}
                    className={`p-0.5 rounded transition-colors ${isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'}`}
                    title="Settings"
                >
                    <Settings size={12} />
                </button>
            </div>
        </div>
    );
}
