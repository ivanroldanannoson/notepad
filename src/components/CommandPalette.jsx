import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const ALL_COMMANDS = [
    { id: 'newTab', label: 'New Tab', shortcut: '⌥N', category: 'File' },
    { id: 'open', label: 'Open File...', shortcut: '⌘O', category: 'File' },
    { id: 'save', label: 'Save', shortcut: '⌘S', category: 'File' },
    { id: 'saveAs', label: 'Save As...', shortcut: '⇧⌘S', category: 'File' },
    { id: 'format', label: 'Format Document', shortcut: '⇧⌥F', category: 'Edit' },
    { id: 'selectAll', label: 'Select All', shortcut: '⌘A', category: 'Edit' },
    { id: 'find', label: 'Find', shortcut: '⌘F', category: 'Edit' },
    { id: 'replace', label: 'Find & Replace', shortcut: '⌘H', category: 'Edit' },
    { id: 'toggleTheme', label: 'Toggle Dark/Light Mode', shortcut: '', category: 'View' },
    { id: 'toggleWrap', label: 'Toggle Word Wrap', shortcut: '', category: 'View' },
    { id: 'zoomIn', label: 'Zoom In', shortcut: '⌘+', category: 'View' },
    { id: 'zoomOut', label: 'Zoom Out', shortcut: '⌘-', category: 'View' },
    { id: 'diffView', label: 'Compare Files', shortcut: '', category: 'View' },
    { id: 'exportImage', label: 'Export as Image', shortcut: '', category: 'File' },
    { id: 'exportPdf', label: 'Export as PDF', shortcut: '', category: 'File' },
    { id: 'globalSearch', label: 'Global Search', shortcut: '⇧⌘F', category: 'View' },
    { id: 'toggleSidebar', label: 'Toggle Sidebar', shortcut: '', category: 'View' },
    { id: 'toggleZenMode', label: 'Toggle Zen Mode', shortcut: '⌘K Z', category: 'View' },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', shortcut: '⌘/', category: 'Help' },
    { id: 'settings', label: 'Open Settings', shortcut: '⌘,', category: 'View' },
];

export default function CommandPalette({ isOpen, onClose, onExecute, isDark }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filtered = ALL_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    );

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
        else if (e.key === 'Enter' && filtered[selectedIndex]) { onExecute(filtered[selectedIndex].id); onClose(); }
        else if (e.key === 'Escape') onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex justify-center pt-[15vh]" onClick={onClose}>
            <div
                className={`w-[520px] max-h-[400px] rounded-xl overflow-hidden flex flex-col shadow-2xl border ${isDark ? 'bg-[#252526] border-[#3c3c3c] shadow-black/60' : 'bg-white border-gray-200 shadow-gray-300/50'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Input */}
                <div className={`flex items-center gap-3 px-4 h-12 border-b ${isDark ? 'border-[#3c3c3c]' : 'border-gray-100'}`}>
                    <Search size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a command..."
                        className={`flex-1 bg-transparent outline-none text-[14px] font-medium ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
                    />
                    <button onClick={onClose} className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                        <X size={14} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                    </button>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto py-1">
                    {filtered.length === 0 && (
                        <div className={`px-4 py-6 text-center text-[13px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            No commands found
                        </div>
                    )}
                    {filtered.map((cmd, i) => (
                        <button
                            key={cmd.id}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors ${i === selectedIndex
                                ? (isDark ? 'bg-blue-600/30 text-white' : 'bg-blue-50 text-blue-700')
                                : (isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50')
                                }`}
                            onClick={() => { onExecute(cmd.id); onClose(); }}
                            onMouseEnter={() => setSelectedIndex(i)}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${isDark ? 'text-gray-500 bg-white/5' : 'text-gray-400 bg-gray-100'
                                    }`}>{cmd.category}</span>
                                <span className="font-medium">{cmd.label}</span>
                            </div>
                            {cmd.shortcut && (
                                <span className={`text-[11px] font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{cmd.shortcut}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
