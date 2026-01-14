
import React, { useState, useEffect, useRef } from 'react';
import { Turn, Role, ConversationExport } from './types';
import { AGENT_VERSION, DEFAULT_MODEL } from './constants';
import { GeminiAgent } from './services/geminiService';
import MessageBubble from './components/MessageBubble';

const App: React.FC = () => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agent] = useState(() => new GeminiAgent());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [convId] = useState(`conv-${Date.now()}`);

  useEffect(() => {
    // Initial welcome message
    const welcomeTurn: Turn = {
      turn_id: 0,
      timestamp: new Date().toISOString(),
      type: 'system',
      message: {
        role: Role.MODEL,
        content: "Hello! I'm the ACME Q&A Agent. I can help you find information about company policies, product metrics, security practices, and more. What would you like to know?"
      }
    };
    setTurns([welcomeTurn]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const query = inputValue;
    setInputValue('');
    setIsProcessing(true);

    await agent.processUserQuery(query, (updatedTurn) => {
      setTurns(prev => {
        const index = prev.findIndex(t => t.turn_id === updatedTurn.turn_id);
        if (index > -1) {
          const newTurns = [...prev];
          newTurns[index] = updatedTurn as Turn;
          return newTurns;
        } else {
          return [...prev, updatedTurn as Turn];
        }
      });
    });

    setIsProcessing(false);
  };

  const handleExport = () => {
    const totalToolCalls = turns.reduce((acc, t) => acc + (t.tool_invocations?.length || 0), 0);
    const totalTokens = turns.reduce((acc, t) => acc + (t.turn_metadata?.token_usage.total_tokens || 0), 0);
    const userMessages = turns.filter(t => t.type === 'user_query').length;
    const modelResponses = turns.filter(t => t.model_response).length;

    const exportData: ConversationExport = {
      conversation_id: convId,
      created_at: turns[0]?.timestamp || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        agent_version: AGENT_VERSION,
        model: DEFAULT_MODEL,
        total_turns: turns.length,
        total_tool_calls: totalToolCalls
      },
      turns: turns,
      conversation_metadata: {
        total_duration_ms: turns.reduce((acc, t) => acc + (t.turn_metadata?.total_duration_ms || 0), 0),
        // Fix: Use the correctly named variable 'totalTokens' to set the 'total_tokens' property
        total_tokens: totalTokens,
        user_messages: userMessages,
        model_responses: modelResponses,
        tool_invocations: totalToolCalls,
        errors: []
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${convId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto bg-slate-50 border-x border-slate-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">ACME Q&A Agent</h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">v{AGENT_VERSION} • {DEFAULT_MODEL}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium shadow-md shadow-slate-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export JSON
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2">
        {turns.map((turn) => (
          <MessageBubble key={turn.turn_id} turn={turn} isProcessing={isProcessing && turns[turns.length-1].turn_id === turn.turn_id} />
        ))}
        {isProcessing && turns[turns.length-1].model_response && (
            <div className="flex items-start">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                <span className="text-xs text-slate-400 ml-1">Agent is working...</span>
              </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about ACME products, documents, or policies..."
            disabled={isProcessing}
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center"
          >
            {isProcessing ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <div className="flex justify-center mt-3 gap-6">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Sequential reasoning
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Secure internal tools
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                Exportable sessions
            </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
