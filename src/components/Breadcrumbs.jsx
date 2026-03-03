import React from 'react';
import { ChevronRight, FileText } from 'lucide-react';

export default function Breadcrumbs({ activeTab, isDark }) {
    if (!activeTab) return null;

    return (
        <div className={`h-8 flex items-center px-4 gap-2 shrink-0 text-[12px] border-b ${isDark ? 'bg-[#1e1e1e] border-[#3c3c3c] text-gray-400' : 'bg-white border-gray-100 text-gray-500'
            }`}>
            <FileText size={12} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
            <span className="hover:underline cursor-pointer">src</span>
            <ChevronRight size={12} className="opacity-40" />
            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {activeTab.filename}
            </span>
            <ChevronRight size={12} className="opacity-40" />
            <span className="opacity-60 text-[10px] uppercase font-bold tracking-tighter">
                {activeTab.language}
            </span>
        </div>
    );
}
