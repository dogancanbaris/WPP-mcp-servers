import React from 'react';

export const NoSetupPanel: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="text-sm text-muted-foreground bg-muted/40 border border-dashed border-muted-foreground/30 p-4 rounded-md">
      {message || 'This component does not have configurable setup options.'}
    </div>
  );
};
