# Virtualized Table Component

The VirtualizedTable is a high-performance table component that uses virtualization to efficiently render large datasets (200K+ records).

## Overview

**File:** `src/components/VulnerabilityList/VirtualizedTable.tsx`

Uses React Window library to render only visible rows, maintaining 60fps scrolling performance regardless of dataset size.

## Key Features

### 1. Manual Sorting (No Auto-Sort)
- Initial state: No sorting (displays in original order)
- Click any column header to sort
- Toggle ascending/descending order
- Optimized sort algorithm (200-500ms for 236K records)

### 2. Virtual Scrolling
- Renders only ~20 visible rows
- Constant memory usage
- Smooth 60fps performance
- Automatic row height management

### 3. Column Headers
Sortable columns:
- Package Name
- Severity
- CVSS Score
- Version
- KAI Status
- Risk Factors Count
- Actions (Compare button)

### 4. Row Actions
- Click row → Open detail view
- Click compare icon → Add to comparison list
- Visual feedback for selected items

## Component Props

```typescript
interface VirtualizedTableProps {
  data: VulnerabilityData[];
  onRowClick?: (item: VulnerabilityData) => void;
  onAddToComparison?: (item: VulnerabilityData) => void;
  comparisonList?: VulnerabilityData[];
}
```

## Sorting Implementation

### Initial State
```typescript
// No automatic sorting - displays data as-is
const [sortField, setSortField] = useState<SortField | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
const [sortedData, setSortedData] = useState<VulnerabilityData[]>(data);
```

### Sort Logic
```typescript
useEffect(() => {
  if (!sortField) {
    setSortedData(data); // No sorting
    return;
  }

  // Prevent concurrent operations
  if (sortingRef.current) return;

  sortingRef.current = true;
  setIsSorting(true);

  setTimeout(() => {
    const sorted = sortVulnerabilities(data, sortField, sortDirection);
    setSortedData(sorted);
    setIsSorting(false);
    sortingRef.current = false;
  }, 0);
}, [data, sortField, sortDirection]);
```

### Performance Guards

**Concurrent Operation Protection:**
```typescript
const sortingRef = useRef(false);

if (sortingRef.current) {
  return; // Block new sorts while one is running
}
```

**Cleanup Function:**
```typescript
return () => {
  clearTimeout(timeoutId);
  sortingRef.current = false;
};
```

## Virtualization Setup

```typescript
<List
  height={listHeight}           // Dynamic based on window
  rowCount={sortedData.length}  // Total items
  rowHeight={56}                // Fixed row height
  rowComponent={Row}            // Row renderer
  rowProps={rowProps}           // Pass data to rows
  overscanCount={5}             // Pre-render buffer
/>
```

## Row Component

```typescript
const Row = ({ index, style, items, ...props }) => {
  const item = items[index];
  const isInComparison = comparisonList?.some(v => v.id === item.id);

  return (
    <StyledRow style={style} isEven={index % 2 === 0}>
      <Typography>{item.package}</Typography>
      <Chip label={item.severity} color={getSeverityColor(item.severity)} />
      <Typography>{item.cvss}</Typography>
      {/* ... other columns ... */}
      <IconButton onClick={handleCompareClick}>
        {isInComparison ? <CheckCircle /> : <CompareArrows />}
      </IconButton>
    </StyledRow>
  );
};
```

## Loading States

### Sorting Indicator
```typescript
<Backdrop open={isSorting}>
  <CircularProgress />
  <Typography>
    Sorting {data.length.toLocaleString()} records...
  </Typography>
</Backdrop>
```

## Performance Characteristics

| Operation | Time | Memory |
|-----------|------|--------|
| Initial Render | < 100ms | ~150MB |
| Scroll | 60fps | Constant |
| Sort (236K records) | 200-500ms | ~300MB peak |
| Row Click | Instant | Minimal |

## Usage Example

```typescript
<VirtualizedTable
  data={filteredData}
  onRowClick={handleRowClick}
  onAddToComparison={handleAddToComparison}
  comparisonList={comparisonList}
/>
```

## Best Practices

1. **Always use filtered data** - Pre-filter before passing to table
2. **Memoize rowProps** - Prevent unnecessary row re-renders
3. **Fixed row heights** - Required for virtual scrolling
4. **Debounce external filters** - Avoid thrashing during typing

## Related Components

- [Search Filter](search-filter.md) - Filters data before display
- [Detail View](dashboard.md#detail-view) - Shows full vulnerability details
- [Comparison View](comparison.md) - Side-by-side comparison

---

[← Dashboard](dashboard.md) | [Visualizations →](visualizations.md)
