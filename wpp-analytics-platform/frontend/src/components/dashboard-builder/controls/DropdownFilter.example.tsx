"use client"

import * as React from "react"
import { DropdownFilter, useDashboardFilters } from "./DropdownFilter"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * DropdownFilter Usage Examples
 *
 * This file demonstrates various use cases for the DropdownFilter component
 * with Cube.js integration.
 */

/**
 * Example 1: Single-Select Filter (Simple)
 *
 * Basic single-select dropdown without search functionality.
 * Best for dimensions with fewer than 20 values.
 */
export function Example1_SingleSelectSimple() {
  const [status, setStatus] = React.useState<string | null>(null)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Single-Select Filter (Simple)</h3>

      <DropdownFilter
        id="order-status"
        label="Order Status"
        dimension="Orders.status"
        mode="single"
        enableSearch={false}
        value={status || undefined}
        onChange={(value) => setStatus(value as string | null)}
        placeholder="Select status"
      />

      <div className="mt-4 text-sm text-muted-foreground">
        Selected: {status || "None"}
      </div>
    </Card>
  )
}

/**
 * Example 2: Single-Select with Search
 *
 * Single-select dropdown with search functionality.
 * Best for dimensions with 20-1000 values (e.g., campaign names).
 */
export function Example2_SingleSelectWithSearch() {
  const [campaign, setCampaign] = React.useState<string | null>(null)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Single-Select with Search</h3>

      <DropdownFilter
        id="campaign-name"
        label="Campaign Name"
        dimension="GoogleAds.campaignName"
        mode="single"
        enableSearch={true}
        value={campaign || undefined}
        onChange={(value) => setCampaign(value as string | null)}
        placeholder="Search campaigns..."
        limit={500}
      />

      <div className="mt-4 text-sm text-muted-foreground">
        Selected: {campaign || "None"}
      </div>
    </Card>
  )
}

/**
 * Example 3: Multi-Select Filter
 *
 * Multi-select dropdown with checkboxes.
 * Users can select multiple values which are displayed as badges.
 */
export function Example3_MultiSelect() {
  const [countries, setCountries] = React.useState<string[]>([])

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Multi-Select Filter</h3>

      <DropdownFilter
        id="countries"
        label="Countries"
        dimension="Orders.country"
        mode="multi"
        enableSearch={true}
        value={countries}
        onChange={(value) => setCountries((value as string[]) || [])}
        placeholder="Select countries..."
        showCount={true}
      />

      <div className="mt-4 text-sm text-muted-foreground">
        Selected: {countries.length} countries
      </div>
    </Card>
  )
}

/**
 * Example 4: Global Dashboard Filters
 *
 * Multiple filters that apply to all charts in the dashboard.
 * Demonstrates the useDashboardFilters hook.
 */
export function Example4_GlobalFilters() {
  const { filters, addFilter, removeFilter, clearFilters } = useDashboardFilters()

  const handleCampaignChange = (value: string | string[] | null) => {
    if (value) {
      addFilter({
        member: "GoogleAds.campaignName",
        operator: "equals",
        values: [value as string]
      })
    } else {
      removeFilter("GoogleAds.campaignName")
    }
  }

  const handleDeviceChange = (value: string | string[] | null) => {
    if (value && Array.isArray(value) && value.length > 0) {
      addFilter({
        member: "GoogleAds.device",
        operator: "in",
        values: value
      })
    } else {
      removeFilter("GoogleAds.device")
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Global Dashboard Filters</h3>
        {filters.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear All ({filters.length})
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Campaign Filter */}
        <DropdownFilter
          id="campaign-filter"
          label="Campaign"
          dimension="GoogleAds.campaignName"
          mode="single"
          enableSearch={true}
          onChange={handleCampaignChange}
          placeholder="Filter by campaign..."
        />

        {/* Device Filter */}
        <DropdownFilter
          id="device-filter"
          label="Device"
          dimension="GoogleAds.device"
          mode="multi"
          enableSearch={false}
          onChange={handleDeviceChange}
          placeholder="Filter by device..."
        />

        {/* Active Filters Display */}
        {filters.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-md">
            <p className="text-sm font-medium mb-2">Active Filters:</p>
            <div className="space-y-2">
              {filters.map((filter) => (
                <div key={filter.member} className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{filter.member}</Badge>
                  <span className="text-muted-foreground">{filter.operator}</span>
                  <Badge>{filter.values.join(", ")}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

/**
 * Example 5: Filtered Dimension Values
 *
 * Fetch dimension values with pre-filters applied.
 * Useful for cascading filters (e.g., show campaigns only for selected account).
 */
export function Example5_PreFilters() {
  const [account, setAccount] = React.useState<string | null>(null)
  const [campaign, setCampaign] = React.useState<string | null>(null)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Cascading Filters</h3>

      <div className="space-y-4">
        {/* Account Filter */}
        <DropdownFilter
          id="account-cascading"
          label="Account"
          dimension="GoogleAds.accountName"
          mode="single"
          enableSearch={true}
          value={account || undefined}
          onChange={(value) => {
            setAccount(value as string | null)
            setCampaign(null) // Reset campaign when account changes
          }}
          placeholder="Select account first..."
        />

        {/* Campaign Filter (filtered by selected account) */}
        <DropdownFilter
          id="campaign-cascading"
          label="Campaign"
          dimension="GoogleAds.campaignName"
          mode="single"
          enableSearch={true}
          value={campaign || undefined}
          onChange={(value) => setCampaign(value as string | null)}
          placeholder={account ? "Select campaign..." : "Select account first"}
          preFilters={account ? [{
            member: "GoogleAds.accountName",
            operator: "equals",
            values: [account]
          }] : undefined}
        />

        <div className="mt-4 text-sm text-muted-foreground">
          Account: {account || "None"}<br />
          Campaign: {campaign || "None"}
        </div>
      </div>
    </Card>
  )
}

/**
 * Example 6: Custom Rendering
 *
 * Custom rendering for trigger and items.
 * Useful for displaying additional context or formatting.
 */
export function Example6_CustomRendering() {
  const [campaigns, setCampaigns] = React.useState<string[]>([])

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Custom Rendering</h3>

      <DropdownFilter
        id="custom-render"
        label="Top Campaigns"
        dimension="GoogleAds.campaignName"
        mode="multi"
        enableSearch={true}
        value={campaigns}
        onChange={(value) => setCampaigns((value as string[]) || [])}
        placeholder="Select campaigns..."
        limit={100}
        // Custom trigger rendering
        renderTrigger={(selected) => {
          if (selected.length === 0) {
            return <span className="text-muted-foreground">No campaigns selected</span>
          }
          return (
            <div className="flex items-center gap-2">
              <Badge variant="default">{selected.length}</Badge>
              <span>campaigns selected</span>
            </div>
          )
        }}
        // Custom item rendering
        renderItem={(value) => (
          <div className="flex items-center justify-between w-full">
            <span className="font-medium">{value}</span>
            <Badge variant="outline" className="text-xs">Campaign</Badge>
          </div>
        )}
      />
    </Card>
  )
}

/**
 * Example 7: Search Console Filters
 *
 * Real-world example for Google Search Console data.
 */
export function Example7_SearchConsoleFilters() {
  const { filters, addFilter, removeFilter } = useDashboardFilters()

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Search Console Filters</h3>

      <div className="space-y-4">
        {/* Country Filter */}
        <DropdownFilter
          id="gsc-country"
          label="Country"
          dimension="SearchConsole.country"
          mode="multi"
          enableSearch={true}
          onChange={(value) => {
            if (value && Array.isArray(value) && value.length > 0) {
              addFilter({
                member: "SearchConsole.country",
                operator: "in",
                values: value
              })
            } else {
              removeFilter("SearchConsole.country")
            }
          }}
          placeholder="Filter by country..."
        />

        {/* Device Filter */}
        <DropdownFilter
          id="gsc-device"
          label="Device Type"
          dimension="SearchConsole.device"
          mode="multi"
          enableSearch={false}
          onChange={(value) => {
            if (value && Array.isArray(value) && value.length > 0) {
              addFilter({
                member: "SearchConsole.device",
                operator: "in",
                values: value
              })
            } else {
              removeFilter("SearchConsole.device")
            }
          }}
          placeholder="All devices"
        />

        {/* Search Type Filter */}
        <DropdownFilter
          id="gsc-search-type"
          label="Search Type"
          dimension="SearchConsole.searchType"
          mode="single"
          enableSearch={false}
          onChange={(value) => {
            if (value) {
              addFilter({
                member: "SearchConsole.searchType",
                operator: "equals",
                values: [value as string]
              })
            } else {
              removeFilter("SearchConsole.searchType")
            }
          }}
          placeholder="All search types"
        />
      </div>
    </Card>
  )
}

/**
 * Example 8: Complete Dashboard with Filters
 *
 * Full example showing filters applied to multiple charts.
 */
export function Example8_CompleteDashboard() {
  const { filters, addFilter, removeFilter, clearFilters } = useDashboardFilters()

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Dashboard Filters</h3>
          {filters.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DropdownFilter
            id="campaign-dash"
            label="Campaign"
            dimension="GoogleAds.campaignName"
            mode="single"
            enableSearch={true}
            onChange={(value) => {
              if (value) {
                addFilter({
                  member: "GoogleAds.campaignName",
                  operator: "equals",
                  values: [value as string]
                })
              } else {
                removeFilter("GoogleAds.campaignName")
              }
            }}
          />

          <DropdownFilter
            id="device-dash"
            label="Device"
            dimension="GoogleAds.device"
            mode="multi"
            onChange={(value) => {
              if (value && Array.isArray(value) && value.length > 0) {
                addFilter({
                  member: "GoogleAds.device",
                  operator: "in",
                  values: value
                })
              } else {
                removeFilter("GoogleAds.device")
              }
            }}
          />

          <DropdownFilter
            id="network-dash"
            label="Network"
            dimension="GoogleAds.network"
            mode="multi"
            onChange={(value) => {
              if (value && Array.isArray(value) && value.length > 0) {
                addFilter({
                  member: "GoogleAds.network",
                  operator: "in",
                  values: value
                })
              } else {
                removeFilter("GoogleAds.network")
              }
            }}
          />
        </div>

        {/* Active Filters Badge */}
        {filters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Badge key={filter.member} variant="secondary">
                {filter.member.split('.')[1]}: {filter.values.join(", ")}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Charts would go here - they would use the filters state */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Charts</h3>
        <p className="text-sm text-muted-foreground">
          Charts here would receive the filters array and apply them to their Cube.js queries.
        </p>
        <pre className="mt-4 p-4 bg-muted/50 rounded-md text-xs overflow-auto">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </Card>
    </div>
  )
}

export default {
  Example1_SingleSelectSimple,
  Example2_SingleSelectWithSearch,
  Example3_MultiSelect,
  Example4_GlobalFilters,
  Example5_PreFilters,
  Example6_CustomRendering,
  Example7_SearchConsoleFilters,
  Example8_CompleteDashboard
}
