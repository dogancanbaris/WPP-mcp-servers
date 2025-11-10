import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const ControlSetupPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This is a filter/control component. Configure its behavior from the component toolbar on the canvas
          or by editing its properties in the agent workflow. Control components inherit page filters automatically.
        </AlertDescription>
      </Alert>
      <p className="text-xs text-muted-foreground">
        Advanced control options (linking, cross-filtering, presets) will be available once MCP tools are enabled for
        this component.
      </p>
    </div>
  );
};
