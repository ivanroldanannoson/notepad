import React, { useState, useEffect, useRef, useCallback } from 'react';

// Hooks
import { useWorkspace } from './hooks/useWorkspace';
import { useSettings } from './hooks/useSettings';
import { useEditor } from './hooks/useEditor';
import { useFormatter } from './hooks/useFormatter';

// Components
import TitleBar from './components/TitleBar';
import TabBar from './components/TabBar';
import StatusBar from './components/StatusBar';
import Modal from './components/Modal';
import CommandPalette from './components/CommandPalette';
import ShortcutSheet from './components/ShortcutSheet';
import SettingsPanel from './components/SettingsPanel';
import MarkdownPreview from './components/MarkdownPreview';
import DiffView from './components/DiffView';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import GlobalSearch from './components/GlobalSearch';

// Constants & Utils
import { languages, ACCEPTED_EXTENSIONS } from './constants/languages';
import { triggerDownload, loadScript } from './utils/helpers';

export default function App() {
  const workspace = useWorkspace();
  const {
    tabs, setTabs,
    activeTabId, setActiveTabId,
    activeTab, isDark,
    toggleTheme,
    activeTabIdRef, tabsRef,
    addTab, closeTab, closeOtherTabs, closeAllTabs,
    renameTab, updateActiveTab, markSaved, detectLanguage,
    reorderTabs, recentFiles, addRecentFile,
    sidebarOpen, setSidebarOpen,
    zenMode, setZenMode,
    autoSave,
  } = workspace;

  const { settings, updateSetting, increaseFontSize, decreaseFontSize, toggleWordWrap } = useSettings();

  const [activeMenu, setActiveMenu] = useState(null);
  const [dialogConfig, setDialogConfig] = useState(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Editor hook
  const { editorInstance, editorContainerRef, cursorPos } = useEditor({
    activeTabIdRef, tabsRef, activeTab, activeTabId, setTabs, isDark, settings,
  });

  // Formatter hook
  const handleFormat = useFormatter({ editorInstance, activeTab, setDialogConfig, setIsFormatting });

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setActiveMenu(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!settings.autoSave) return;
    const timer = setTimeout(() => {
      autoSave(settings);
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeTab?.content, settings.autoSave, autoSave]);

  // --- File Operations ---
  const handleOpen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lang = detectLanguage(file.name);
      addTab(file.name, lang, ev.target.result);
      addRecentFile(file.name);
    };
    reader.readAsText(file);
    setActiveMenu(null);
    e.target.value = '';
  };

  const handleSave = useCallback(() => {
    if (!activeTab) return;
    if (activeTab.filename.startsWith('Untitled')) {
      setDialogConfig({ type: 'saveAs', inputName: activeTab.filename });
      return;
    }
    triggerDownload(activeTab.filename, activeTab.content);
    markSaved(activeTabId);
    addRecentFile(activeTab.filename);
    setActiveMenu(null);
  }, [activeTab, activeTabId, markSaved, addRecentFile]);

  const handleSaveAs = () => {
    if (!activeTab) return;
    setActiveMenu(null);
    const currentLang = languages.find(l => l.id === activeTab.language);
    let defaultName = activeTab.filename;
    if (currentLang) {
      const lastDot = activeTab.filename.lastIndexOf('.');
      const baseName = lastDot !== -1 ? activeTab.filename.substring(0, lastDot) : activeTab.filename;
      defaultName = `${baseName}${currentLang.ext}`;
    }
    setDialogConfig({ type: 'saveAs', inputName: defaultName });
  };

  const executeSaveAs = (newName) => {
    if (!newName.trim() || !activeTab) return;
    let finalName = newName.trim();
    const currentLang = languages.find(l => l.id === activeTab.language);
    if (currentLang && !finalName.includes('.')) finalName += currentLang.ext;
    updateActiveTab({ filename: finalName });
    triggerDownload(finalName, activeTab.content);
    markSaved(activeTabId);
    addRecentFile(finalName);
    setDialogConfig(null);
  };

  const handleNewTab = () => { addTab(); setActiveMenu(null); };

  const handleOpenRecent = (filename) => {
    const existing = tabs.find(t => t.filename === filename);
    if (existing) { setActiveTabId(existing.id); setActiveMenu(null); return; }
    const lang = detectLanguage(filename);
    addTab(filename, lang, '');
    setActiveMenu(null);
  };

  const handleSelectSearchResult = (tabId, lineNum) => {
    setActiveTabId(tabId);
    setTimeout(() => {
      if (editorInstance) {
        editorInstance.gotoLine(lineNum, 0, true);
        editorInstance.focus();
      }
    }, 100);
  };

  const handleExportImage = async () => {
    setActiveMenu(null);
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    const el = editorContainerRef.current;
    if (!el) return;
    const canvas = await window.html2canvas(el);
    const link = document.createElement('a');
    link.download = `${activeTab?.filename || 'code'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleExportPdf = async () => {
    setActiveMenu(null);
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    if (!activeTab) return;
    const pdf = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(activeTab.content || '', pageWidth);
    const lineHeight = 14;
    let y = margin;
    for (const line of lines) {
      if (y + lineHeight > pageHeight + margin) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y);
      y += lineHeight;
    }
    pdf.save(`${activeTab.filename || 'code'}.pdf`);
  };

  const executeCommand = (cmdId) => {
    const actions = {
      newTab: handleNewTab,
      open: () => fileInputRef.current.click(),
      save: handleSave,
      saveAs: handleSaveAs,
      format: handleFormat,
      selectAll: () => editorInstance?.selectAll(),
      find: () => editorInstance?.execCommand('find'),
      replace: () => editorInstance?.execCommand('replace'),
      toggleTheme,
      toggleWrap: toggleWordWrap,
      zoomIn: increaseFontSize,
      zoomOut: decreaseFontSize,
      shortcuts: () => setShowShortcuts(true),
      settings: () => setShowSettings(true),
      exportImage: handleExportImage,
      exportPdf: handleExportPdf,
      diffView: () => setShowDiffView(true),
      globalSearch: () => setShowGlobalSearch(true),
      toggleSidebar: () => setSidebarOpen(!sidebarOpen),
      toggleZenMode: () => setZenMode(!zenMode),
    };
    actions[cmdId]?.();
  };

  useEffect(() => {
    if (!editorInstance) return;
    editorInstance.commands.addCommand({ name: 'save', bindKey: { win: 'Ctrl-S', mac: 'Command-S' }, exec: () => handleSave() });
    editorInstance.commands.addCommand({ name: 'open', bindKey: { win: 'Ctrl-O', mac: 'Command-O' }, exec: () => fileInputRef.current.click() });
    editorInstance.commands.addCommand({ name: 'format', bindKey: { win: 'Shift-Alt-F', mac: 'Shift-Option-F' }, exec: () => handleFormat() });
    editorInstance.commands.addCommand({ name: 'newTab', bindKey: { win: 'Alt-N', mac: 'Option-N' }, exec: () => handleNewTab() });
    editorInstance.commands.addCommand({ name: 'commandPalette', bindKey: { win: 'Ctrl-Shift-P', mac: 'Command-Shift-P' }, exec: () => setShowCommandPalette(true) });
    editorInstance.commands.addCommand({ name: 'globalSearch', bindKey: { win: 'Ctrl-Shift-F', mac: 'Command-Shift-F' }, exec: () => setShowGlobalSearch(true) });
    editorInstance.commands.addCommand({ name: 'shortcuts', bindKey: { win: 'Ctrl-/', mac: 'Command-/' }, exec: () => setShowShortcuts(true) });
    editorInstance.commands.addCommand({ name: 'settings', bindKey: { win: 'Ctrl-,', mac: 'Command-,' }, exec: () => setShowSettings(true) });
    editorInstance.commands.addCommand({ name: 'zoomIn', bindKey: { win: 'Ctrl-=', mac: 'Command-=' }, exec: increaseFontSize });
    editorInstance.commands.addCommand({ name: 'zoomOut', bindKey: { win: 'Ctrl--', mac: 'Command--' }, exec: decreaseFontSize });
  }, [editorInstance, handleSave, handleFormat, handleNewTab, increaseFontSize, decreaseFontSize]);

  const isMarkdown = activeTab?.language === 'markdown';

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'bg-[#1e1e1e] text-gray-100' : 'bg-[#f5f5f7] text-gray-900'}`}
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <input type="file" ref={fileInputRef} onChange={handleOpen} className="hidden" accept={ACCEPTED_EXTENSIONS} />

      {!zenMode && (
        <TitleBar
          isDark={isDark}
          menuRef={menuRef}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          toggleTheme={toggleTheme}
          onNewTab={handleNewTab}
          onOpen={() => { fileInputRef.current.click(); setActiveMenu(null); }}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onFormat={() => { handleFormat(); setActiveMenu(null); }}
          onSelectAll={() => { if (editorInstance) { editorInstance.selectAll(); setActiveMenu(null); } }}
          onFind={() => { editorInstance?.execCommand('find'); setActiveMenu(null); }}
          onReplace={() => { editorInstance?.execCommand('replace'); setActiveMenu(null); }}
          onToggleWrap={() => { toggleWordWrap(); setActiveMenu(null); }}
          onZoomIn={() => { increaseFontSize(); setActiveMenu(null); }}
          onZoomOut={() => { decreaseFontSize(); setActiveMenu(null); }}
          onCommandPalette={() => { setShowCommandPalette(true); setActiveMenu(null); }}
          onShortcuts={() => { setShowShortcuts(true); setActiveMenu(null); }}
          onSettings={() => { setShowSettings(true); setActiveMenu(null); }}
          onTogglePreview={() => { setShowPreview(p => !p); setActiveMenu(null); }}
          onDiffView={() => { setShowDiffView(true); setActiveMenu(null); }}
          onGlobalSearch={() => { setShowGlobalSearch(true); setActiveMenu(null); }}
          onExportImage={handleExportImage}
          onExportPdf={handleExportPdf}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleZenMode={() => setZenMode(!zenMode)}
          activeTab={activeTab}
          activeTabId={activeTabId}
          setTabs={setTabs}
          setDialogConfig={setDialogConfig}
          settings={settings}
          isPreviewOpen={showPreview}
          sidebarOpen={sidebarOpen}
          zenMode={zenMode}
          recentFiles={recentFiles}
          onOpenRecent={handleOpenRecent}
        />
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {!zenMode && (
          <Sidebar
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            tabs={tabs}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            isDark={isDark}
            onOpenSearch={() => setShowGlobalSearch(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 relative">
          {!zenMode && (
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              setActiveTabId={setActiveTabId}
              closeTab={closeTab}
              closeOtherTabs={closeOtherTabs}
              closeAllTabs={closeAllTabs}
              onNewTab={handleNewTab}
              onRenameTab={renameTab}
              onReorderTabs={reorderTabs}
              isDark={isDark}
            />
          )}

          {!zenMode && <Breadcrumbs activeTab={activeTab} isDark={isDark} />}

          <div className="flex-1 relative flex">
            <div ref={editorContainerRef} className={`absolute inset-0 z-0 ${isMarkdown && showPreview ? 'w-1/2' : 'w-full'}`} />
            {isMarkdown && showPreview && (
              <div className={`absolute right-0 top-0 bottom-0 w-1/2 border-l z-10 ${isDark ? 'border-[#3c3c3c]' : 'border-gray-200'}`}>
                <MarkdownPreview content={activeTab?.content || ''} isDark={isDark} />
              </div>
            )}

            {isFormatting && (
              <div className={`absolute inset-0 flex items-center justify-center z-50 ${isDark ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-sm`}>
                <div className={`rounded-2xl p-6 flex flex-col items-center gap-4 border ${isDark ? 'bg-[#2a2a2e] border-white/10' : 'bg-white border-gray-200 shadow-2xl'}`}>
                  <div className="h-8 w-8 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />
                  <span className="text-[13px] font-semibold">Formatting...</span>
                </div>
              </div>
            )}
          </div>

          {!zenMode && (
            <StatusBar
              cursorPos={cursorPos}
              activeTab={activeTab}
              isDark={isDark}
              settings={settings}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}

          {zenMode && (
            <button
              onClick={() => setZenMode(false)}
              className={`fixed bottom-8 right-8 p-3 rounded-full shadow-2xl z-[100] transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              title="Exit Zen Mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
            </button>
          )}
        </div>
      </div>

      <Modal dialogConfig={dialogConfig} setDialogConfig={setDialogConfig} executeSaveAs={executeSaveAs} isDark={isDark} />
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} onExecute={executeCommand} isDark={isDark} />
      <ShortcutSheet isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} isDark={isDark} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} updateSetting={updateSetting} isDark={isDark} />
      <DiffView isOpen={showDiffView} onClose={() => setShowDiffView(false)} tabs={tabs} isDark={isDark} />
      <GlobalSearch isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} tabs={tabs} onSelectResult={handleSelectSearchResult} isDark={isDark} />
    </div>
  );
}