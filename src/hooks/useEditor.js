import { useState, useEffect, useRef } from 'react';
import { languages } from '../constants/languages';
import { loadScript } from '../utils/helpers';

/**
 * Custom hook for managing the Ace Editor instance.
 * Now accepts `settings` from useSettings for dynamic configuration.
 */
export function useEditor({ activeTabIdRef, tabsRef, activeTab, activeTabId, setTabs, isDark, settings }) {
    const [editorInstance, setEditorInstance] = useState(null);
    const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
    const editorContainerRef = useRef(null);

    // Initialize Ace
    useEffect(() => {
        let editor;
        const init = async () => {
            if (!window.ace) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/ace.js');
            window.ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/');

            editor = window.ace.edit(editorContainerRef.current);
            editor.setTheme(isDark ? "ace/theme/one_dark" : "ace/theme/chrome");
            editor.setOptions({
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily,
                showPrintMargin: false,
                wrap: settings.wordWrap,
                showLineNumbers: true,
                showGutter: true,
                tabSize: settings.tabSize,
                useSoftTabs: true,
                highlightActiveLine: true,
                highlightSelectedWord: true,
                displayIndentGuides: settings.showIndentationGuides,
                lineHeight: settings.lineHeight,
                showInvisibles: false,
            });

            const initialTab = tabsRef.current.find(t => t.id === activeTabIdRef.current) || tabsRef.current[0];
            if (initialTab) editor.setValue(initialTab.content, -1);

            editor.on('change', () => {
                const val = editor.getValue();
                const currentId = activeTabIdRef.current;
                setTabs(prev => {
                    const tab = prev.find(t => t.id === currentId);
                    if (tab && tab.content === val) return prev;
                    return prev.map(t => t.id === currentId ? { ...t, content: val } : t);
                });
            });

            editor.selection.on('changeCursor', () => {
                const pos = editor.getCursorPosition();
                setCursorPos({ ln: pos.row + 1, col: pos.column + 1 });
            });

            setEditorInstance(editor);
        };
        init();
        return () => { if (editor) editor.destroy(); };
    }, []);

    // Sync settings dynamically
    useEffect(() => {
        if (!editorInstance) return;
        editorInstance.setOptions({
            fontSize: `${settings.fontSize}px`,
            tabSize: settings.tabSize,
            wrap: settings.wordWrap,
            fontFamily: settings.fontFamily,
            displayIndentGuides: settings.showIndentationGuides,
            lineHeight: settings.lineHeight,
        });
    }, [settings, editorInstance]);

    // Sync language mode
    useEffect(() => {
        if (editorInstance && activeTab) {
            const langDef = languages.find(l => l.id === activeTab.language);
            editorInstance.session.setMode(`ace/mode/${langDef ? langDef.aceMode : 'text'}`);
        }
    }, [activeTab?.language, editorInstance]);

    // Sync theme
    useEffect(() => {
        if (editorInstance) editorInstance.setTheme(isDark ? "ace/theme/one_dark" : "ace/theme/chrome");
    }, [isDark, editorInstance]);

    // Sync content on tab switch
    useEffect(() => {
        if (editorInstance && activeTab && editorInstance.getValue() !== activeTab.content) {
            editorInstance.setValue(activeTab.content, -1);
        }
    }, [activeTabId, editorInstance]);

    return { editorInstance, editorContainerRef, cursorPos };
}
