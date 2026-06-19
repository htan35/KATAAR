'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date | string;
}

export default function MessageBubble({ role, content, createdAt }: MessageBubbleProps) {
  const isUser = role === 'user';
  
  const formattedTime = createdAt 
    ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full gap-3.5 my-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/30 text-accent-purple shrink-0 mt-1 shadow-inner">
          <Sparkles size={16} />
        </div>
      )}
      
      <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-lg ${
          isUser 
            ? 'bg-accent-blue-bubble border border-white/5 text-text-primary rounded-tr-none' 
            : 'bg-accent-purple-bubble border border-border-glass text-text-primary rounded-tl-none'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="text-text-primary">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ node, ...props }) => <table className="border-collapse my-2 w-full text-xs text-left" {...props} />,
                  thead: ({ node, ...props }) => <thead className="bg-white/5" {...props} />,
                  tbody: ({ node, ...props }) => <tbody className="divide-y divide-white/5" {...props} />,
                  th: ({ node, ...props }) => <th className="border border-white/10 px-3 py-1.5 font-bold" {...props} />,
                  td: ({ node, ...props }) => <td className="border border-white/10 px-3 py-1.5" {...props} />,
                  a: ({ node, ...props }) => <a className="text-accent-purple hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-1" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-normal" {...props} />,
                  code: ({ node, ...props }) => <code className="bg-white/5 rounded px-1.5 py-0.5 text-accent-purple text-xs font-mono" {...props} />,
                  pre: ({ node, ...props }) => <pre className="bg-white/5 rounded p-3 text-xs overflow-x-auto font-mono my-2 border border-border-glass" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        <span className="text-[10px] text-text-muted mt-1 px-1.5">{formattedTime}</span>
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-text-secondary shrink-0 mt-1 shadow-inner">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
