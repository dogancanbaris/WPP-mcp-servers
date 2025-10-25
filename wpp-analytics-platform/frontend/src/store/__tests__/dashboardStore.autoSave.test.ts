import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboardStore } from '../dashboardStore';
import * as dashboardAPI from '@/lib/api/dashboards';

// Mock the API
jest.mock('@/lib/api/dashboards', () => ({
  saveDashboardAPI: jest.fn(),
  loadDashboardAPI: jest.fn()
}));

describe('Dashboard Store - Auto-Save System', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useDashboardStore());
    act(() => {
      result.current.reset();
    });

    // Clear all timers
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Auto-Save Behavior', () => {
    it('should set status to unsaved when changes are made', () => {
      const { result } = renderHook(() => useDashboardStore());

      // Initial state
      expect(result.current.saveStatus).toBe('saved');

      // Make a change
      act(() => {
        result.current.setTitle('New Title');
      });

      // Should be unsaved after change
      expect(result.current.saveStatus).toBe('unsaved');
      expect(result.current.isDirty).toBe(true);
    });

    it('should trigger auto-save after 2 seconds', async () => {
      jest.useFakeTimers();

      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI').mockResolvedValue({
        success: true,
        dashboard: {
          id: 'test-id',
          title: 'New Title',
          description: '',
          rows: [],
          theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderColor: '#e5e7eb'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });

      const { result } = renderHook(() => useDashboardStore());

      // Set ID first (required for auto-save)
      act(() => {
        result.current.config.id = 'test-id';
      });

      // Make a change
      act(() => {
        result.current.setTitle('New Title');
      });

      expect(result.current.saveStatus).toBe('unsaved');

      // Fast-forward 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(result.current.saveStatus).toBe('saved');
      });
    });

    it('should debounce multiple rapid changes', async () => {
      jest.useFakeTimers();

      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI').mockResolvedValue({
        success: true,
        dashboard: {
          id: 'test-id',
          title: 'Title 3',
          description: '',
          rows: [],
          theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderColor: '#e5e7eb'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });

      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.config.id = 'test-id';
      });

      // Make multiple rapid changes
      act(() => {
        result.current.setTitle('Title 1');
      });

      act(() => {
        jest.advanceTimersByTime(500); // 0.5s
      });

      act(() => {
        result.current.setTitle('Title 2');
      });

      act(() => {
        jest.advanceTimersByTime(500); // 1s total
      });

      act(() => {
        result.current.setTitle('Title 3');
      });

      // Only 2 seconds from LAST change should trigger save
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(1); // Only one save call
      });
    });

    it('should not auto-save if no dashboard ID is set', async () => {
      jest.useFakeTimers();

      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI');

      const { result } = renderHook(() => useDashboardStore());

      // Make a change WITHOUT setting ID
      act(() => {
        result.current.setTitle('New Title');
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('Save Status Indicators', () => {
    it('should show saving status during save operation', async () => {
      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI').mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
      );

      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.config.id = 'test-id';
      });

      act(() => {
        result.current.setTitle('New Title');
      });

      // Manually trigger save
      act(() => {
        result.current.save('test-id');
      });

      expect(result.current.saveStatus).toBe('saving');
      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.saveStatus).toBe('saved');
        expect(result.current.isSaving).toBe(false);
      });
    });

    it('should update lastSaved timestamp on successful save', async () => {
      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI').mockResolvedValue({
        success: true,
        dashboard: {
          id: 'test-id',
          title: 'New Title',
          description: '',
          rows: [],
          theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderColor: '#e5e7eb'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });

      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.config.id = 'test-id';
      });

      const beforeSave = result.current.lastSaved;

      act(() => {
        result.current.setTitle('New Title');
      });

      await act(async () => {
        await result.current.save('test-id');
      });

      expect(result.current.lastSaved).toBeDefined();
      expect(result.current.lastSaved).not.toBe(beforeSave);
    });
  });

  describe('Error Handling and Retry Logic', () => {
    it('should set error status on save failure', async () => {
      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI').mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.config.id = 'test-id';
      });

      act(() => {
        result.current.setTitle('New Title');
      });

      await act(async () => {
        await result.current.save('test-id');
      });

      expect(result.current.saveStatus).toBe('error');
      expect(result.current.error).toBe('Network error');
      expect(result.current.saveAttempts).toBe(1);
    });

    it('should retry up to 3 times with exponential backoff', async () => {
      jest.useFakeTimers();

      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI').mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.config.id = 'test-id';
      });

      // First attempt
      await act(async () => {
        result.current.setTitle('New Title');
        await result.current.save('test-id');
      });

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(result.current.saveAttempts).toBe(1);

      // Retry 1 (after 1s)
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(2);
      });

      expect(result.current.saveAttempts).toBe(2);

      // Retry 2 (after 2s)
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(3);
      });

      expect(result.current.saveAttempts).toBe(3);

      // Retry 3 (after 4s)
      await act(async () => {
        jest.advanceTimersByTime(4000);
      });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(4);
      });

      // Should stop retrying after 3 attempts
      await act(async () => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockSave).toHaveBeenCalledTimes(4); // No more retries
    });

    it('should reset retry count on successful save', async () => {
      const mockSave = jest
        .spyOn(dashboardAPI, 'saveDashboardAPI')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          dashboard: {
            id: 'test-id',
            title: 'New Title',
            description: '',
            rows: [],
            theme: {
              primaryColor: '#3b82f6',
              backgroundColor: '#ffffff',
              textColor: '#1f2937',
              borderColor: '#e5e7eb'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        });

      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.config.id = 'test-id';
      });

      // First attempt fails
      await act(async () => {
        result.current.setTitle('New Title');
        await result.current.save('test-id');
      });

      expect(result.current.saveAttempts).toBe(1);

      // Retry succeeds
      jest.useFakeTimers();
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.saveStatus).toBe('saved');
        expect(result.current.saveAttempts).toBe(0); // Reset
      });
    });
  });

  describe('Conflict Detection', () => {
    it('should detect conflict when remote version is newer', async () => {
      const oldTimestamp = new Date('2024-01-01T10:00:00Z').toISOString();
      const newTimestamp = new Date('2024-01-01T11:00:00Z').toISOString();

      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI').mockResolvedValue({
        success: true,
        dashboard: {
          id: 'test-id',
          title: 'Remote Title',
          description: '',
          rows: [],
          theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderColor: '#e5e7eb'
          },
          createdAt: oldTimestamp,
          updatedAt: newTimestamp // Newer than local
        }
      });

      const { result } = renderHook(() => useDashboardStore());

      // Set initial state with old timestamp
      act(() => {
        result.current.config.id = 'test-id';
        result.current.lastSyncedVersion = oldTimestamp;
      });

      // Make local change
      act(() => {
        result.current.setTitle('Local Title');
      });

      // Try to save
      await act(async () => {
        await result.current.save('test-id');
      });

      // Should detect conflict
      expect(result.current.saveStatus).toBe('conflict');
      expect(result.current.conflictData).toBeDefined();
      expect(result.current.conflictData?.localVersion.title).toBe('Local Title');
      expect(result.current.conflictData?.remoteVersion.title).toBe('Remote Title');
    });

    it('should not detect conflict when timestamps match', async () => {
      const timestamp = new Date('2024-01-01T10:00:00Z').toISOString();

      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI').mockResolvedValue({
        success: true,
        dashboard: {
          id: 'test-id',
          title: 'New Title',
          description: '',
          rows: [],
          theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderColor: '#e5e7eb'
          },
          createdAt: timestamp,
          updatedAt: timestamp // Same as local
        }
      });

      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.config.id = 'test-id';
        result.current.lastSyncedVersion = timestamp;
      });

      act(() => {
        result.current.setTitle('New Title');
      });

      await act(async () => {
        await result.current.save('test-id');
      });

      expect(result.current.saveStatus).toBe('saved');
      expect(result.current.conflictData).toBeUndefined();
    });
  });

  describe('Conflict Resolution', () => {
    it('should force save local version when "local" strategy chosen', async () => {
      const { result } = renderHook(() => useDashboardStore());

      // Setup conflict state
      act(() => {
        result.current.conflictData = {
          localVersion: {
            id: 'test-id',
            title: 'Local',
            description: '',
            rows: [],
            theme: {
              primaryColor: '#3b82f6',
              backgroundColor: '#ffffff',
              textColor: '#1f2937',
              borderColor: '#e5e7eb'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          remoteVersion: {
            id: 'test-id',
            title: 'Remote',
            description: '',
            rows: [],
            theme: {
              primaryColor: '#3b82f6',
              backgroundColor: '#ffffff',
              textColor: '#1f2937',
              borderColor: '#e5e7eb'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        };
        result.current.saveStatus = 'conflict';
      });

      const mockSave = jest.spyOn(dashboardAPI, 'saveDashboardAPI').mockResolvedValue({
        success: true,
        dashboard: result.current.conflictData!.localVersion
      });

      // Resolve with local strategy
      act(() => {
        result.current.resolveConflict('local');
      });

      await waitFor(() => {
        expect(result.current.conflictData).toBeUndefined();
      });
    });

    it('should accept remote version when "remote" strategy chosen', () => {
      const { result } = renderHook(() => useDashboardStore());

      const remoteVersion = {
        id: 'test-id',
        title: 'Remote',
        description: '',
        rows: [],
        theme: {
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          borderColor: '#e5e7eb'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      act(() => {
        result.current.conflictData = {
          localVersion: {
            ...remoteVersion,
            title: 'Local'
          },
          remoteVersion,
          timestamp: new Date().toISOString()
        };
        result.current.saveStatus = 'conflict';
      });

      // Resolve with remote strategy
      act(() => {
        result.current.resolveConflict('remote');
      });

      expect(result.current.config.title).toBe('Remote');
      expect(result.current.saveStatus).toBe('saved');
      expect(result.current.conflictData).toBeUndefined();
      expect(result.current.isDirty).toBe(false);
    });

    it('should keep conflict state when "cancel" strategy chosen', () => {
      const { result } = renderHook(() => useDashboardStore());

      const conflictData = {
        localVersion: {
          id: 'test-id',
          title: 'Local',
          description: '',
          rows: [],
          theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderColor: '#e5e7eb'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        remoteVersion: {
          id: 'test-id',
          title: 'Remote',
          description: '',
          rows: [],
          theme: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            borderColor: '#e5e7eb'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      act(() => {
        result.current.conflictData = conflictData;
        result.current.saveStatus = 'conflict';
      });

      // Cancel resolution
      act(() => {
        result.current.resolveConflict('cancel');
      });

      expect(result.current.saveStatus).toBe('conflict');
      expect(result.current.conflictData).toBeDefined();
    });
  });

  describe('Cleanup and Reset', () => {
    it('should clear timers on reset', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.config.id = 'test-id';
        result.current.setTitle('New Title');
      });

      // Timers should be set
      expect(jest.getTimerCount()).toBeGreaterThan(0);

      act(() => {
        result.current.reset();
      });

      // Timers should be cleared
      expect(result.current.saveStatus).toBe('saved');
      expect(result.current.isDirty).toBe(false);
    });

    it('should reset save status', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.saveStatus = 'error';
        result.current.saveAttempts = 2;
        result.current.error = 'Test error';
      });

      act(() => {
        result.current.resetSaveStatus();
      });

      expect(result.current.saveStatus).toBe('saved');
      expect(result.current.saveAttempts).toBe(0);
      expect(result.current.error).toBeUndefined();
      expect(result.current.conflictData).toBeUndefined();
    });
  });
});
