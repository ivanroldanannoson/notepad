import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ dialogConfig, setDialogConfig, executeSaveAs, isDark }) {
    if (!dialogConfig) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
            <div className={`rounded-2xl w-full max-w-sm overflow-hidden flex flex-col border ${isDark ? 'bg-[#2a2a2e] border-white/10 shadow-2xl shadow-black/50' : 'bg-white border-gray-200 shadow-2xl shadow-gray-300/40'
                }`}>
                {/* Header */}
                <div className={`h-12 flex items-center justify-between px-5 border-b ${isDark ? 'bg-[#333338] border-white/5' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <span className="text-[13px] font-bold">
                        {dialogConfig.type === 'saveAs' ? 'Save As' : 'Notepad IDE'}
                    </span>
                    <button
                        className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-400'}`}
                        onClick={() => setDialogConfig(null)}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {dialogConfig.type === 'saveAs' ? (
                        <div className="flex flex-col gap-3">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">File Name</label>
                            <input
                                type="text"
                                autoFocus
                                className={`w-full px-4 py-3 text-[14px] rounded-xl outline-none border-2 transition-colors font-medium ${isDark
                                        ? 'bg-[#1e1e1e] border-white/10 text-white focus:border-blue-500'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                                    }`}
                                defaultValue={dialogConfig.inputName}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') executeSaveAs(e.target.value);
                                    if (e.key === 'Escape') setDialogConfig(null);
                                }}
                                id="saveAsInput"
                            />
                        </div>
                    ) : (
                        <p className={`text-[14px] font-medium leading-relaxed text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {dialogConfig.message}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 flex gap-3 ${dialogConfig.type === 'saveAs' ? 'justify-end' : 'justify-center'} border-t ${isDark ? 'bg-[#333338] border-white/5' : 'bg-gray-50 border-gray-100'
                    }`}>
                    {dialogConfig.type === 'saveAs' && (
                        <button
                            className={`px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            onClick={() => setDialogConfig(null)}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
                        onClick={() => dialogConfig.type === 'saveAs'
                            ? executeSaveAs(document.getElementById('saveAsInput').value)
                            : setDialogConfig(null)
                        }
                    >
                        {dialogConfig.type === 'saveAs' ? 'Save' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
}
