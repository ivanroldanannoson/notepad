import React from 'react';
import { Sun, Moon, Github } from 'lucide-react';
import { languages } from '../constants/languages';

export function MenuDropdown({ title, id, activeMenu, setActiveMenu, isDark, children }) {
    const isActive = activeMenu === id;
    return (
        <div className="relative">
            <button
                className={`px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all duration-150 ${isActive
                    ? (isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-gray-900')
                    : (isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/[0.03]')
                    }`}
                onClick={() => setActiveMenu(isActive ? null : id)}
                onMouseEnter={() => { if (activeMenu !== null && activeMenu !== id) setActiveMenu(id); }}
            >
                {title}
            </button>
            {isActive && (
                <div className={`absolute top-full left-0 mt-2 w-56 rounded-xl py-1.5 z-[60] flex flex-col max-h-[70vh] overflow-y-auto shadow-xl border ${isDark ? 'bg-[#2a2a2e] border-white/10 shadow-black/40' : 'bg-white border-gray-200/80 shadow-gray-200/60'
                    }`}>
                    {children}
                </div>
            )}
        </div>
    );
}

export function MenuItem({ label, shortcut, onClick, hasSeparator, isDark, checked }) {
    return (
        <>
            <button
                className={`w-full text-left px-4 py-2 text-[13px] flex justify-between items-center transition-colors group ${isDark ? 'text-gray-300 hover:bg-blue-500 hover:text-white' : 'text-gray-700 hover:bg-blue-500 hover:text-white'
                    }`}
                onClick={onClick}
            >
                <span className="font-medium">{label}</span>
                <span className={`text-[10px] font-mono tracking-tight ml-4 ${isDark ? 'text-gray-500 group-hover:text-blue-100' : 'text-gray-400 group-hover:text-blue-100'
                    }`}>
                    {checked !== undefined ? (checked ? '✓' : '') : shortcut || ''}
                </span>
            </button>
            {hasSeparator && <div className={`h-px my-1 mx-3 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />}
        </>
    );
}

export default function TitleBar({
    isDark, menuRef, activeMenu, setActiveMenu, toggleTheme,
    onNewTab, onOpen, onSave, onSaveAs, onFormat, onSelectAll,
    onFind, onReplace, onToggleWrap, onZoomIn, onZoomOut,
    onCommandPalette, onShortcuts, onSettings, onTogglePreview,
    onDiffView, onExportImage, onExportPdf,
    onToggleSidebar, onToggleZenMode,
    activeTab, activeTabId, setTabs, setDialogConfig,
    settings, isPreviewOpen, sidebarOpen, zenMode, recentFiles, onOpenRecent,
}) {
    return (
        <div className={`h-12 flex items-center px-5 justify-between shrink-0 z-40 border-b ${isDark ? 'bg-[#252526] border-[#3c3c3c]' : 'bg-white/70 backdrop-blur-xl border-gray-200/60'
            }`}>
            <div className="flex items-center gap-7">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src="logo.png" alt="Notepad IDE Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[13px] font-bold tracking-tight">Notepad IDE</span>
                </div>

                <div className="flex items-center gap-0.5" ref={menuRef}>
                    {/* File */}
                    <MenuDropdown title="File" id="file" activeMenu={activeMenu} setActiveMenu={setActiveMenu} isDark={isDark}>
                        <MenuItem label="New Tab" shortcut="⌥N" onClick={onNewTab} isDark={isDark} />
                        <MenuItem label="Open..." shortcut="⌘O" onClick={onOpen} isDark={isDark} />
                        <MenuItem label="Save" shortcut="⌘S" onClick={onSave} isDark={isDark} />
                        <MenuItem label="Save As..." shortcut="⇧⌘S" onClick={onSaveAs} isDark={isDark} hasSeparator />
                        {recentFiles && recentFiles.length > 0 && (
                            <>
                                <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Recent Files</div>
                                {recentFiles.slice(0, 5).map(f => (
                                    <MenuItem key={f} label={f} onClick={() => onOpenRecent(f)} isDark={isDark} />
                                ))}
                                <div className={`h-px my-1 mx-3 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                            </>
                        )}
                        <MenuItem label="Exit" onClick={() => setDialogConfig({ type: 'alert', message: 'Close the browser tab to exit.' })} isDark={isDark} />
                    </MenuDropdown>

                    {/* Edit */}
                    <MenuDropdown title="Edit" id="edit" activeMenu={activeMenu} setActiveMenu={setActiveMenu} isDark={isDark}>
                        <MenuItem label="Find" shortcut="⌘F" onClick={onFind} isDark={isDark} />
                        <MenuItem label="Find & Replace" shortcut="⌘H" onClick={onReplace} isDark={isDark} hasSeparator />
                        <MenuItem label="Format Document" shortcut="⇧⌥F" onClick={onFormat} isDark={isDark} hasSeparator />
                        <MenuItem label="Select All" shortcut="⌘A" onClick={onSelectAll} isDark={isDark} />
                    </MenuDropdown>

                    {/* View */}
                    <MenuDropdown title="View" id="view" activeMenu={activeMenu} setActiveMenu={setActiveMenu} isDark={isDark}>
                        <MenuItem label="Command Palette" shortcut="⇧⌘P" onClick={onCommandPalette} isDark={isDark} />
                        <MenuItem label="Sidebar" isDark={isDark} checked={sidebarOpen} onClick={onToggleSidebar} />
                        <MenuItem label="Zen Mode" shortcut="⌘K Z" isDark={isDark} checked={zenMode} onClick={onToggleZenMode} hasSeparator />
                        <MenuItem label="Word Wrap" isDark={isDark} checked={settings?.wordWrap} onClick={onToggleWrap} />
                        <MenuItem label="Zoom In" shortcut="⌘+" onClick={onZoomIn} isDark={isDark} />
                        <MenuItem label="Zoom Out" shortcut="⌘-" onClick={onZoomOut} isDark={isDark} hasSeparator />
                        {activeTab?.language === 'markdown' && (
                            <MenuItem label="Markdown Preview" isDark={isDark} checked={isPreviewOpen} onClick={onTogglePreview} />
                        )}
                        <MenuItem label="Compare Files" onClick={onDiffView} isDark={isDark} hasSeparator />
                        <MenuItem label="Export as Image" onClick={onExportImage} isDark={isDark} />
                        <MenuItem label="Export as PDF" onClick={onExportPdf} isDark={isDark} hasSeparator />
                        <MenuItem label="Settings" shortcut="⌘," onClick={onSettings} isDark={isDark} />
                    </MenuDropdown>

                    {/* Language */}
                    <MenuDropdown title="Language" id="language" activeMenu={activeMenu} setActiveMenu={setActiveMenu} isDark={isDark}>
                        {languages.map((lang) => (
                            <MenuItem
                                key={lang.id}
                                label={lang.name}
                                checked={activeTab?.language === lang.id}
                                onClick={() => {
                                    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, language: lang.id } : t));
                                    setActiveMenu(null);
                                }}
                                isDark={isDark}
                            />
                        ))}
                    </MenuDropdown>

                    {/* Help */}
                    <MenuDropdown title="Help" id="help" activeMenu={activeMenu} setActiveMenu={setActiveMenu} isDark={isDark}>
                        <MenuItem label="Keyboard Shortcuts" shortcut="⌘/" onClick={onShortcuts} isDark={isDark} />
                    </MenuDropdown>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <a
                    href="https://github.com/ivanroldanannoson/notepad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-black/[0.04]'
                        }`}
                    title="View on GitHub"
                >
                    <Github size={16} strokeWidth={2} />
                </a>
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-yellow-400 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-black/[0.04]'
                        }`}
                    title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                >
                    {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
                </button>
            </div>
        </div>
    );
}
