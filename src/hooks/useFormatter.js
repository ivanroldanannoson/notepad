import { useCallback } from 'react';
import { loadScript } from '../utils/helpers';

/**
 * Custom hook that provides a format function for the current editor content.
 */
export function useFormatter({ editorInstance, activeTab, setDialogConfig, setIsFormatting }) {
    const handleFormat = useCallback(async () => {
        if (!editorInstance || !activeTab) return;
        const currentCode = editorInstance.getValue();
        if (!currentCode.trim()) return;

        if (activeTab.language === 'plaintext') {
            setDialogConfig({ type: 'alert', message: 'Formatting is not available for Plain Text. Select a language first.' });
            return;
        }

        setIsFormatting(true);
        try {
            let formatted = currentCode;

            if (activeTab.language === 'json') {
                formatted = JSON.stringify(JSON.parse(currentCode), null, 4);
            } else if (activeTab.language === 'sql') {
                await loadScript('https://unpkg.com/sql-formatter@15.0.2/dist/sql-formatter.min.js');
                formatted = window.sqlFormatter.format(currentCode, { language: 'sql', tabWidth: 4 });
            } else if (['java', 'cpp', 'csharp', 'php'].includes(activeTab.language)) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.11/beautify.min.js');
                formatted = window.js_beautify(currentCode, { indent_size: 4, brace_style: "collapse" });
            } else if (activeTab.language === 'bat') {
                let indent = 0;
                formatted = currentCode.split('\n').map(l => {
                    let t = l.trim();
                    if (t.startsWith(')')) indent = Math.max(0, indent - 1);
                    const r = t ? '    '.repeat(indent) + t : '';
                    if (t.endsWith('(')) indent++;
                    return r;
                }).join('\n');
            } else if (activeTab.language === 'python') {
                formatted = currentCode.split('\n').map(l => l.trimEnd()).join('\n');
            } else {
                await loadScript('https://unpkg.com/prettier@3.2.5/standalone.js');
                let plugins = [], parser = '';

                if (['javascript', 'typescript'].includes(activeTab.language)) {
                    await loadScript('https://unpkg.com/prettier@3.2.5/plugins/estree.js');
                    await loadScript('https://unpkg.com/prettier@3.2.5/plugins/babel.js');
                    plugins = [window.prettierPlugins.estree, window.prettierPlugins.babel];
                    parser = activeTab.language === 'typescript' ? 'babel-ts' : 'babel';
                } else if (activeTab.language === 'html') {
                    await loadScript('https://unpkg.com/prettier@3.2.5/plugins/html.js');
                    plugins = [window.prettierPlugins.html]; parser = 'html';
                } else if (activeTab.language === 'css') {
                    await loadScript('https://unpkg.com/prettier@3.2.5/plugins/postcss.js');
                    plugins = [window.prettierPlugins.postcss]; parser = 'css';
                } else if (activeTab.language === 'markdown') {
                    await loadScript('https://unpkg.com/prettier@3.2.5/plugins/markdown.js');
                    plugins = [window.prettierPlugins.markdown]; parser = 'markdown';
                }

                formatted = await window.prettier.format(currentCode, { parser, plugins, singleQuote: true, tabWidth: 4 });
            }

            editorInstance.setValue(formatted, -1);
        } catch (error) {
            setDialogConfig({ type: 'alert', message: `Format Error: ${error.message?.split('\n')[0] || 'Check syntax.'}` });
        } finally {
            setIsFormatting(false);
        }
    }, [activeTab, editorInstance, setDialogConfig, setIsFormatting]);

    return handleFormat;
}
