import { useState } from 'react';
import { toast } from 'sonner';

export const useInsertActions = () => {
  const [componentPickerOpen, setComponentPickerOpen] = useState(false);
  const [preSelectedType, setPreSelectedType] = useState<string | null>(null);

  const onInsertChart = (type?: string) => {
    setPreSelectedType(type || null);
    setComponentPickerOpen(true);
    toast.info('Select a column to add chart');
  };

  const onInsertControl = (type: string) => {
    toast.info(`Control components coming soon (${type})`);
  };

  const onInsertContent = (type: string) => {
    toast.info(`Content components coming soon (${type})`);
  };

  return {
    onInsertChart,
    onInsertControl,
    onInsertContent,
    componentPickerOpen,
    setComponentPickerOpen,
    preSelectedType,
  };
};
