import { useState } from 'react';
import { toast } from 'sonner';
import type { ComponentType, ComponentConfig } from '@/types/dashboard-builder';
import { useDashboardStore } from '@/store/dashboardStore';

export interface ControlConfig {
  type: 'date_filter' | 'dropdown' | 'list' | 'input_box' | 'checkbox' | 'slider';
  label?: string;

  // Date Range Control
  defaultRange?: string;
  allowCustom?: boolean;
  dateFormat?: string;
  showPresets?: boolean;

  // Dropdown Control
  options?: string[];
  defaultSelection?: string;
  allowMultiSelect?: boolean;
  searchEnabled?: boolean;
  placeholder?: string;

  // List Control
  items?: string[];
  maxHeight?: number;
  allowSearch?: boolean;
  showCheckboxes?: boolean;

  // Input Box Control
  inputType?: 'text' | 'number' | 'email' | 'url';
  defaultValue?: string;
  validationPattern?: string;

  // Checkbox Control
  defaultChecked?: boolean;
  helpText?: string;

  // Slider Control
  minValue?: number;
  maxValue?: number;
  stepValue?: number;
  sliderDefaultValue?: number;
  showValueLabel?: boolean;
  unitLabel?: string;
}

type ContentType = 'text' | 'image' | 'rectangle' | 'circle' | 'line' | 'embed';

export const useInsertActions = () => {
  const [componentPickerOpen, setComponentPickerOpen] = useState(false);
  const [preSelectedType, setPreSelectedType] = useState<string | null>(null);

  // Control dialog state
  const [controlDialogState, setControlDialogState] = useState({
    open: false,
    controlType: 'date_filter' as string,
  });

  // Content dialog state
  const [contentDialogState, setContentDialogState] = useState<{
    open: boolean;
    contentType: ContentType | '';
  }>({
    open: false,
    contentType: '',
  });

  const { addComponent, config, addPage } = useDashboardStore();

  const onInsertChart = (type?: string) => {
    setPreSelectedType(type || null);
    setComponentPickerOpen(true);
    toast.info('Select a column to add chart');
  };

  const onInsertControl = (type: string) => {
    setControlDialogState({ open: true, controlType: type });
  };

  const onInsertContent = (type: string) => {
    const contentType = type as ContentType;
    setContentDialogState({
      open: true,
      contentType,
    });
  };

  const onInsertPage = () => {
    addPage();
    toast.success('New page added to dashboard');
  };

  const handleControlInsert = (controlConfig: ControlConfig) => {
    // Map control config to ComponentType
    const componentTypeMap: Record<string, ComponentType> = {
      date_filter: 'date_range_filter',
      dropdown: 'dropdown_filter',
      list: 'list_filter',
      input_box: 'input_box_filter',
      checkbox: 'checkbox_filter',
      slider: 'slider_filter',
    };

    const componentType = componentTypeMap[controlConfig.type];
    if (!componentType) {
      toast.error('Invalid control type');
      return;
    }

    // Find first empty column or create new row
    let targetColumnId: string | null = null;

    for (const row of config.rows) {
      for (const col of row.columns) {
        if (!col.component) {
          targetColumnId = col.id;
          break;
        }
      }
      if (targetColumnId) break;
    }

    if (targetColumnId) {
      addComponent(targetColumnId, componentType);
      toast.success(`${controlConfig.type.replace('_', ' ')} control added to dashboard`);
    } else if (config.rows.length > 0) {
      // Use first column of first row if no empty columns
      addComponent(config.rows[0].columns[0].id, componentType);
      toast.success(`${controlConfig.type.replace('_', ' ')} control added to dashboard`);
    } else {
      toast.error('Please add a row to the dashboard first');
    }

    // Close dialog
    setControlDialogState({ open: false, controlType: '' });
  };

  const handleContentInsert = (component: ComponentConfig) => {
    // Find first empty column or use first column of first row
    let targetColumnId: string | null = null;

    for (const row of config.rows) {
      for (const col of row.columns) {
        if (!col.component) {
          targetColumnId = col.id;
          break;
        }
      }
      if (targetColumnId) break;
    }

    if (targetColumnId) {
      addComponent(targetColumnId, component.type, component);
      toast.success(`${component.title || component.type} added successfully`);
    } else if (config.rows.length > 0) {
      // Use first column of first row if no empty columns
      const firstColumnId = config.rows[0].columns[0].id;
      addComponent(firstColumnId, component.type, component);
      toast.success(`${component.title || component.type} added successfully`);
    } else {
      toast.error('Please add a row to the dashboard first');
    }

    // Close dialog
    setContentDialogState({ open: false, contentType: '' });
  };

  const closeContentDialog = () => {
    setContentDialogState({ open: false, contentType: '' });
  };

  return {
    onInsertChart,
    onInsertControl,
    onInsertContent,
    onInsertPage,
    componentPickerOpen,
    setComponentPickerOpen,
    preSelectedType,
    controlDialogState,
    setControlDialogState,
    handleControlInsert,
    contentDialogState,
    setContentDialogState,
    handleContentInsert,
    closeContentDialog,
  };
};
