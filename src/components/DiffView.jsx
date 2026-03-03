import React, { useState } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';

/**
 * Side-by-side diff view comparing two tabs' content.
 */
export default function DiffView({ isOpen, onClose, tabs, isDark }) {
    const [leftId, setLeftId] = useState(tabs[0]?.id || '');
    const [rightId, setRightId] = useState(tabs[1]?.id || tabs[0]?.id || '');

    if (!isOpen) return null;

    const leftTab = tabs.find(t => t.id === leftId);
    const rightTab = tabs.find(t => t.id === rightId);

    const leftLines = (leftTab?.content || '').split('\n');
    const rightLines = (rightTab?.content || '').split('\n');
    const maxLines = Math.max(leftLines.length, rightLines.length);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className={`w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden flex flex-col border ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200 shadow-2xl'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`h-12 flex items-center justify-between px-5 border-b shrink-0 ${isDark ? 'bg-[#252526] border-[#3c3c3c]' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        <ArrowLeftRight size={16} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
                        <span className="text-[13px] font-bold">Compare Files</span>
                    </div>
                    <button className={`p-1 rounded-md ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-400'}`} onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Tab Selectors */}
                <div className={`flex border-b shrink-0 ${isDark ? 'border-[#3c3c3c]' : 'border-gray-100'}`}>
                    <div className="flex-1 px-4 py-2 flex items-center gap-2">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Left:</span>
                        <select
                            value={leftId}
                            onChange={(e) => setLeftId(e.target.value)}
                            className={`text-[13px] font-medium bg-transparent outline-none cursor-pointer ${isDark ? 'text-white' : 'text-gray-800'}`}
                        >
                            {tabs.map(t => <option key={t.id} value={t.id}>{t.filename}</option>)}
                        </select>
                    </div>
                    <div className={`w-px ${isDark ? 'bg-[#3c3c3c]' : 'bg-gray-100'}`} />
                    <div className="flex-1 px-4 py-2 flex items-center gap-2">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Right:</span>
                        <select
                            value={rightId}
                            onChange={(e) => setRightId(e.target.value)}
                            className={`text-[13px] font-medium bg-transparent outline-none cursor-pointer ${isDark ? 'text-white' : 'text-gray-800'}`}
                        >
                            {tabs.map(t => <option key={t.id} value={t.id}>{t.filename}</option>)}
                        </select>
                    </div>
                </div>

                {/* Diff Content */}
                <div className="flex-1 flex overflow-hidden">
                    {[{ lines: leftLines, label: 'left' }, { lines: rightLines, label: 'right' }].map((side, sideIdx) => (
                        <React.Fragment key={side.label}>
                            {sideIdx === 1 && <div className={`w-px ${isDark ? 'bg-[#3c3c3c]' : 'bg-gray-200'}`} />}
                            <div className="flex-1 overflow-y-auto font-mono text-[12px]">
                                {Array.from({ length: maxLines }, (_, i) => {
                                    const line = side.lines[i] ?? '';
                                    const otherLine = (sideIdx === 0 ? rightLines : leftLines)[i] ?? '';
                                    const isDiff = line !== otherLine;
                                    return (
                                        <div
                                            key={i}
                                            className={`flex ${isDiff ? (isDark ? 'bg-yellow-500/10' : 'bg-yellow-50') : ''}`}
                                        >
                                            <span className={`w-10 text-right pr-3 py-0.5 select-none shrink-0 ${isDark ? 'text-gray-600 bg-[#252526]' : 'text-gray-400 bg-gray-50'
                                                }`}>
                                                {i + 1}
                                            </span>
                                            <pre className={`pl-3 py-0.5 flex-1 whitespace-pre-wrap break-all ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                {line || ' '}
                                            </pre>
                                        </div>
                                    );
                                })}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
