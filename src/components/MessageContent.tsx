
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';

interface MessageContentProps {
  content: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  // Helper function to detect nutrition content
  const isNutritionContent = (text: string) => {
    return text.includes('kcal') || text.includes('protein') || text.includes('carbs') || text.includes('fat');
  };

  // Helper function to extract text from React children
  const extractTextFromChildren = (children: any): string => {
    if (typeof children === 'string') {
      return children;
    }
    
    if (Array.isArray(children)) {
      return children.map(child => extractTextFromChildren(child)).join('');
    }
    
    if (React.isValidElement(children) && children.props && typeof children.props === 'object' && 'children' in children.props) {
      return extractTextFromChildren(children.props.children);
    }
    
    return String(children || '');
  };

  // Helper function to parse nutrition info from list items
  const parseNutritionItem = (children: any) => {
    const text = extractTextFromChildren(children);
    
    // Check if this looks like a food item with nutrition info
    const nutritionMatch = text.match(/^([^:]+):\s*(.+)/);
    if (nutritionMatch && isNutritionContent(text)) {
      const [, foodName, nutritionInfo] = nutritionMatch;
      
      // Extract calories and macros
      const caloriesMatch = nutritionInfo.match(/(\d+)\s*kcal/);
      const proteinMatch = nutritionInfo.match(/(\d+\.?\d*)g?\s*protein/i);
      const carbsMatch = nutritionInfo.match(/(\d+\.?\d*)g?\s*carbs?/i);
      const fatMatch = nutritionInfo.match(/(\d+\.?\d*)g?\s*fat/i);
      
      return {
        foodName: foodName.trim(),
        calories: caloriesMatch ? caloriesMatch[1] : null,
        protein: proteinMatch ? proteinMatch[1] : null,
        carbs: carbsMatch ? carbsMatch[1] : null,
        fat: fatMatch ? fatMatch[1] : null,
        rawText: text
      };
    }
    
    return null;
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0 border-b border-border/20 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-foreground mt-5 mb-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-foreground mt-4 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-foreground leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),
          // Enhanced Lists
          ul: ({ children }) => (
            <div className="space-y-2 mb-4">
              {children}
            </div>
          ),
          ol: ({ children }) => (
            <div className="space-y-2 mb-4">
              {children}
            </div>
          ),
          li: ({ children }) => {
            const nutritionData = parseNutritionItem(children);
            
            if (nutritionData) {
              return (
                <div className="bg-muted/30 rounded-lg p-3 border border-border/20">
                  <div className="font-medium text-foreground mb-2">
                    {nutritionData.foodName}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nutritionData.calories && (
                      <Badge variant="secondary" className="text-xs">
                        {nutritionData.calories} kcal
                      </Badge>
                    )}
                    {nutritionData.protein && (
                      <Badge variant="outline" className="text-xs">
                        {nutritionData.protein}g protein
                      </Badge>
                    )}
                    {nutritionData.carbs && (
                      <Badge variant="outline" className="text-xs">
                        {nutritionData.carbs}g carbs
                      </Badge>
                    )}
                    {nutritionData.fat && (
                      <Badge variant="outline" className="text-xs">
                        {nutritionData.fat}g fat
                      </Badge>
                    )}
                  </div>
                </div>
              );
            }
            
            // Regular list item
            return (
              <div className="flex items-start gap-2 text-foreground leading-relaxed py-1">
                <span className="text-muted-foreground mt-1.5 text-xs">•</span>
                <span className="flex-1">{children}</span>
              </div>
            );
          },
          // Strong/Bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">
              {children}
            </em>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm border border-border/20">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-primary underline hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/20 pl-4 py-2 bg-muted/20 rounded-r-lg italic text-muted-foreground mb-4">
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
