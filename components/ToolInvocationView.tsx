
import React, { useState } from 'react';
import { ToolInvocation } from '../types';

interface Props {
  invocation: ToolInvocation;
}

const ToolInvocationView: React.FC<Props> = ({ invocation }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-2 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${invocation.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          <span className="text-slate-500 uppercase text-xs tracking-wider">Tool Call:</span>
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold">{invocation.tool_name}</code>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs">{invocation.duration_ms}ms</span>
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs font-mono overflow-auto max-h-60">
          <div className="mb-2">
            <span className="text-slate-400 block mb-1 font-sans font-semibold">Arguments:</span>
            <pre className="p-2 bg-slate-900 text-slate-100 rounded">
              {JSON.stringify(invocation.arguments, null, 2)}
            </pre>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 font-sans font-semibold">Result:</span>
            <pre className="p-2 bg-slate-900 text-slate-100 rounded">
              {JSON.stringify(invocation.result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolInvocationView;
