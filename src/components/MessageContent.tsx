
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageContentProps {
  content: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-foreground mt-4 mb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-foreground mt-3 mb-2 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-foreground mt-3 mb-1 first:mt-0">
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-foreground leading-relaxed mb-2 last:mb-0">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2 text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2 text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground leading-relaxed">
              {children}
            </li>
          ),
          // Strong/Bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          // Emphasis/Italic text
          em: ({ children }) => (
            <em className="italic text-foreground">
              {children}
            </em>
          ),
          // Code blocks
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-2 text-sm">
              {children}
            </pre>
          ),
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-primary underline hover:text-primary/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground mb-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContent;
