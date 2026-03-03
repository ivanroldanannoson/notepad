import React, { useState, useRef } from 'react';
import { X, FileText, Plus } from 'lucide-react';

export default function TabBar({ tabs, activeTabId, setActiveTabId, closeTab, closeOtherTabs, closeAllTabs, onNewTab, onRenameTab, onReorderTabs, isDark }) {
    const [contextMenu, setContextMenu] = useState(null);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [dragState, setDragState] = useState({ dragging: false, dragId: null, overId: null });
    const dragRef = useRef({ startX: 0, tabId: null });

    const handleContextMenu = (e, tabId) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, tabId });
    };

    const startRename = (tab) => {
        setRenamingId(tab.id);
        setRenameValue(tab.filename);
        setContextMenu(null);
    };

    const commitRename = () => {
        if (renameValue.trim() && renamingId) {
            onRenameTab(renamingId, renameValue.trim());
        }
        setRenamingId(null);
    };

    // Mouse-based drag & drop (more reliable than HTML5 drag API)
    const handleMouseDown = (e, tabId) => {
        if (e.button !== 0 || renamingId) return; // left click only
        dragRef.current = { startX: e.clientX, tabId, started: false };

        const handleMouseMove = (moveE) => {
            if (!dragRef.current.tabId) return;
            if (!dragRef.current.started && Math.abs(moveE.clientX - dragRef.current.startX) > 5) {
                dragRef.current.started = true;
                setDragState({ dragging: true, dragId: dragRef.current.tabId, overId: null });
            }
            if (dragRef.current.started) {
                // Find which tab we're over
                const els = document.querySelectorAll('[data-tab-id]');
                for (const el of els) {
                    const rect = el.getBoundingClientRect();
                    if (moveE.clientX >= rect.left && moveE.clientX <= rect.right) {
                        const hoverId = el.getAttribute('data-tab-id');
                        if (hoverId !== dragRef.current.tabId) {
                            setDragState(prev => ({ ...prev, overId: hoverId }));
                        }
                        break;
                    }
                }
            }
        };

        const handleMouseUp = () => {
            if (dragRef.current.started && dragState.overId || true) {
                // Check final state
                const finalOverId = document.querySelector('[data-tab-id].drag-over')?.getAttribute('data-tab-id');
                if (dragRef.current.tabId && onReorderTabs) {
                    const fromIdx = tabs.findIndex(t => t.id === dragRef.current.tabId);
                    // We need to get overId from state, but it might be stale. Use a different approach.
                }
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // Perform reorder if valid
            if (dragRef.current.started) {
                setDragState(prev => {
                    if (prev.overId && prev.dragId && prev.overId !== prev.dragId && onReorderTabs) {
                        const fromIdx = tabs.findIndex(t => t.id === prev.dragId);
                        const toIdx = tabs.findIndex(t => t.id === prev.overId);
                        if (fromIdx !== -1 && toIdx !== -1) {
                            setTimeout(() => onReorderTabs(fromIdx, toIdx), 0);
                        }
                    }
                    return { dragging: false, dragId: null, overId: null };
                });
            } else {
                setDragState({ dragging: false, dragId: null, overId: null });
            }
            dragRef.current = { startX: 0, tabId: null, started: false };
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <>
            <div className={`h-10 flex items-end px-3 gap-1 overflow-x-auto no-scrollbar shrink-0 select-none ${isDark ? 'bg-[#252526]' : 'bg-[#f0f0f0]'
                }`}>
                {tabs.map(tab => {
                    const isActive = activeTabId === tab.id;
                    const isDirty = tab.isDirty;
                    const isDragging = dragState.dragId === tab.id;
                    const isDragOver = dragState.dragging && dragState.overId === tab.id;
                    return (
                        <div
                            key={tab.id}
                            data-tab-id={tab.id}
                            onMouseDown={(e) => handleMouseDown(e, tab.id)}
                            onClick={() => { if (!dragState.dragging) setActiveTabId(tab.id); }}
                            onContextMenu={(e) => handleContextMenu(e, tab.id)}
                            onDoubleClick={() => startRename(tab)}
                            className={`group flex items-center gap-2 h-[34px] px-3.5 rounded-t-lg cursor-pointer transition-all duration-150 min-w-[120px] max-w-[200px] text-[12px] font-medium border-t border-x ${isDragging ? 'opacity-40' : ''
                                } ${isDragOver ? (isDark ? 'border-l-2 border-l-blue-400' : 'border-l-2 border-l-blue-500') : ''
                                } ${isActive
                                    ? (isDark
                                        ? 'bg-[#1e1e1e] text-white border-[#3c3c3c] border-b-0'
                                        : 'bg-white text-gray-800 border-gray-200/80 border-b-0 shadow-sm')
                                    : (isDark
                                        ? 'bg-transparent text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/[0.03]'
                                        : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/50')
                                }`}
                        >
                            <FileText size={13} className={isActive ? (isDark ? 'text-blue-400' : 'text-blue-500') : 'text-gray-400'} />

                            {renamingId === tab.id ? (
                                <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onBlur={commitRename}
                                    onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                                    autoFocus
                                    className={`w-full text-[12px] font-medium bg-transparent outline-none border-b ${isDark ? 'border-blue-400 text-white' : 'border-blue-500 text-gray-800'
                                        }`}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span className="truncate flex-1 flex items-center gap-1">
                                    {tab.filename}
                                    {isDirty && <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${isDark ? 'bg-white/40' : 'bg-gray-400'}`} />}
                                </span>
                            )}

                            <button
                                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                className={`rounded p-0.5 transition-all ${isActive ? 'opacity-60 hover:opacity-100' : 'opacity-0 group-hover:opacity-60 hover:!opacity-100'
                                    } ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    );
                })}
                <button
                    onClick={onNewTab}
                    className={`flex items-center justify-center h-[34px] w-8 rounded-t-lg transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                        }`}
                >
                    <Plus size={15} strokeWidth={2} />
                </button>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setContextMenu(null)} />
                    <div
                        className={`fixed z-[101] w-48 rounded-xl py-1.5 shadow-xl border ${isDark ? 'bg-[#2a2a2e] border-white/10' : 'bg-white border-gray-200'
                            }`}
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                    >
                        {[
                            { label: 'Rename', action: () => { const t = tabs.find(t => t.id === contextMenu.tabId); if (t) startRename(t); } },
                            { label: 'Close', action: () => { closeTab(contextMenu.tabId); setContextMenu(null); } },
                            { label: 'Close Others', action: () => { closeOtherTabs(contextMenu.tabId); setContextMenu(null); } },
                            { label: 'Close All', action: () => { closeAllTabs(); setContextMenu(null); } },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-blue-500 hover:text-white' : 'text-gray-700 hover:bg-blue-500 hover:text-white'
                                    }`}
                                onClick={item.action}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
