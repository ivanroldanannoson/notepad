import React, { useState } from 'react';
import { Search, X, ChevronRight, FileCode } from 'lucide-react';

export default function GlobalSearch({ isOpen, onClose, tabs, onSelectResult, isDark }) {
    const [query, setQuery] = useState('');

    if (!isOpen) return null;

    const results = query.trim().length >= 2 ? tabs.map(tab => {
        const lines = (tab.content || '').split('\n');
        const matches = lines.map((line, idx) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
                return { lineNum: idx + 1, content: line.trim() };
            }
            return null;
        }).filter(Boolean);

        if (matches.length > 0) {
            return { tabId: tab.id, filename: tab.filename, matches };
        }
        return null;
    }).filter(Boolean) : [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className={`w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col border max-h-[80vh] ${isDark ? 'bg-[#2a2a2e] border-white/10' : 'bg-white border-gray-200 shadow-2xl'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'bg-[#333338] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Search across all open files..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-[14px] flex-1 font-medium"
                    />
                    <button onClick={onClose} className="p-1 hover:bg-black/5 rounded">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                    {results.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <Search size={32} opacity={0.3} />
                            <span className="text-[13px]">{query.length < 2 ? 'Type at least 2 characters...' : 'No matches found.'}</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {results.map(res => (
                                <div key={res.tabId} className="rounded-xl overflow-hidden">
                                    <div className={`px-3 py-1.5 flex items-center gap-2 text-[12px] font-bold ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                        <FileCode size={14} />
                                        {res.filename}
                                        <span className="ml-auto opacity-60 font-medium">{res.matches.length} matches</span>
                                    </div>
                                    <div className="flex flex-col">
                                        {res.matches.map((m, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { onSelectResult(res.tabId, m.lineNum); onClose(); }}
                                                className={`flex items-center gap-4 px-4 py-2 text-left transition-colors ${isDark ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50'
                                                    }`}
                                            >
                                                <span className="text-[11px] font-mono text-gray-500 w-8 text-right shrink-0">{m.lineNum}</span>
                                                <span className="text-[13px] truncate font-mono opacity-80">{m.content}</span>
                                                <ChevronRight size={14} className="ml-auto opacity-30" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`px-4 py-2 text-[11px] border-t ${isDark ? 'bg-[#333338] border-white/5 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                    Searching in {tabs.length} open files • ↵ to select • esc to close
                </div>
            </div>
        </div>
    );
}
