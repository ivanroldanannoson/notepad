import React from 'react';
import { X } from 'lucide-react';

const SHORTCUTS = [
    {
        category: 'File', items: [
            { keys: '⌥N', desc: 'New Tab' },
            { keys: '⌘O', desc: 'Open File' },
            { keys: '⌘S', desc: 'Save' },
            { keys: '⇧⌘S', desc: 'Save As' },
        ]
    },
    {
        category: 'Edit', items: [
            { keys: '⇧⌥F', desc: 'Format Document' },
            { keys: '⌘A', desc: 'Select All' },
            { keys: '⌘F', desc: 'Find' },
            { keys: '⌘H', desc: 'Find & Replace' },
            { keys: '⌘Z', desc: 'Undo' },
            { keys: '⇧⌘Z', desc: 'Redo' },
        ]
    },
    {
        category: 'View', items: [
            { keys: '⌘+', desc: 'Zoom In' },
            { keys: '⌘-', desc: 'Zoom Out' },
            { keys: '⇧⌘P', desc: 'Command Palette' },
            { keys: '⇧⌘F', desc: 'Global Search' },
            { keys: '⌘K Z', desc: 'Zen Mode' },
            { keys: '⌘/', desc: 'Keyboard Shortcuts' },
            { keys: '⌘,', desc: 'Settings' },
        ]
    },
];

export default function ShortcutSheet({ isOpen, onClose, isDark }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className={`w-full max-w-lg rounded-2xl overflow-hidden flex flex-col border ${isDark ? 'bg-[#2a2a2e] border-white/10' : 'bg-white border-gray-200 shadow-2xl'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`h-12 flex items-center justify-between px-5 border-b ${isDark ? 'bg-[#333338] border-white/5' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <span className="text-[13px] font-bold">Keyboard Shortcuts</span>
                    <button className={`p-1 rounded-md ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-400'}`} onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
                    {SHORTCUTS.map(group => (
                        <div key={group.category}>
                            <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {group.category}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map(item => (
                                    <div key={item.keys} className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                                        }`}>
                                        <span className={`text-[13px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.desc}</span>
                                        <kbd className={`text-[11px] font-mono px-2 py-1 rounded-md border ${isDark ? 'bg-[#1e1e1e] border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                                            }`}>{item.keys}</kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
