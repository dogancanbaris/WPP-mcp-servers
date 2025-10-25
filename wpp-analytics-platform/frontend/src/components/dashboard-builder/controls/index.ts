/**
 * Dashboard Controls Index
 *
 * Centralized export for all dashboard control components.
 * These controls provide interactive filtering and configuration
 * for dashboard-wide data queries.
 */

export {
  DateRangeFilter,
  toCubeTimeDimension,
  toCubeTimeDimensionWithComparison,
  type DateRange,
  type DateRangeComparison,
  type DateRangeFilterValue,
  type CubeTimeDimension,
} from './DateRangeFilter';

export {
  CheckboxFilter,
  CheckboxFilterGroup,
  checkboxToCubeFilter,
  useCheckboxFilters,
  type CheckboxFilterProps,
  type CheckboxFilterGroupProps,
} from './CheckboxFilter';

export {
  DimensionControl,
  type DimensionControlProps,
} from './DimensionControl';

export {
  SliderFilter,
  type SliderFilterProps,
} from './SliderFilter';

export {
  PresetFilter,
  useFilterPresets,
  type PresetFilterProps,
  type FilterPreset,
  type FilterCombination,
} from './PresetFilter';

export {
  DataSourceControl,
  DataSourceControlExample,
  commonDataSources,
  createDataSource,
  type DataSourceControlProps,
  type DataSourceOption,
  type DataSourceType,
} from './DataSourceControl';

export {
  DropdownFilter,
  useDashboardFilters,
  type DropdownFilterProps,
} from './DropdownFilter';

export {
  AdvancedFilter,
  type AdvancedFilterProps,
  type FilterGroup,
  type FilterCondition,
  type FilterOperator,
  type FilterDataType,
  type LogicalOperator,
} from './AdvancedFilter';

export {
  validateFilterGroup,
  validateCondition,
  countConditions,
  countGroups,
  getMaxDepth,
  cloneFilterGroup,
  findCondition,
  findGroup,
  removeEmptyGroups,
  flattenConditions,
  filterToString,
  conditionToString,
  serializeFilter,
  deserializeFilter,
  compressFilter,
  decompressFilter,
  getUsedFields,
  isFilterEmpty,
  simplifyFilter,
  convertFilterToMongoDB,
  getFilterSummary,
} from './AdvancedFilter.utils';

// Future controls:
// export { MetricSelector } from './MetricSelector';
// export { SegmentPicker } from './SegmentPicker';
// export { GranularityControl } from './GranularityControl';
