import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS, createTab, languages } from '../constants/languages';

/**
 * Custom hook that manages all tab and theme state with localStorage persistence.
 * Supports dirty tracking, rename, close others/all.
 */
export function useWorkspace() {
    const [tabs, setTabs] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.TABS);
            return saved ? JSON.parse(saved) : [createTab()];
        } catch {
            return [createTab()];
        }
    });

    const [activeTabId, setActiveTabId] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || (tabs[0]?.id || '');
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    });

    const [sidebarOpen, setSidebarOpen] = useState(() => {
        return localStorage.getItem('notepad_sidebar_open') !== 'false';
    });

    const [zenMode, setZenMode] = useState(false);

    // Track saved content per tab for dirty detection
    const savedContentRef = useRef({});

    // Initialize saved content reference
    useEffect(() => {
        tabs.forEach(t => {
            if (!(t.id in savedContentRef.current)) {
                savedContentRef.current[t.id] = t.content;
            }
        });
    }, []);

    const activeTabIdRef = useRef(activeTabId);
    const tabsRef = useRef(tabs);
    useEffect(() => { activeTabIdRef.current = activeTabId; }, [activeTabId]);
    useEffect(() => { tabsRef.current = tabs; }, [tabs]);

    // Persist
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs)); }, [tabs]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTabId || ''); }, [activeTabId]);
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('notepad_sidebar_open', sidebarOpen);
    }, [sidebarOpen]);

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
    const isDark = theme === 'dark';

    // Compute dirty state for each tab
    const tabsWithDirty = tabs.map(t => ({
        ...t,
        isDirty: savedContentRef.current[t.id] !== undefined && t.content !== savedContentRef.current[t.id],
    }));

    // Tab helpers
    const getNextUntitledFilename = () => {
        let i = 1;
        while (tabsRef.current.some(t => t.filename === `Untitled ${i}.txt`)) i++;
        return `Untitled ${i}.txt`;
    };

    const addTab = (filename, language = 'plaintext', content = '') => {
        const newTab = createTab(filename || getNextUntitledFilename(), language, content);
        savedContentRef.current[newTab.id] = content;
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
        return newTab.id;
    };

    const closeTab = (id) => {
        if (tabs.length === 1) {
            const newTab = createTab(getNextUntitledFilename());
            savedContentRef.current[newTab.id] = '';
            setTabs([newTab]);
            setActiveTabId(newTab.id);
            delete savedContentRef.current[id];
            return;
        }
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
        delete savedContentRef.current[id];
    };

    const closeOtherTabs = (keepId) => {
        const kept = tabs.filter(t => t.id === keepId);
        setTabs(kept);
        setActiveTabId(keepId);
        // Clean up refs
        Object.keys(savedContentRef.current).forEach(id => {
            if (id !== keepId) delete savedContentRef.current[id];
        });
    };

    const closeAllTabs = () => {
        const newTab = createTab(getNextUntitledFilename());
        savedContentRef.current = { [newTab.id]: '' };
        setTabs([newTab]);
        setActiveTabId(newTab.id);
    };

    const renameTab = (id, newName) => {
        setTabs(prev => prev.map(t => t.id === id ? { ...t, filename: newName } : t));
    };

    const updateActiveTab = (updates) => {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
    };

    const markSaved = (id) => {
        const tab = tabs.find(t => t.id === id);
        if (tab) savedContentRef.current[id] = tab.content;
        // Force re-render
        setTabs(prev => [...prev]);
    };

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Auto-save logic
    const autoSave = (settings) => {
        if (settings.autoSave && tabsWithDirty.some(t => t.isDirty)) {
            tabsWithDirty.forEach(t => {
                if (t.isDirty) markSaved(t.id);
            });
        }
    };

    // Auto-detect language from file extension
    const detectLanguage = (filename) => {
        const ext = filename.substring(filename.lastIndexOf('.'));
        const found = languages.find(l => l.ext === ext);
        return found ? found.id : 'plaintext';
    };

    // Reorder tabs via drag & drop
    const reorderTabs = (fromIndex, toIndex) => {
        setTabs(prev => {
            const result = [...prev];
            const [moved] = result.splice(fromIndex, 1);
            result.splice(toIndex, 0, moved);
            return result;
        });
    };

    // Recent files (localStorage backed, max 10)
    const [recentFiles, setRecentFiles] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('notepad_recent_files') || '[]');
        } catch { return []; }
    });

    const addRecentFile = (filename) => {
        setRecentFiles(prev => {
            const filtered = prev.filter(f => f !== filename);
            const updated = [filename, ...filtered].slice(0, 10);
            localStorage.setItem('notepad_recent_files', JSON.stringify(updated));
            return updated;
        });
    };

    return {
        tabs: tabsWithDirty, setTabs,
        activeTabId, setActiveTabId,
        activeTab, isDark,
        theme, toggleTheme,
        activeTabIdRef, tabsRef,
        addTab, closeTab, closeOtherTabs, closeAllTabs,
        renameTab, updateActiveTab, markSaved,
        getNextUntitledFilename, detectLanguage,
        reorderTabs, recentFiles, addRecentFile,
        sidebarOpen, setSidebarOpen,
        zenMode, setZenMode,
        autoSave,
    };
}

