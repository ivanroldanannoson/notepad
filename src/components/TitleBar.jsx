import React, { useState } from 'react';
import { Sun, Moon, Github, Menu, X, ChevronRight } from 'lucide-react';
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

/* ── Mobile Menu Section ───────────────────────────────── */
function MobileMenuSection({ title, isDark, children }) {
    return (
        <div className="mb-2">
            <div className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {title}
            </div>
            <div className="flex flex-col">{children}</div>
        </div>
    );
}

function MobileMenuItem({ label, onClick, isDark, checked, hasChevron }) {
    return (
        <button
            className={`w-full text-left px-5 py-3 text-[14px] font-medium flex items-center justify-between transition-colors active:scale-[0.98] ${isDark ? 'text-gray-200 active:bg-white/10' : 'text-gray-700 active:bg-gray-100'
                }`}
            onClick={onClick}
        >
            <span>{label}</span>
            {checked !== undefined && (
                <span className={`text-[13px] ${checked ? 'text-blue-500' : 'opacity-0'}`}>✓</span>
            )}
            {hasChevron && (
                <ChevronRight size={16} className="opacity-30" />
            )}
        </button>
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
    onGlobalSearch,
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false);

    const closeMobile = (fn) => () => { fn?.(); setMobileMenuOpen(false); setMobileLanguageOpen(false); };

    return (
        <>
            <div className={`h-12 flex items-center px-3 md:px-5 justify-between shrink-0 z-40 border-b ${isDark ? 'bg-[#252526] border-[#3c3c3c]' : 'bg-white/70 backdrop-blur-xl border-gray-200/60'
                }`}>
                <div className="flex items-center gap-3 md:gap-7">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center">
                            <img src="logo.png" alt="Notepad IDE Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[13px] font-bold tracking-tight hidden sm:inline">Notepad IDE</span>
                    </div>

                    {/* Desktop Menu — hidden on mobile */}
                    <div className="hidden md:flex items-center gap-0.5" ref={menuRef}>
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

                <div className="flex items-center gap-1">
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

                    {/* Mobile hamburger */}
                    <button
                        className={`md:hidden p-2 rounded-lg transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/[0.04]'
                            }`}
                        onClick={() => setMobileMenuOpen(true)}
                        title="Menu"
                    >
                        <Menu size={20} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* ── Mobile Full-screen Menu ─────────────────────────── */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[300] md:hidden animate-fadeIn"
                    onClick={() => { setMobileMenuOpen(false); setMobileLanguageOpen(false); }}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Menu Panel */}
                    <div
                        className={`absolute top-0 right-0 w-[85vw] max-w-[320px] h-full flex flex-col shadow-2xl animate-slideInRight ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`h-14 flex items-center justify-between px-4 border-b shrink-0 ${isDark ? 'border-white/10' : 'border-gray-200'
                            }`}>
                            <span className="text-[15px] font-bold">Menu</span>
                            <button
                                onClick={() => { setMobileMenuOpen(false); setMobileLanguageOpen(false); }}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain pb-safe">
                            {!mobileLanguageOpen ? (
                                <>
                                    <MobileMenuSection title="File" isDark={isDark}>
                                        <MobileMenuItem label="New Tab" onClick={closeMobile(onNewTab)} isDark={isDark} />
                                        <MobileMenuItem label="Open..." onClick={closeMobile(onOpen)} isDark={isDark} />
                                        <MobileMenuItem label="Save" onClick={closeMobile(onSave)} isDark={isDark} />
                                        <MobileMenuItem label="Save As..." onClick={closeMobile(onSaveAs)} isDark={isDark} />
                                    </MobileMenuSection>

                                    {recentFiles && recentFiles.length > 0 && (
                                        <MobileMenuSection title="Recent Files" isDark={isDark}>
                                            {recentFiles.slice(0, 5).map(f => (
                                                <MobileMenuItem key={f} label={f} onClick={closeMobile(() => onOpenRecent(f))} isDark={isDark} />
                                            ))}
                                        </MobileMenuSection>
                                    )}

                                    <MobileMenuSection title="Edit" isDark={isDark}>
                                        <MobileMenuItem label="Find" onClick={closeMobile(onFind)} isDark={isDark} />
                                        <MobileMenuItem label="Find & Replace" onClick={closeMobile(onReplace)} isDark={isDark} />
                                        <MobileMenuItem label="Format Document" onClick={closeMobile(onFormat)} isDark={isDark} />
                                        <MobileMenuItem label="Select All" onClick={closeMobile(onSelectAll)} isDark={isDark} />
                                    </MobileMenuSection>

                                    <MobileMenuSection title="View" isDark={isDark}>
                                        <MobileMenuItem label="Command Palette" onClick={closeMobile(onCommandPalette)} isDark={isDark} />
                                        <MobileMenuItem label="Global Search" onClick={closeMobile(onGlobalSearch)} isDark={isDark} />
                                        <MobileMenuItem label="Sidebar" onClick={closeMobile(onToggleSidebar)} isDark={isDark} checked={sidebarOpen} />
                                        <MobileMenuItem label="Zen Mode" onClick={closeMobile(onToggleZenMode)} isDark={isDark} checked={zenMode} />
                                        <MobileMenuItem label="Word Wrap" onClick={closeMobile(onToggleWrap)} isDark={isDark} checked={settings?.wordWrap} />
                                        <MobileMenuItem label="Zoom In" onClick={closeMobile(onZoomIn)} isDark={isDark} />
                                        <MobileMenuItem label="Zoom Out" onClick={closeMobile(onZoomOut)} isDark={isDark} />
                                        {activeTab?.language === 'markdown' && (
                                            <MobileMenuItem label="Markdown Preview" onClick={closeMobile(onTogglePreview)} isDark={isDark} checked={isPreviewOpen} />
                                        )}
                                        <MobileMenuItem label="Compare Files" onClick={closeMobile(onDiffView)} isDark={isDark} />
                                        <MobileMenuItem label="Export as Image" onClick={closeMobile(onExportImage)} isDark={isDark} />
                                        <MobileMenuItem label="Export as PDF" onClick={closeMobile(onExportPdf)} isDark={isDark} />
                                        <MobileMenuItem label="Settings" onClick={closeMobile(onSettings)} isDark={isDark} />
                                    </MobileMenuSection>

                                    <MobileMenuSection title="Language" isDark={isDark}>
                                        <MobileMenuItem
                                            label={`Change Language (${languages.find(l => l.id === activeTab?.language)?.name || 'Plain Text'})`}
                                            onClick={() => setMobileLanguageOpen(true)}
                                            isDark={isDark}
                                            hasChevron
                                        />
                                    </MobileMenuSection>

                                    <MobileMenuSection title="Help" isDark={isDark}>
                                        <MobileMenuItem label="Keyboard Shortcuts" onClick={closeMobile(onShortcuts)} isDark={isDark} />
                                    </MobileMenuSection>

                                    <div className="h-8" />
                                </>
                            ) : (
                                /* Language sub-menu */
                                <>
                                    <button
                                        className={`w-full text-left px-4 py-3 text-[13px] font-semibold flex items-center gap-2 border-b ${isDark ? 'text-blue-400 border-white/5 active:bg-white/5' : 'text-blue-600 border-gray-100 active:bg-gray-50'
                                            }`}
                                        onClick={() => setMobileLanguageOpen(false)}
                                    >
                                        <ChevronRight size={14} className="rotate-180" />
                                        Back to Menu
                                    </button>
                                    <div className="py-1">
                                        {languages.map(lang => (
                                            <MobileMenuItem
                                                key={lang.id}
                                                label={lang.name}
                                                checked={activeTab?.language === lang.id}
                                                onClick={() => {
                                                    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, language: lang.id } : t));
                                                    setMobileMenuOpen(false);
                                                    setMobileLanguageOpen(false);
                                                }}
                                                isDark={isDark}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
