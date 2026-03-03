// Language definitions for the editor
export const languages = [
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

// File extensions accepted by the file input
export const ACCEPTED_EXTENSIONS = languages.map(l => l.ext).join(',');

// Default tab factory
export const createTab = (filename = 'Untitled 1.txt', language = 'plaintext', content = '') => ({
    id: Date.now().toString(),
    filename,
    language,
    content,
});

// LocalStorage keys
export const STORAGE_KEYS = {
    TABS: 'notepad_tabs',
    ACTIVE_TAB: 'notepad_active_tab_id',
    THEME: 'notepad_theme',
};
