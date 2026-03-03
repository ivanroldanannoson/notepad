import React, { useEffect, useState, useRef } from 'react';
import { loadScript } from '../utils/helpers';

export default function MarkdownPreview({ content, isDark }) {
    const [html, setHtml] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const render = async () => {
            if (!window.marked) {
                await loadScript('https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js');
            }
            const rendered = window.marked.parse(content || '');
            setHtml(rendered);
        };
        render();
    }, [content]);

    return (
        <div
            ref={containerRef}
            className={`h-full overflow-y-auto px-8 py-6 prose prose-sm max-w-none ${isDark ? 'prose-invert bg-[#1e1e1e]' : 'bg-white'
                }`}
            style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
