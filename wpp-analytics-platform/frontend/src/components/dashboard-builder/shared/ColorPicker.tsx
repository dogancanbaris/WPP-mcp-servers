"use client"

import * as React from "react"
import { HexColorPicker } from "react-colorful"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface ColorPickerProps {
  label: string
  value: string // Hex color like "#1A73E8"
  onChange: (color: string) => void
  showAlpha?: boolean
  presets?: string[]
  className?: string
}

const DEFAULT_PRESETS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#1A73E8", "#EA4335", "#FBBC04", "#34A853", "#8E44AD", "#E67E22", "#95A5A6", "#34495E",
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#6366F1",
]

/**
 * ColorPicker Component
 *
 * A professional color picker with:
 * - Color swatch button
 * - Hex code input
 * - Color picker popover (react-colorful)
 * - Recent colors history
 * - Preset color palette
 *
 * Used throughout Setup and Style tabs for consistent color selection.
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  showAlpha = false,
  presets = DEFAULT_PRESETS,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [recentColors, setRecentColors] = React.useState<string[]>([])
  const pickerRef = React.useRef<HTMLDivElement>(null)

  // Close popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleChange = (newColor: string) => {
    onChange(newColor)
  }

  const handleColorComplete = (newColor: string) => {
    // Add to recent colors when user finishes selecting
    setRecentColors((prev) => {
      const updated = [newColor, ...prev.filter((c) => c !== newColor)]
      return updated.slice(0, 8) // Keep last 8
    })
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Allow # and valid hex characters
    if (/^#[0-9A-Fa-f]{0,6}$/.test(inputValue) || inputValue === "") {
      handleChange(inputValue)
    }
  }

  const handleHexInputBlur = () => {
    // Validate and format hex on blur
    let hexValue = value.trim()
    if (!hexValue.startsWith("#")) {
      hexValue = "#" + hexValue
    }
    // Ensure it's a valid 6-digit hex
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      handleColorComplete(hexValue)
    } else if (/^#[0-9A-Fa-f]{3}$/.test(hexValue)) {
      // Convert 3-digit to 6-digit hex
      const expanded = "#" + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2] + hexValue[3] + hexValue[3]
      handleChange(expanded)
      handleColorComplete(expanded)
    }
  }

  const selectColor = (color: string) => {
    handleChange(color)
    handleColorComplete(color)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>

      <div className="flex gap-2 items-center">
        {/* Color swatch button */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            className={cn(
              "w-10 h-10 rounded-md border-2 border-input transition-all",
              "hover:border-ring hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isOpen && "ring-2 ring-ring ring-offset-2"
            )}
            style={{ backgroundColor: value }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open color picker"
          />

          {/* Color picker popover */}
          {isOpen && (
            <div
              className={cn(
                "absolute z-50 mt-2 rounded-lg border border-border bg-popover shadow-lg",
                "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
                "p-3 space-y-3"
              )}
              style={{ minWidth: "240px" }}
            >
              {/* react-colorful picker */}
              <div className="w-full">
                <HexColorPicker
                  color={value}
                  onChange={handleChange}
                  style={{ width: "100%", height: "150px" }}
                />
              </div>

              {/* Hex input */}
              <div>
                <Input
                  value={value}
                  onChange={handleHexInputChange}
                  onBlur={handleHexInputBlur}
                  placeholder="#1A73E8"
                  className="font-mono text-sm uppercase"
                  maxLength={7}
                />
              </div>

              {/* Recent colors */}
              {recentColors.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2 font-medium">Recent</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {recentColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-7 h-7 rounded border border-input transition-all",
                          "hover:border-ring hover:scale-110",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => selectColor(color)}
                        aria-label={`Select color ${color}`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Preset palette */}
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-medium">Presets</div>
                <div className="grid grid-cols-8 gap-1.5">
                  {presets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-7 h-7 rounded border border-input transition-all",
                        "hover:border-ring hover:scale-110",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => selectColor(color)}
                      aria-label={`Select preset color ${color}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hex code input (external) */}
        <Input
          value={value}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          placeholder="#1A73E8"
          className="flex-1 font-mono text-sm uppercase"
          maxLength={7}
        />
      </div>
    </div>
  )
}

// Export with display name for debugging
ColorPicker.displayName = "ColorPicker"
