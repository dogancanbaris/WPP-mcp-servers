import { useDashboardStore } from '@/store/dashboardStore';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useViewActions = () => {
  const { zoom, setZoom } = useDashboardStore();
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const onZoomIn = () => {
    const newZoom = Math.min(zoom + 25, 200);
    setZoom(newZoom);
    toast.success(`Zoom: ${newZoom}%`);
  };

  const onZoomOut = () => {
    const newZoom = Math.max(zoom - 25, 50);
    setZoom(newZoom);
    toast.success(`Zoom: ${newZoom}%`);
  };

  const onZoomFit = () => {
    setZoom(100);
    toast.success('Zoom: Fit');
  };

  const onZoomTo = (level: number) => {
    setZoom(level);
    toast.success(`Zoom: ${level}%`);
  };

  const onToggleGrid = () => {
    setShowGrid(!showGrid);
    toast.success(showGrid ? 'Grid hidden' : 'Grid shown');
  };

  const onToggleRulers = () => {
    setShowRulers(!showRulers);
    toast.success(showRulers ? 'Rulers hidden' : 'Rulers shown');
  };

  const onToggleGuides = () => {
    setShowGuides(!showGuides);
    toast.success(showGuides ? 'Guides hidden' : 'Guides shown');
  };

  const onFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        toast.success('Fullscreen mode');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        toast.success('Exited fullscreen');
      }
    } catch (error) {
      toast.error('Fullscreen not supported');
    }
  };

  return {
    onZoomIn,
    onZoomOut,
    onZoomFit,
    onZoomTo,
    onToggleGrid,
    onToggleRulers,
    onToggleGuides,
    onFullscreen,
    showGrid,
    showRulers,
    showGuides,
    isFullscreen,
    zoom,
  };
};
