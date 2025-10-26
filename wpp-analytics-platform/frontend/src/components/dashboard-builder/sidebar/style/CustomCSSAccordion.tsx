import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Code2, AlertCircle, Copy, Check } from 'lucide-react';

interface CustomCSSAccordionProps {
  customCSS?: string;
  onUpdate: (css: string) => void;
}

/**
 * CustomCSSAccordion - Advanced CSS Customization
 *
 * Allows practitioners and agents to write custom CSS
 * to override component styles with full control.
 *
 * Features:
 * - CSS syntax highlighting hints
 * - Common CSS snippets
 * - Validation hints
 * - Copy/reset buttons
 *
 * Agent MCP: Full CSS string support for programmatic styling
 */
export const CustomCSSAccordion: React.FC<CustomCSSAccordionProps> = ({
  customCSS = '',
  onUpdate,
}) => {
  const [css, setCSS] = useState(customCSS);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCSS('');
    onUpdate('');
  };

  const applyCSS = () => {
    onUpdate(css);
  };

  const addSnippet = (snippet: string) => {
    setCSS(prev => prev ? prev + '\n\n' + snippet : snippet);
  };

  return (
    <AccordionItem value="custom-css">
      <AccordionTrigger className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span className="text-sm font-medium">Custom CSS</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 space-y-4">
        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900 ml-2">
            Write custom CSS to override component styles. CSS is scoped to this component only.
          </AlertDescription>
        </Alert>

        {/* CSS Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold">CSS Code</label>
          <Textarea
            value={css}
            onChange={(e) => setCSS(e.target.value)}
            placeholder={`/* Example: Override title styles */
.component-title {
  font-size: 20px;
  color: #191d63;
  font-weight: 700;
}

/* Example: Add gradient background */
.component-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}`}
            className="font-mono text-xs min-h-[200px] p-3 border-2"
          />
        </div>

        {/* Quick Snippets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold">Quick Snippets</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSnippet(`.component-container {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}`)}
              className="text-xs h-8 text-left"
            >
              Add Shadow
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => addSnippet(`.component-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`)}
              className="text-xs h-8 text-left"
            >
              Add Gradient
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => addSnippet(`.component-container {
  border-radius: 12px;
  overflow: hidden;
}`)}
              className="text-xs h-8 text-left"
            >
              Round Corners
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => addSnippet(`.component-container {
  opacity: 0.9;
  transition: all 300ms ease-in-out;
}
.component-container:hover {
  opacity: 1;
  transform: translateY(-2px);
}`)}
              className="text-xs h-8 text-left"
            >
              Add Hover Effect
            </Button>
          </div>
        </div>

        {/* CSS Classes Reference */}
        <div className="space-y-2 p-3 bg-muted/50 rounded border text-xs">
          <h4 className="font-semibold text-xs">Available CSS Classes:</h4>
          <code className="block text-xs font-mono space-y-1 whitespace-pre-wrap">
            {`.component-container     /* Main wrapper */
.component-title         /* Title element */
.component-content       /* Content area */
.component-header        /* Header area */
.component-footer        /* Footer area */
.chart-wrapper           /* Chart container */
.table-wrapper           /* Table container */`}
          </code>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={applyCSS}
            className="flex-1 text-xs h-8 bg-primary text-primary-foreground"
          >
            Apply CSS
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="text-xs h-8"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="text-xs h-8"
          >
            Reset
          </Button>
        </div>

        {/* Validation Tips */}
        {css && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-900 ml-2">
              <strong>Tip:</strong> Use browser DevTools to inspect element classes before writing CSS.
            </AlertDescription>
          </Alert>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
