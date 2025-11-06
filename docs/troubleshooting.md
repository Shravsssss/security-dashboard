# Troubleshooting Guide

Common issues and their solutions for the Security Vulnerability Dashboard.

## Loading Issues

### Slow Initial Load (> 5 seconds)

**Symptoms:**
- Loading spinner for extended time
- "Loading vulnerability data..." message stuck

**Causes:**
- Large dataset (> 500K records)
- Slow network connection
- Server response delays

**Solutions:**
```typescript
// 1. Check data size
console.log('Records:', data.length);

// 2. Enable metrics timing
console.time('load');
await loadVulnerabilityData();
console.timeEnd('load');

// 3. Reduce initial load
// Load in chunks or paginate server-side
```

### Page Crashes on Load

**Symptoms:**
- "Out of memory" error
- Browser tab becomes unresponsive
- White screen / blank page

**Causes:**
- Dataset too large (> 1M records)
- Insufficient RAM
- Memory leaks

**Solutions:**
1. **Increase Node memory** (for build):
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

2. **Check for memory leaks:**
   - Open Chrome DevTools → Memory tab
   - Take heap snapshot
   - Look for detached DOM nodes

3. **Reduce dataset:**
   - Filter server-side
   - Implement pagination
   - Load on demand

## Sorting Issues

### Sorting Freezes the Page

**Symptoms:**
- Click column header
- Page becomes unresponsive
- Browser shows "Page Unresponsive" dialog

**Current Status:** ✅ FIXED

**Previous Cause:**
- Synchronous sort of 236K records
- `localeCompare()` being called millions of times

**Solution Applied:**
```typescript
// Fast string comparison
const aStr = aVal.toLowerCase();
const bStr = bVal.toLowerCase();
if (aStr < bStr) return direction === 'asc' ? -1 : 1;
if (aStr > bStr) return direction === 'asc' ? 1 : -1;
return 0;
```

### Infinite Sorting Loop

**Symptoms:**
- Sort never completes
- "Sorting..." indicator stuck
- CPU usage at 100%

**Current Status:** ✅ FIXED

**Previous Cause:**
- No concurrent operation guard
- Multiple setTimeout calls queuing up

**Solution Applied:**
```typescript
const sortingRef = useRef(false);

if (sortingRef.current) return;  // Guard
sortingRef.current = true;
// ... sort ...
sortingRef.current = false;
```

### Auto-Sort on Tab Load

**Symptoms:**
- Vulnerability List tab auto-sorts by severity
- User wants unsorted data initially

**Current Status:** ✅ FIXED

**Solution:**
```typescript
// Changed from:
const [sortField, setSortField] = useState('severity');

// To:
const [sortField, setSortField] = useState(null);
```

## Filter/Search Issues

### Search Not Responding

**Symptoms:**
- Typing in search box has no effect
- Results don't update

**Solutions:**
1. **Check debounce delay:**
   ```typescript
   // Reduce if too slow
   const debouncedSearch = debounce(search, 300); // Try 150ms
   ```

2. **Verify filter state:**
   ```typescript
   console.log('Filters:', filters);
   console.log('Filtered data:', filteredData.length);
   ```

3. **Clear browser cache:**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

### Filters Not Working

**Symptoms:**
- Select severity filter
- Table doesn't update

**Solutions:**
```typescript
// Check filter implementation
const filteredData = useMemo(() => {
  console.log('Filtering with:', filters);
  return filterVulnerabilities(data, filters);
}, [data, filters]);  // Ensure dependencies are correct
```

## Visualization Issues

### Charts Not Rendering

**Symptoms:**
- Blank space where chart should be
- Console errors about Recharts

**Solutions:**
1. **Check data format:**
   ```typescript
   // Recharts expects array of objects
   console.log('Chart data:', chartData);
   ```

2. **Verify dimensions:**
   ```typescript
   <ResponsiveContainer width="100%" height={400}>
     <PieChart>
       {/* ... */}
     </PieChart>
   </ResponsiveContainer>
   ```

3. **Check for NaN values:**
   ```typescript
   const validData = data.filter(d => !isNaN(d.value));
   ```

### Network Graph Too Large

**Symptoms:**
- Can't see package names
- Graph nodes overlap

**Solution:**
```typescript
// Limit nodes in DependencyNetworkGraph
<DependencyNetworkGraph
  data={data}
  maxNodes={25}  // Reduce from 50
/>
```

## Build Issues

### Build Fails with TypeScript Errors

**Symptoms:**
```
TS2339: Property 'X' does not exist on type 'Y'
```

**Solutions:**
1. **Clean and rebuild:**
   ```bash
   rm -rf node_modules
   npm cache clean --force
   npm install
   npm run build
   ```

2. **Check TypeScript version:**
   ```bash
   npm list typescript
   ```

3. **Verify types:**
   ```typescript
   // Add explicit types
   const data: VulnerabilityData[] = [];
   ```

### Out of Memory During Build

**Symptoms:**
```
FATAL ERROR: Reached heap limit
```

**Solution:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## Runtime Errors

### "Data cannot be cloned, out of memory"

**Symptoms:**
- Error when using Web Workers
- postMessage fails

**Current Status:** ✅ FIXED (Web Worker removed)

**Previous Cause:**
- Web Worker trying to clone 236K records
- Exceeds structured clone size limit

**Solution:**
- Removed Web Worker
- Using synchronous sort with guards

### React Hydration Errors

**Symptoms:**
```
Warning: Expected server HTML to contain...
```

**Solutions:**
1. **Fix DOM nesting:**
   ```typescript
   // DON'T: <p><div></div></p>
   // DO: <div><div></div></div>
   ```

2. **Add suppressHydrationWarning:**
   ```typescript
   <div suppressHydrationWarning>
     {dynamicContent}
   </div>
   ```

## Performance Issues

### Slow Scrolling

**Symptoms:**
- Laggy scroll in Vulnerability List
- Frame drops

**Solutions:**
1. **Verify virtual scrolling:**
   ```typescript
   console.log('Rows rendered:', visibleRows);  // Should be ~20
   ```

2. **Reduce overscan:**
   ```typescript
   <List overscanCount={3} />  // Reduce from 5
   ```

3. **Check row memoization:**
   ```typescript
   const Row = React.memo(RowComponent);
   ```

### High Memory Usage

**Symptoms:**
- Browser using > 1GB RAM
- Tab crashes

**Solutions:**
1. **Check for memory leaks:**
   - DevTools → Memory → Take snapshot
   - Look for growing arrays/objects

2. **Cleanup effects:**
   ```typescript
   useEffect(() => {
     const listener = () => {};
     window.addEventListener('resize', listener);

     return () => {
       window.removeEventListener('resize', listener);  // Cleanup!
     };
   }, []);
   ```

3. **Limit cached data:**
   ```typescript
   useQuery({
     queryKey: ['data'],
     queryFn: loadData,
     gcTime: 5 * 60 * 1000,  // 5 minutes instead of Infinity
   });
   ```

## Browser-Specific Issues

### Safari: Charts Not Interactive

**Solution:**
```css
/* Add to chart container */
-webkit-transform: translate3d(0,0,0);
```

### Firefox: Slow Rendering

**Solution:**
```css
/* Disable smooth scrolling */
scroll-behavior: auto;
```

### Edge: CORS Errors

**Solution:**
```typescript
// Add CORS headers to API
headers: {
  'Access-Control-Allow-Origin': '*'
}
```

## Getting Help

If your issue isn't listed here:

1. **Check console:** Open DevTools → Console
2. **Search issues:** [GitHub Issues](https://github.com/[username]/Dashboard/issues)
3. **Create issue:** Provide:
   - Error message
   - Browser/version
   - Dataset size
   - Steps to reproduce

---

[← Performance](performance.md) | [Contributing →](contributing.md)
