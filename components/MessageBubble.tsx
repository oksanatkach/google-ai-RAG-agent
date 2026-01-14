
import React from 'react';
import { Turn, Role } from '../types';
import ToolInvocationView from './ToolInvocationView';

interface Props {
  turn: Turn;
  isProcessing?: boolean;
}

const MessageBubble: React.FC<Props> = ({ turn, isProcessing }) => {
  // Handle System welcome messages
  if (turn.type === 'system') {
    return (
      <div className="flex flex-col mb-6 items-start">
        <div className="max-w-[85%] bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-2xl p-4 shadow-sm">
          <p className="text-sm leading-relaxed">{turn.message?.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-8">
      {/* User Message */}
      {turn.user_message && (
        <div className="flex flex-col items-end mb-4">
          <div className="max-w-[80%] bg-indigo-600 text-white rounded-2xl px-4 py-2.5 shadow-md">
            <p className="text-sm">{turn.user_message.content}</p>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 mr-2">
            {new Date(turn.user_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Tool Invocations */}
      {turn.tool_invocations && turn.tool_invocations.length > 0 && (
        <div className="max-w-[85%] mb-4 space-y-1 ml-4 border-l-2 border-slate-200 pl-4">
           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Internal Chain of Thought</h4>
           {turn.tool_invocations.map((inv) => (
             <ToolInvocationView key={inv.invocation_id} invocation={inv} />
           ))}
        </div>
      )}

      {/* Model Response */}
      {turn.model_response ? (
        <div className="flex flex-col items-start">
          <div className="max-w-[90%] bg-white border border-slate-200 text-slate-800 rounded-2xl p-4 shadow-sm markdown-content">
            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(turn.model_response.content) }} />
            
            {turn.model_response.metadata?.sources_cited && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sources</p>
                <div className="flex flex-wrap gap-2">
                  {turn.model_response.metadata.sources_cited.map(s => (
                    <span key={s} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 ml-2">
            <span className="text-[10px] text-slate-400">
                {new Date(turn.model_response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {turn.turn_metadata && (
                <span className="text-[10px] text-slate-300 italic">
                    {turn.turn_metadata.token_usage.total_tokens} tokens used
                </span>
            )}
          </div>
        </div>
      ) : isProcessing && (
        <div className="flex items-start">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            <span className="text-xs text-slate-400 ml-1">Thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple basic markdown formatter
function formatMarkdown(text: string): string {
    return text
        .replace(/^# (.*$)/gim, '<h1 class="font-bold text-xl mb-2">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="font-bold text-lg mb-1">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="font-bold text-md">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 rounded text-indigo-600">$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br />')
        .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        .split('\n').map(line => line.trim()).join('\n');
}

export default MessageBubble;
