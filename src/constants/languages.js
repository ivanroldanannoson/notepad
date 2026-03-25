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

// Set of accepted extensions for fast lookup
export const ACCEPTED_EXT_SET = new Set(languages.map(l => l.ext.toLowerCase()));

// Categories of unsupported files with friendly labels
export const UNSUPPORTED_CATEGORIES = {
    video:   { exts: ['.mp4','.mov','.avi','.mkv','.webm','.flv','.wmv'], label: 'Video files' },
    audio:   { exts: ['.mp3','.wav','.ogg','.flac','.aac','.m4a','.wma'], label: 'Audio files' },
    image:   { exts: ['.png','.jpg','.jpeg','.gif','.bmp','.webp','.svg','.ico','.tiff'], label: 'Image files' },
    archive: { exts: ['.zip','.tar','.gz','.rar','.7z','.bz2','.xz'], label: 'Archive files' },
    binary:  { exts: ['.exe','.dll','.so','.bin','.dmg','.pkg','.deb','.apk','.pdf','.docx','.xlsx','.pptx'], label: 'Binary/document files' },
};

/**
 * Returns { supported: true } for accepted text/code files, or
 * { supported: false, category: 'video'|'audio'|... , label: 'Video files' } for known unsupported types,
 * or { supported: false, category: 'unknown', label: 'Unknown file type' }.
 */
export function classifyFile(filename) {
    if (!filename) return { supported: false, category: 'unknown', label: 'Unknown file type' };
    const ext = filename.includes('.')
        ? filename.substring(filename.lastIndexOf('.')).toLowerCase()
        : '';
    if (ACCEPTED_EXT_SET.has(ext)) return { supported: true };
    for (const [cat, info] of Object.entries(UNSUPPORTED_CATEGORIES)) {
        if (info.exts.includes(ext)) return { supported: false, category: cat, label: info.label };
    }
    return { supported: false, category: 'unknown', label: 'Unknown file type' };
}

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
