import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Files, Search, Settings, ChevronRight } from 'lucide-react';

export default function Sidebar({
    isOpen,
    setIsOpen,
    tabs,
    activeTabId,
    setActiveTabId,
    closeTab,
    isDark,
    onOpenSearch,
    onOpenSettings
}) {
    return (
        <div className={`flex flex-col border-r transition-all duration-300 ease-in-out shrink-0 ${isOpen ? 'w-64' : 'w-12'
            } ${isDark ? 'bg-[#252526] border-[#3c3c3c]' : 'bg-[#f3f3f3] border-gray-200'}`}>

            {/* Sidebar Header/Toggle */}
            <div className="h-10 flex items-center justify-between px-3 shrink-0">
                {isOpen && (
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Explorer
                    </span>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-gray-800'}`}
                >
                    {isOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                </button>
            </div>

            {/* Sidebar Activity Bar Icons (when closed) */}
            {!isOpen && (
                <div className="flex flex-col items-center py-4 gap-6">
                    <button
                        onClick={() => setIsOpen(true)}
                        className={`p-2 rounded-xl transition-all ${isDark ? 'text-blue-400 hover:bg-white/10' : 'text-blue-600 hover:bg-black/5'}`}
                        title="Explorer"
                    >
                        <Files size={22} />
                    </button>

                    <button
                        onClick={onOpenSearch}
                        className={`p-2 rounded-xl transition-all text-gray-400 ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-black/5 hover:text-gray-800'}`}
                        title="Global Search (⇧⌘F)"
                    >
                        <Search size={22} />
                    </button>

                    <div className="mt-auto mb-2">
                        <button
                            onClick={onOpenSettings}
                            className={`p-2 rounded-xl transition-all text-gray-400 ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-black/5 hover:text-gray-800'}`}
                            title="Settings (⌘,)"
                        >
                            <Settings size={22} />
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar Content (when open) */}
            {isOpen && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
                    {/* Section: Open Editors */}
                    <div className="mb-4">
                        <div className={`px-4 py-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            <ChevronRight size={12} className="rotate-90" />
                            Open Editors
                        </div>
                        <div className="mt-1">
                            {tabs.map(tab => (
                                <div
                                    key={tab.id}
                                    onClick={() => setActiveTabId(tab.id)}
                                    className={`group flex items-center gap-2 px-4 py-1.5 cursor-pointer text-[13px] border-l-2 transition-colors ${activeTabId === tab.id
                                        ? (isDark ? 'bg-blue-500/10 text-white border-blue-500' : 'bg-blue-50 text-blue-700 border-blue-500')
                                        : 'border-transparent hover:bg-black/5 text-gray-500'
                                        }`}
                                >
                                    <Files size={14} className={activeTabId === tab.id ? (isDark ? 'text-blue-400' : 'text-blue-600') : 'text-gray-400'} />
                                    <span className="truncate flex-1">{tab.filename}</span>
                                    {tab.isDirty && (
                                        <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-white/40' : 'bg-gray-400'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
