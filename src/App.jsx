import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Settings, FileText, ChevronDown } from 'lucide-react';

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
  const [filename, setFilename] = useState('Untitled.txt');
  const [language, setLanguage] = useState('plaintext');
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  
  // UI & Editor State
  const [activeMenu, setActiveMenu] = useState(null);
  const [dialogConfig, setDialogConfig] = useState(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);

  const editorContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

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
      
      // Critical: Set base path so Ace can load its theme, worker, and mode extensions dynamically
      window.ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/');
      
      editor = window.ace.edit(editorContainerRef.current);
      editor.setTheme("ace/theme/chrome"); // Light theme similar to Windows Notepad
      editor.session.setMode("ace/mode/text");
      
      editor.setOptions({
        fontSize: "14px",
        fontFamily: "monospace",
        showPrintMargin: false,
        wrap: true,
        showLineNumbers: true, // Enabled for IDE feel
        showGutter: true,
        tabSize: 4,
        useSoftTabs: true
      });

      // Track cursor for status bar
      editor.selection.on('changeCursor', () => {
        const pos = editor.getCursorPosition();
        setCursorPos({ ln: pos.row + 1, col: pos.column + 1 });
      });

      setEditorInstance(editor);
    };

    initEditor();
    return () => { if (editor) editor.destroy(); };
  }, []);

  // Sync Language -> Ace Mode
  useEffect(() => {
    if (editorInstance) {
      const langDef = languages.find(l => l.id === language);
      editorInstance.session.setMode(`ace/mode/${langDef ? langDef.aceMode : 'text'}`);
    }
  }, [language, editorInstance]);

  // --- File Operations ---
  const handleNew = () => {
    if (editorInstance) editorInstance.setValue('', -1);
    setFilename('Untitled.txt');
    setLanguage('plaintext');
    setActiveMenu(null);
  };

  const handleOpen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (editorInstance) {
        editorInstance.setValue(event.target.result, -1);
      }
      setFilename(file.name);
      
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      const foundLang = languages.find(l => l.ext === ext);
      setLanguage(foundLang ? foundLang.id : 'plaintext');
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
    if (filename.startsWith('Untitled')) {
      handleSaveAs();
    } else {
      const code = editorInstance ? editorInstance.getValue() : '';
      triggerDownload(filename, code);
      setActiveMenu(null);
    }
  }, [filename, editorInstance]);

  const handleSaveAs = () => {
    setActiveMenu(null);
    let defaultName = filename;
    const currentLang = languages.find(l => l.id === language);
    if (currentLang) {
      const lastDot = filename.lastIndexOf('.');
      const baseName = lastDot !== -1 ? filename.substring(0, lastDot) : filename;
      defaultName = `${baseName}${currentLang.ext}`;
    }
    setDialogConfig({ type: 'saveAs', inputName: defaultName });
  };

  const executeSaveAs = (newName) => {
    if (!newName.trim()) return;
    
    let finalName = newName.trim();
    const currentLang = languages.find(l => l.id === language);
    if (currentLang && !finalName.includes('.')) {
      finalName += currentLang.ext;
    }

    setFilename(finalName);
    const code = editorInstance ? editorInstance.getValue() : '';
    triggerDownload(finalName, code);
    setDialogConfig(null);
  };

  // --- Formatting ---
  const handleFormat = useCallback(async () => {
    setActiveMenu(null);
    if (!editorInstance) return;

    const currentCode = editorInstance.getValue();
    if (!currentCode.trim()) return;

    if (language === 'plaintext') {
      setDialogConfig({ type: 'alert', message: 'Formatting is not available for Plain Text. Please select a programming language.' });
      return;
    }

    setIsFormatting(true);
    try {
      let formatted = currentCode;

      // 1. Native JSON Beautifier
      if (language === 'json') {
        const parsed = JSON.parse(currentCode);
        formatted = JSON.stringify(parsed, null, 4);
      } 
      // 2. Dedicated SQL Beautifier
      else if (language === 'sql') {
        await loadScript('https://unpkg.com/sql-formatter@15.0.2/dist/sql-formatter.min.js');
        formatted = window.sqlFormatter.format(currentCode, { language: 'sql', tabWidth: 4 });
      } 
      // 3. C-Style Languages (Java, C++, C#, PHP) using JS-Beautify
      else if (['java', 'cpp', 'csharp', 'php'].includes(language)) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.11/beautify.min.js');
        formatted = window.js_beautify(currentCode, { indent_size: 4, brace_style: "collapse" });
      } 
      // 4. Custom Batch Script Formatter
      else if (language === 'bat') {
        let indentLevel = 0;
        formatted = currentCode.split('\n').map(line => {
          let trimmed = line.trim();
          if (trimmed.startsWith(')')) indentLevel = Math.max(0, indentLevel - 1);
          const indentedLine = trimmed ? '    '.repeat(indentLevel) + trimmed : '';
          if (trimmed.endsWith('(')) indentLevel++;
          return indentedLine;
        }).join('\n');
      } 
      // 5. Custom Python Cleanup (Whitespace strict language)
      else if (language === 'python') {
        formatted = currentCode.split('\n').map(line => line.trimEnd()).join('\n');
      } 
      // 6. Prettier for Web Languages (JS, TS, HTML, CSS, Markdown)
      else {
        await loadScript('https://unpkg.com/prettier@3.2.5/standalone.js');
        let plugins = [];
        let parser = '';

        if (['javascript', 'typescript'].includes(language)) {
          await loadScript('https://unpkg.com/prettier@3.2.5/plugins/estree.js');
          await loadScript('https://unpkg.com/prettier@3.2.5/plugins/babel.js');
          plugins = [window.prettierPlugins.estree, window.prettierPlugins.babel];
          parser = language === 'typescript' ? 'babel-ts' : 'babel';
        } else if (language === 'html') {
          await loadScript('https://unpkg.com/prettier@3.2.5/plugins/html.js');
          plugins = [window.prettierPlugins.html];
          parser = 'html';
        } else if (language === 'css') {
          await loadScript('https://unpkg.com/prettier@3.2.5/plugins/postcss.js');
          plugins = [window.prettierPlugins.postcss];
          parser = 'css';
        } else if (language === 'markdown') {
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

      // Apply formatting back to editor
      const cursorPos = editorInstance.getCursorPosition();
      editorInstance.setValue(formatted, -1);
      editorInstance.clearSelection();
      editorInstance.moveCursorToPosition(cursorPos);
      
    } catch (error) {
      const errorMsg = error.message ? error.message.split('\n')[0] : 'Ensure there are no syntax errors.';
      setDialogConfig({ type: 'alert', message: `Formatting Error: ${errorMsg}` });
    } finally {
      setIsFormatting(false);
    }
  }, [language, editorInstance]);

  // Tie keyboard shortcuts dynamically directly to Ace Editor commands
  useEffect(() => {
    if (editorInstance) {
      editorInstance.commands.addCommand({
        name: 'save',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: () => handleSave()
      });
      editorInstance.commands.addCommand({
        name: 'open',
        bindKey: {win: 'Ctrl-O',  mac: 'Command-O'},
        exec: () => fileInputRef.current.click()
      });
      editorInstance.commands.addCommand({
        name: 'format',
        bindKey: {win: 'Shift-Alt-F',  mac: 'Shift-Option-F'},
        exec: () => handleFormat()
      });
    }
  }, [editorInstance, handleSave, handleFormat]);

  // --- UI Components ---
  const MenuDropdown = ({ title, id, children }) => {
    const isActive = activeMenu === id;
    return (
      <div className="relative">
        <button
          className={`px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${isActive ? 'bg-gray-200 shadow-inner' : ''}`}
          onClick={() => setActiveMenu(isActive ? null : id)}
        >
          {title}
        </button>
        {isActive && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-[#f2f2f2] border border-gray-300 shadow-lg rounded-md py-1 z-50 flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>
        )}
      </div>
    );
  };

  const MenuItem = ({ label, shortcut, onClick, hasSeparator }) => (
    <>
      <button 
        className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-100 flex justify-between items-center"
        onClick={onClick}
      >
        <span>{label}</span>
        {shortcut && <span className="text-gray-500 text-xs">{shortcut}</span>}
      </button>
      {hasSeparator && <div className="h-px bg-gray-300 my-1 mx-2" />}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center font-sans">
      
      {/* Hidden File Input for Open functionality */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleOpen} 
        className="hidden" 
        accept=".txt,.js,.ts,.py,.java,.cs,.cpp,.php,.sql,.html,.css,.json,.md,.bat" 
      />

      {/* Main Notepad Window */}
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden">
        
        {/* Title Bar */}
        <div className="h-10 bg-[#f9f9f9] border-b border-gray-200 flex items-center justify-between px-3 select-none">
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <FileText size={16} className="text-blue-500" />
            <span className="font-medium">{filename} - Notepad IDE</span>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="px-2 py-1 bg-[#f9f9f9] border-b border-gray-200 flex items-center space-x-1" ref={menuRef}>
          <MenuDropdown title="File" id="file">
            <MenuItem label="New" shortcut="Ctrl+N" onClick={handleNew} />
            <MenuItem label="Open..." shortcut="Ctrl+O" onClick={() => { fileInputRef.current.click(); setActiveMenu(null); }} />
            <MenuItem label="Save" shortcut="Ctrl+S" onClick={handleSave} />
            <MenuItem label="Save As..." shortcut="Ctrl+Shift+S" onClick={handleSaveAs} hasSeparator />
            <MenuItem label="Exit" onClick={() => setDialogConfig({ type: 'alert', message: 'You cannot exit a web application this way. Simply close the tab!' })} />
          </MenuDropdown>

          <MenuDropdown title="Edit" id="edit">
            <MenuItem label="Auto Format Code" shortcut="Shift+Alt+F" onClick={handleFormat} hasSeparator />
            <MenuItem label="Select All" shortcut="Ctrl+A" onClick={() => { if(editorInstance) { editorInstance.selectAll(); setActiveMenu(null); } }} />
          </MenuDropdown>

          <MenuDropdown title="Language" id="language">
            {languages.map((lang) => (
              <MenuItem 
                key={lang.id} 
                label={`${lang.name} ${language === lang.id ? '✓' : ''}`} 
                onClick={() => { 
                  setLanguage(lang.id); 
                  setActiveMenu(null); 
                  if (filename.startsWith('Untitled')) {
                    setFilename(`Untitled${lang.ext}`);
                  }
                }} 
              />
            ))}
          </MenuDropdown>
        </div>

        {/* Loading Overlay for Formatting */}
        {isFormatting && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-40 backdrop-blur-sm">
            <div className="bg-white border border-gray-300 shadow-lg rounded-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-sm font-medium text-gray-700">Formatting code...</span>
            </div>
          </div>
        )}

        {/* Ace Editor Area Container */}
        <div className="flex-1 relative bg-white">
          <div ref={editorContainerRef} className="absolute inset-0 z-0"></div>
        </div>

        {/* Status Bar */}
        <div className="h-8 bg-[#f3f3f3] border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600 select-none">
          <div className="flex space-x-6">
            <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>
          </div>
          <div className="flex space-x-6">
            <span className="capitalize">{languages.find(l => l.id === language)?.name || 'Plain Text'}</span>
          </div>
        </div>
      </div>

      {/* --- Modals / Dialogs --- */}
      {dialogConfig && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-[#f0f0f0] border border-gray-400 shadow-2xl rounded-md w-96 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="h-8 bg-white border-b border-gray-300 flex items-center justify-between px-3 select-none">
              <span className="text-xs font-medium text-gray-700">
                {dialogConfig.type === 'saveAs' ? 'Save As' : 'Notepad Message'}
              </span>
              <button className="hover:bg-red-500 hover:text-white p-1 rounded transition-colors" onClick={() => setDialogConfig(null)}>
                <X size={14} />
              </button>
            </div>

            <div className="p-5 flex-1 bg-[#f0f0f0]">
              {dialogConfig.type === 'saveAs' ? (
                <div className="flex flex-col space-y-3">
                  <label className="text-sm text-gray-700">File name:</label>
                  <input 
                    type="text" 
                    autoFocus
                    className="border border-gray-400 px-2 py-1 text-sm outline-none focus:border-blue-500"
                    defaultValue={dialogConfig.inputName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') executeSaveAs(e.target.value);
                      if (e.key === 'Escape') setDialogConfig(null);
                    }}
                    id="saveAsInput"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    Files will be saved directly to your local downloads folder.
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-800">
                  {dialogConfig.message}
                </div>
              )}
            </div>

            <div className="p-3 bg-[#f0f0f0] border-t border-gray-300 flex justify-end space-x-2">
              {dialogConfig.type === 'saveAs' ? (
                <>
                  <button 
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded shadow-sm transition-colors"
                    onClick={() => executeSaveAs(document.getElementById('saveAsInput').value)}
                  >
                    Save
                  </button>
                  <button 
                    className="px-4 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-sm rounded shadow-sm transition-colors"
                    onClick={() => setDialogConfig(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded shadow-sm transition-colors"
                  onClick={() => setDialogConfig(null)}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}