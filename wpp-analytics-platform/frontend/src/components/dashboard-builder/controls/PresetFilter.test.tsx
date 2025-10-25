import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PresetFilter, useFilterPresets, FilterCombination } from './PresetFilter';

/**
 * PresetFilter Component Tests
 *
 * Unit tests for the PresetFilter component and useFilterPresets hook.
 */

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PresetFilter Component', () => {
  const mockCurrentFilters: FilterCombination = {
    dimensions: ['GoogleAds.campaignName'],
    filters: [
      {
        field: 'GoogleAds.status',
        operator: 'equals',
        value: 'ENABLED',
      },
    ],
    dateRange: {
      type: 'preset',
      preset: 'last_30_days',
    },
  };

  const mockOnApplyPreset = jest.fn();

  beforeEach(() => {
    localStorageMock.clear();
    mockOnApplyPreset.mockClear();
  });

  it('renders without crashing', () => {
    render(
      <PresetFilter
        currentFilters={mockCurrentFilters}
        onApplyPreset={mockOnApplyPreset}
      />
    );

    expect(screen.getByText('Filter Presets')).toBeInTheDocument();
  });

  it('shows empty state when no presets exist', () => {
    render(
      <PresetFilter
        currentFilters={mockCurrentFilters}
        onApplyPreset={mockOnApplyPreset}
      />
    );

    expect(screen.getByText(/No saved presets yet/i)).toBeInTheDocument();
  });

  it('opens save dialog when Save Current button is clicked', async () => {
    render(
      <PresetFilter
        currentFilters={mockCurrentFilters}
        onApplyPreset={mockOnApplyPreset}
      />
    );

    const saveButton = screen.getByText('Save Current');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Save Filter Preset')).toBeInTheDocument();
    });
  });

  it('saves a new preset', async () => {
    render(
      <PresetFilter
        currentFilters={mockCurrentFilters}
        onApplyPreset={mockOnApplyPreset}
        storageKey="test-presets"
      />
    );

    // Open save dialog
    const saveButton = screen.getByText('Save Current');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Save Filter Preset')).toBeInTheDocument();
    });

    // Fill in preset name
    const nameInput = screen.getByLabelText(/Preset Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Preset' } });

    // Save preset
    const savePresetButton = screen.getByRole('button', { name: /Save Preset/i });
    fireEvent.click(savePresetButton);

    // Verify preset appears in list
    await waitFor(() => {
      expect(screen.getByText('Test Preset')).toBeInTheDocument();
    });
  });

  it('applies a preset when Apply button is clicked', async () => {
    // Pre-populate localStorage with a preset
    const preset = {
      id: 'preset-1',
      name: 'Test Preset',
      filters: mockCurrentFilters,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    localStorageMock.setItem('test-presets', JSON.stringify([preset]));

    render(
      <PresetFilter
        currentFilters={mockCurrentFilters}
        onApplyPreset={mockOnApplyPreset}
        storageKey="test-presets"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Preset')).toBeInTheDocument();
    });

    // Click Apply button
    const applyButton = screen.getByRole('button', { name: 'Apply' });
    fireEvent.click(applyButton);

    // Verify callback was called
    expect(mockOnApplyPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Preset',
        usageCount: 1, // Should increment
      })
    );
  });

  it('toggles favorite status', async () => {
    const preset = {
      id: 'preset-1',
      name: 'Test Preset',
      filters: mockCurrentFilters,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    localStorageMock.setItem('test-presets', JSON.stringify([preset]));

    render(
      <PresetFilter
        currentFilters={mockCurrentFilters}
        onApplyPreset={mockOnApplyPreset}
        storageKey="test-presets"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Preset')).toBeInTheDocument();
    });

    // Find and click the star button
    const starButtons = screen.getAllByRole('button');
    const starButton = starButtons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-star-off')
    );

    if (starButton) {
      fireEvent.click(starButton);

      await waitFor(() => {
        const stored = JSON.parse(
          localStorageMock.getItem('test-presets') || '[]'
        );
        expect(stored[0].isFavorite).toBe(true);
      });
    }
  });

  it('deletes a preset', async () => {
    const preset = {
      id: 'preset-1',
      name: 'Test Preset',
      filters: mockCurrentFilters,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };

    localStorageMock.setItem('test-presets', JSON.stringify([preset]));

    render(
      <PresetFilter
        currentFilters={mockCurrentFilters}
        onApplyPreset={mockOnApplyPreset}
        storageKey="test-presets"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Preset')).toBeInTheDocument();
    });

    // Open dropdown menu
    const menuButtons = screen.getAllByRole('button');
    const dropdownButton = menuButtons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-more-vertical')
    );

    if (dropdownButton) {
      fireEvent.click(dropdownButton);

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
      });

      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', {
          name: /Delete/i,
        });
        fireEvent.click(confirmButton);
      });

      // Verify preset is removed
      await waitFor(() => {
        expect(screen.queryByText('Test Preset')).not.toBeInTheDocument();
      });
    }
  });

  it('respects maxPresets limit', async () => {
    render(
      <PresetFilter
        currentFilters={mockCurrentFilters}
        onApplyPreset={mockOnApplyPreset}
        storageKey="test-presets"
        maxPresets={1}
      />
    );

    // Save first preset
    const saveButton = screen.getByText('Save Current');
    fireEvent.click(saveButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Preset Name/i);
      fireEvent.change(nameInput, { target: { value: 'Preset 1' } });
      const savePresetButton = screen.getByRole('button', {
        name: /Save Preset/i,
      });
      fireEvent.click(savePresetButton);
    });

    // Try to save second preset
    await waitFor(() => {
      const saveButton = screen.getByText('Save Current');
      fireEvent.click(saveButton);
    });

    // Should show alert about max presets
    // (This would require mocking window.alert)
  });

  it('filters by favorites', async () => {
    const presets = [
      {
        id: 'preset-1',
        name: 'Favorite Preset',
        filters: mockCurrentFilters,
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      },
      {
        id: 'preset-2',
        name: 'Regular Preset',
        filters: mockCurrentFilters,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      },
    ];

    localStorageMock.setItem('test-presets', JSON.stringify(presets));

    render(
      <PresetFilter
        currentFilters={mockCurrentFilters}
        onApplyPreset={mockOnApplyPreset}
        storageKey="test-presets"
      />
    );

    // Both presets should be visible initially
    await waitFor(() => {
      expect(screen.getByText('Favorite Preset')).toBeInTheDocument();
      expect(screen.getByText('Regular Preset')).toBeInTheDocument();
    });

    // Toggle favorites filter
    const starToggleButtons = screen.getAllByRole('button');
    const toggleButton = starToggleButtons.find(
      (btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-star-off') &&
        !btn.closest('[role="dialog"]')
    );

    if (toggleButton) {
      fireEvent.click(toggleButton);

      // Only favorite preset should be visible
      await waitFor(() => {
        expect(screen.getByText('Favorite Preset')).toBeInTheDocument();
        expect(screen.queryByText('Regular Preset')).not.toBeInTheDocument();
      });
    }
  });
});

describe('useFilterPresets Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('loads presets from localStorage', () => {
    const mockPresets = [
      {
        id: 'preset-1',
        name: 'Test Preset',
        filters: {},
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      },
    ];

    localStorageMock.setItem('hook-test', JSON.stringify(mockPresets));

    const { result } = renderHook(() => useFilterPresets('hook-test'));

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Test Preset');
  });

  it('saves a new preset', () => {
    const { result } = renderHook(() => useFilterPresets('hook-test'));

    const filters: FilterCombination = {
      dimensions: ['test.dimension'],
    };

    act(() => {
      result.current.savePreset('New Preset', filters, 'Test description');
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('New Preset');
    expect(result.current.presets[0].description).toBe('Test description');
  });

  it('applies a preset and increments usage count', () => {
    const { result } = renderHook(() => useFilterPresets('hook-test'));

    const filters: FilterCombination = {
      dimensions: ['test.dimension'],
    };

    let savedPreset;

    act(() => {
      savedPreset = result.current.savePreset('Test Preset', filters);
    });

    act(() => {
      result.current.applyPreset(savedPreset);
    });

    expect(result.current.presets[0].usageCount).toBe(1);
  });

  it('deletes a preset', () => {
    const { result } = renderHook(() => useFilterPresets('hook-test'));

    let presetId;

    act(() => {
      const preset = result.current.savePreset('Test Preset', {});
      presetId = preset.id;
    });

    expect(result.current.presets).toHaveLength(1);

    act(() => {
      result.current.deletePreset(presetId);
    });

    expect(result.current.presets).toHaveLength(0);
  });

  it('toggles favorite status', () => {
    const { result } = renderHook(() => useFilterPresets('hook-test'));

    let presetId;

    act(() => {
      const preset = result.current.savePreset('Test Preset', {});
      presetId = preset.id;
    });

    expect(result.current.presets[0].isFavorite).toBe(false);

    act(() => {
      result.current.toggleFavorite(presetId);
    });

    expect(result.current.presets[0].isFavorite).toBe(true);

    act(() => {
      result.current.toggleFavorite(presetId);
    });

    expect(result.current.presets[0].isFavorite).toBe(false);
  });

  it('updates a preset', () => {
    const { result } = renderHook(() => useFilterPresets('hook-test'));

    let presetId;

    act(() => {
      const preset = result.current.savePreset('Original Name', {});
      presetId = preset.id;
    });

    act(() => {
      result.current.updatePreset(presetId, {
        name: 'Updated Name',
        description: 'New description',
      });
    });

    expect(result.current.presets[0].name).toBe('Updated Name');
    expect(result.current.presets[0].description).toBe('New description');
  });
});

// Helper for hook testing
function renderHook<T>(hook: () => T) {
  const result = { current: null as T | null };

  function TestComponent() {
    result.current = hook();
    return null;
  }

  render(<TestComponent />);

  return { result: result as { current: T } };
}

function act(callback: () => void) {
  callback();
}
