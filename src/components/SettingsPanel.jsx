import React from 'react';
import { X, Minus, Plus } from 'lucide-react';

const FONT_OPTIONS = [
    { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
    { label: 'Fira Code', value: "'Fira Code', monospace" },
    { label: 'SF Mono', value: "'SF Mono', 'Menlo', monospace" },
    { label: 'Cascadia Code', value: "'Cascadia Code', monospace" },
    { label: 'Consolas', value: "'Consolas', monospace" },
    { label: 'Monaco', value: "'Monaco', monospace" },
];

export default function SettingsPanel({ isOpen, onClose, settings, updateSetting, isDark }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className={`w-full max-w-md rounded-2xl overflow-hidden flex flex-col border ${isDark ? 'bg-[#2a2a2e] border-white/10' : 'bg-white border-gray-200 shadow-2xl'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`h-12 flex items-center justify-between px-5 border-b ${isDark ? 'bg-[#333338] border-white/5' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <span className="text-[13px] font-bold">Settings</span>
                    <button className={`p-1 rounded-md ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-400'}`} onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Font Size */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Font Size</div>
                            <div className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Editor font size in pixels</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateSetting('fontSize', Math.max(settings.fontSize - 1, 8))}
                                className={`p-1.5 rounded-lg border ${isDark ? 'border-white/10 hover:bg-white/5 text-gray-400' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                            ><Minus size={14} /></button>
                            <span className={`text-[14px] font-bold w-8 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>{settings.fontSize}</span>
                            <button
                                onClick={() => updateSetting('fontSize', Math.min(settings.fontSize + 1, 32))}
                                className={`p-1.5 rounded-lg border ${isDark ? 'border-white/10 hover:bg-white/5 text-gray-400' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                            ><Plus size={14} /></button>
                        </div>
                    </div>

                    <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

                    {/* Tab Size */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Tab Size</div>
                            <div className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Number of spaces per tab</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {[2, 4, 8].map(s => (
                                <button
                                    key={s}
                                    className={`px-3 py-1.5 text-[12px] font-bold rounded-lg border transition-colors ${settings.tabSize === s
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : (isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50')
                                        }`}
                                    onClick={() => updateSetting('tabSize', s)}
                                >{s}</button>
                            ))}
                        </div>
                    </div>

                    <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

                    {/* Word Wrap */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Word Wrap</div>
                            <div className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Wrap long lines in the editor</div>
                        </div>
                        <button
                            onClick={() => updateSetting('wordWrap', !settings.wordWrap)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${settings.wordWrap ? 'bg-blue-500' : (isDark ? 'bg-white/10' : 'bg-gray-200')}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${settings.wordWrap ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

                    {/* Auto-save */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Auto-save</div>
                            <div className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Automatically save changes periodically</div>
                        </div>
                        <button
                            onClick={() => updateSetting('autoSave', !settings.autoSave)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${settings.autoSave ? 'bg-blue-500' : (isDark ? 'bg-white/10' : 'bg-gray-200')}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${settings.autoSave ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

                    {/* Indentation Guides */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Indentation Guides</div>
                            <div className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Show visual vertical lines for nested code</div>
                        </div>
                        <button
                            onClick={() => updateSetting('showIndentationGuides', !settings.showIndentationGuides)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${settings.showIndentationGuides ? 'bg-blue-500' : (isDark ? 'bg-white/10' : 'bg-gray-200')}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${settings.showIndentationGuides ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

                    {/* Font Family */}
                    <div>
                        <div className={`text-[13px] font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Editor Font</div>
                        <div className="space-y-1">
                            {FONT_OPTIONS.map(opt => (
                                <button
                                    key={opt.label}
                                    className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors flex items-center justify-between ${settings.fontFamily === opt.value
                                        ? (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                        : (isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50')
                                        }`}
                                    onClick={() => updateSetting('fontFamily', opt.value)}
                                    style={{ fontFamily: opt.value }}
                                >
                                    <span>{opt.label}</span>
                                    {settings.fontFamily === opt.value && <span className="text-[11px]">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
