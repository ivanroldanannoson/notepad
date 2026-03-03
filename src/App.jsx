import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Settings, FileText, ChevronDown, Sun, Moon, Plus, Hash } from 'lucide-react';

// --- Utility: Dynamic Script Loader ---
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function App() {
  // --- Persistent State Initialization ---
  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem('notepad_tabs');
    try {
      return saved ? JSON.parse(saved) : [{ id: Date.now().toString(), filename: 'Untitled.txt', language: 'plaintext', content: '' }];
    } catch {
      return [{ id: Date.now().toString(), filename: 'Untitled.txt', language: 'plaintext', content: '' }];
    }
  });

  const [activeTabId, setActiveTabId] = useState(() => {
    return localStorage.getItem('notepad_active_tab_id') || (tabs[0] ? tabs[0].id : '');
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('notepad_theme') || 'light';
  });

  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  const [activeMenu, setActiveMenu] = useState(null);
  const [dialogConfig, setDialogConfig] = useState(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);

  const editorContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const languages = [
    { id: 'plaintext', name: 'Plain Text', ext: '.txt', aceMode: 'text' },
    { id: 'javascript', name: 'JavaScript', ext: '.js', aceMode: 'javascript' },
    { id: 'typescript', name: 'TypeScript', ext: '.ts', aceMode: 'typescript' },
    { id: 'python', name: 'Python', ext: '.py', aceMode: 'python' },
    { id: 'java', name: 'Java', ext: '.java', aceMode: 'java' },
    { id: 'csharp', name: 'C#', ext: '.cs', aceMode: 'csharp' },
    { id: 'cpp', name: 'C++', ext: '.cpp', aceMode: 'c_cpp' },
    { id: 'php', name: 'PHP', ext: '.php', aceMode: 'php' },
    { id: 'sql', name: 'SQL', ext: '.sql', aceMode: 'sql' },
    { id: 'html', name: 'HTML', ext: '.html', aceMode: 'html' },
    { id: 'css', name: 'CSS', ext: '.css', aceMode: 'css' },
    { id: 'json', name: 'JSON', ext: '.json', aceMode: 'json' },
    { id: 'markdown', name: 'Markdown', ext: '.md', aceMode: 'markdown' },
    { id: 'bat', name: 'Batch', ext: '.bat', aceMode: 'batchfile' },
  ];

  // --- Persistence Side Effects ---
  useEffect(() => {
    localStorage.setItem('notepad_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('notepad_active_tab_id', activeTabId || '');
  }, [activeTabId]);

  useEffect(() => {
    localStorage.setItem('notepad_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Initialize Ace Editor ---
  useEffect(() => {
    let editor;
    const initEditor = async () => {
      if (!window.ace) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/ace.js');
      }

      window.ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/');

      editor = window.ace.edit(editorContainerRef.current);
      editor.setTheme(theme === 'dark' ? "ace/theme/tomorrow_night" : "ace/theme/chrome");

      editor.setOptions({
        fontSize: "14px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        showPrintMargin: false,
        wrap: true,
        showLineNumbers: true,
        showGutter: true,
        tabSize: 4,
        useSoftTabs: true
      });

      // Restore active tab content
      if (activeTab) {
        editor.setValue(activeTab.content, -1);
      }

      // Track changes and save to tabs state
      editor.on('change', () => {
        const val = editor.getValue();
        setTabs(prev => {
          const currentTab = prev.find(t => t.id === activeTabId);
          if (currentTab && currentTab.content === val) return prev;
          return prev.map(t => t.id === activeTabId ? { ...t, content: val } : t);
        });
      });

      editor.selection.on('changeCursor', () => {
        const pos = editor.getCursorPosition();
        setCursorPos({ ln: pos.row + 1, col: pos.column + 1 });
      });

      setEditorInstance(editor);
    };

    initEditor();
    return () => { if (editor) editor.destroy(); };
  }, []);

  // Sync Language & Theme
  useEffect(() => {
    if (editorInstance && activeTab) {
      const langDef = languages.find(l => l.id === activeTab.language);
      editorInstance.session.setMode(`ace/mode/${langDef ? langDef.aceMode : 'text'}`);
    }
  }, [activeTab?.language, editorInstance]);

  useEffect(() => {
    if (editorInstance) {
      editorInstance.setTheme(theme === 'dark' ? "ace/theme/tomorrow_night" : "ace/theme/chrome");
    }
  }, [theme, editorInstance]);

  // Sync Editor Content when switching tabs
  useEffect(() => {
    if (editorInstance && activeTab && editorInstance.getValue() !== activeTab.content) {
      editorInstance.setValue(activeTab.content, -1);
    }
  }, [activeTabId, editorInstance]);

  // --- Tab Operations ---
  const handleNewTab = () => {
    const newId = Date.now().toString();
    setTabs(prev => [...prev, { id: newId, filename: 'Untitled.txt', language: 'plaintext', content: '' }]);
    setActiveTabId(newId);
    setActiveMenu(null);
  };

  const closeTab = (id, e) => {
    if (e) e.stopPropagation();
    if (tabs.length === 1) {
      const newId = Date.now().toString();
      setTabs([{ id: newId, filename: 'Untitled.txt', language: 'plaintext', content: '' }]);
      setActiveTabId(newId);
      return;
    }
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  // --- File Operations ---
  const handleOpen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      const foundLang = languages.find(l => l.ext === ext);
      const newId = Date.now().toString();

      setTabs(prev => [...prev, {
        id: newId,
        filename: file.name,
        language: foundLang ? foundLang.id : 'plaintext',
        content: event.target.result
      }]);
      setActiveTabId(newId);
    };
    reader.readAsText(file);
    setActiveMenu(null);
    e.target.value = '';
  };

  const triggerDownload = (name, text) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = useCallback(() => {
    if (!activeTab) return;
    if (activeTab.filename.startsWith('Untitled')) {
      handleSaveAs();
    } else {
      triggerDownload(activeTab.filename, activeTab.content);
      setActiveMenu(null);
    }
  }, [activeTab]);

  const handleSaveAs = () => {
    if (!activeTab) return;
    setActiveMenu(null);
    let defaultName = activeTab.filename;
    const currentLang = languages.find(l => l.id === activeTab.language);
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
    if (currentLang && !finalName.includes('.')) {
      finalName += currentLang.ext;
    }

    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, filename: finalName } : t));
    triggerDownload(finalName, activeTab.content);
    setDialogConfig(null);
  };

  // --- Formatting ---
  const handleFormat = useCallback(async () => {
    setActiveMenu(null);
    if (!editorInstance || !activeTab) return;

    const currentCode = editorInstance.getValue();
    if (!currentCode.trim()) return;

    if (activeTab.language === 'plaintext') {
      setDialogConfig({ type: 'alert', message: 'Formatting is not available for Plain Text. Please select a programming language.' });
      return;
    }

    setIsFormatting(true);
    try {
      let formatted = currentCode;

      if (activeTab.language === 'json') {
        const parsed = JSON.parse(currentCode);
        formatted = JSON.stringify(parsed, null, 4);
      }
      else if (activeTab.language === 'sql') {
        await loadScript('https://unpkg.com/sql-formatter@15.0.2/dist/sql-formatter.min.js');
        formatted = window.sqlFormatter.format(currentCode, { language: 'sql', tabWidth: 4 });
      }
      else if (['java', 'cpp', 'csharp', 'php'].includes(activeTab.language)) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.11/beautify.min.js');
        formatted = window.js_beautify(currentCode, { indent_size: 4, brace_style: "collapse" });
      }
      else if (activeTab.language === 'bat') {
        let indentLevel = 0;
        formatted = currentCode.split('\n').map(line => {
          let trimmed = line.trim();
          if (trimmed.startsWith(')')) indentLevel = Math.max(0, indentLevel - 1);
          const indentedLine = trimmed ? '    '.repeat(indentLevel) + trimmed : '';
          if (trimmed.endsWith('(')) indentLevel++;
          return indentedLine;
        }).join('\n');
      }
      else if (activeTab.language === 'python') {
        formatted = currentCode.split('\n').map(line => line.trimEnd()).join('\n');
      }
      else {
        await loadScript('https://unpkg.com/prettier@3.2.5/standalone.js');
        let plugins = [];
        let parser = '';

        if (['javascript', 'typescript'].includes(activeTab.language)) {
          await loadScript('https://unpkg.com/prettier@3.2.5/plugins/estree.js');
          await loadScript('https://unpkg.com/prettier@3.2.5/plugins/babel.js');
          plugins = [window.prettierPlugins.estree, window.prettierPlugins.babel];
          parser = activeTab.language === 'typescript' ? 'babel-ts' : 'babel';
        } else if (activeTab.language === 'html') {
          await loadScript('https://unpkg.com/prettier@3.2.5/plugins/html.js');
          plugins = [window.prettierPlugins.html];
          parser = 'html';
        } else if (activeTab.language === 'css') {
          await loadScript('https://unpkg.com/prettier@3.2.5/plugins/postcss.js');
          plugins = [window.prettierPlugins.postcss];
          parser = 'css';
        } else if (activeTab.language === 'markdown') {
          await loadScript('https://unpkg.com/prettier@3.2.5/plugins/markdown.js');
          plugins = [window.prettierPlugins.markdown];
          parser = 'markdown';
        }

        formatted = await window.prettier.format(currentCode, {
          parser: parser,
          plugins: plugins,
          singleQuote: true,
          tabWidth: 4,
        });
      }

      editorInstance.setValue(formatted, -1);

    } catch (error) {
      const errorMsg = error.message ? error.message.split('\n')[0] : 'Ensure there are no syntax errors.';
      setDialogConfig({ type: 'alert', message: `Formatting Error: ${errorMsg}` });
    } finally {
      setIsFormatting(false);
    }
  }, [activeTab, editorInstance]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (editorInstance) {
      editorInstance.commands.addCommand({
        name: 'save',
        bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
        exec: () => handleSave()
      });
      editorInstance.commands.addCommand({
        name: 'open',
        bindKey: { win: 'Ctrl-O', mac: 'Command-O' },
        exec: () => fileInputRef.current.click()
      });
      editorInstance.commands.addCommand({
        name: 'format',
        bindKey: { win: 'Shift-Alt-F', mac: 'Shift-Option-F' },
        exec: () => handleFormat()
      });
      editorInstance.commands.addCommand({
        name: 'newTab',
        bindKey: { win: 'Ctrl-T', mac: 'Command-T' },
        exec: () => handleNewTab()
      });
    }
  }, [editorInstance, handleSave, handleFormat, handleNewTab]);

  // --- UI Components ---
  const MenuDropdown = ({ title, id, children }) => {
    const isActive = activeMenu === id;
    return (
      <div className="relative">
        <button
          className={`px-3 py-1 text-sm font-medium rounded transition-all duration-200 ${isActive
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          onClick={() => setActiveMenu(isActive ? null : id)}
        >
          {title}
        </button>
        {isActive && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg py-1.5 z-[60] flex flex-col max-h-[70vh] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  const MenuItem = ({ label, shortcut, onClick, hasSeparator }) => (
    <>
      <button
        className="w-full dark:hover:bg-blue-700 text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-600 hover:text-white flex justify-between items-center transition-colors group"
        onClick={onClick}
      >
        <span>{label}</span>
        {shortcut && (
          <span className="text-gray-400 group-hover:text-blue-100 text-[10px] font-mono tracking-wider ml-4">
            {shortcut}
          </span>
        )}
      </button>
      {hasSeparator && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />}
    </>
  );

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans selection:bg-blue-100 dark:selection:bg-blue-900 ${theme === 'dark' ? 'dark bg-gray-950 text-gray-100' : 'bg-white text-gray-800'}`}>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleOpen}
        className="hidden"
        accept=".txt,.js,.ts,.py,.java,.cs,.cpp,.php,.sql,.html,.css,.json,.md,.bat"
      />

      <div className="flex-1 flex flex-col relative">

        {/* Top bar */}
        <div className="h-12 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between shrink-0 z-40">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1 rounded">
                <FileText size={14} className="text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Notepad IDE
              </span>
            </div>

            <div className="flex items-center space-x-1" ref={menuRef}>
              <MenuDropdown title="File" id="file">
                <MenuItem label="New Tab" shortcut="Ctrl+T" onClick={handleNewTab} />
                <MenuItem label="Open..." shortcut="Ctrl+O" onClick={() => { fileInputRef.current.click(); setActiveMenu(null); }} />
                <MenuItem label="Save" shortcut="Ctrl+S" onClick={handleSave} />
                <MenuItem label="Save As..." shortcut="Ctrl+Shift+S" onClick={handleSaveAs} hasSeparator />
                <MenuItem label="Exit" onClick={() => setDialogConfig({ type: 'alert', message: 'Simply close the tab!' })} />
              </MenuDropdown>

              <MenuDropdown title="Edit" id="edit">
                <MenuItem label="Auto Format" shortcut="Shift+Alt+F" onClick={handleFormat} hasSeparator />
                <MenuItem label="Select All" shortcut="Ctrl+A" onClick={() => { if (editorInstance) { editorInstance.selectAll(); setActiveMenu(null); } }} />
              </MenuDropdown>

              <MenuDropdown title="Language" id="language">
                {languages.map((lang) => (
                  <MenuItem
                    key={lang.id}
                    label={lang.name}
                    shortcut={activeTab?.language === lang.id ? '✓' : ''}
                    onClick={() => {
                      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, language: lang.id } : t));
                      setActiveMenu(null);
                    }}
                  />
                ))}
              </MenuDropdown>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="h-10 bg-gray-100/50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center px-1 space-x-1 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group flex items-center space-x-2 h-8 px-3 rounded-md cursor-pointer transition-all duration-200 min-w-[120px] max-w-[200px] border ${activeTabId === tab.id
                  ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
            >
              <FileText size={14} className={activeTabId === tab.id ? 'text-blue-500' : 'text-gray-400'} />
              <span className="text-xs font-medium truncate flex-1">{tab.filename}</span>
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:bg-gray-300 dark:hover:bg-gray-700 rounded p-0.5 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={handleNewTab}
            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ml-1"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Loading Overlay */}
        {isFormatting && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-xl p-6 flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <span className="text-sm font-semibold">Formatting Code...</span>
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 relative">
          <div ref={editorContainerRef} className="absolute inset-0 z-0"></div>
        </div>

        {/* Status Bar */}
        <div className="h-7 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 text-[11px] font-medium text-gray-500 uppercase tracking-widest select-none shrink-0">
          <div className="flex space-x-8 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>Ready</span>
            </div>
            <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>
          </div>
          <div className="flex space-x-6 items-center">
            <div className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
              {languages.find(l => l.id === activeTab?.language)?.name || 'Plain Text'}
            </div>
            <span>UTF-8</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {dialogConfig && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="h-12 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-5">
              <span className="text-sm font-bold">
                {dialogConfig.type === 'saveAs' ? 'Save As' : 'Notepad IDE'}
              </span>
              <button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => setDialogConfig(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex-1">
              {dialogConfig.type === 'saveAs' ? (
                <div className="flex flex-col space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">File Name</label>
                    <input
                      type="text"
                      autoFocus
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm rounded-lg outline-none focus:border-blue-500 transition-all text-gray-800 dark:text-gray-100"
                      defaultValue={dialogConfig.inputName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') executeSaveAs(e.target.value);
                        if (e.key === 'Escape') setDialogConfig(null);
                      }}
                      id="saveAsInput"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium">
                  {dialogConfig.message}
                </p>
              )}
            </div>
            <div className="p-5 bg-gray-50 dark:bg-gray-950 flex justify-end space-x-3">
              <button
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                onClick={() => dialogConfig.type === 'saveAs' ? executeSaveAs(document.getElementById('saveAsInput').value) : setDialogConfig(null)}
              >
                {dialogConfig.type === 'saveAs' ? 'Save File' : 'Confirm'}
              </button>
              {dialogConfig.type === 'saveAs' && (
                <button
                  className="px-6 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-xl transition-all"
                  onClick={() => setDialogConfig(null)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}