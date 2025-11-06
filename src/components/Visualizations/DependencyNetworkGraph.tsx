import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Fullscreen as FullscreenIcon, Close as CloseIcon } from '@mui/icons-material';
import * as d3 from 'd3';
import { VulnerabilityData } from '../../types/vulnerability.types';
import { getSeverityColorHex } from '../../utils/severityUtils';
import { SEVERITY_ORDER } from '../../constants/severity';

interface DependencyNetworkGraphProps {
  data: VulnerabilityData[];
  maxNodes?: number;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  count: number;
  severity: string;
  type: 'group' | 'package';
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
}

/**
 * Dependency Network Graph - Visualizes package dependencies using D3 force layout
 * Shows relationships between groups and packages with vulnerability counts
 */
export const DependencyNetworkGraph: React.FC<DependencyNetworkGraphProps> = ({
  data,
  maxNodes = 50,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const fullscreenSvgRef = useRef<SVGSVGElement>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Process data to create graph structure
  const graphData = useMemo(() => {
    if (!data || data.length === 0) return { nodes: [], links: [] };

    // Filter by severity if selected
    const filteredData = selectedSeverity === 'all'
      ? data
      : data.filter(d => d.severity.toLowerCase() === selectedSeverity);

    // Aggregate data by package and group
    const packageMap = new Map<string, { count: number; maxSeverity: string; group?: string }>();
    const groupMap = new Map<string, { count: number; maxSeverity: string }>();

    filteredData.forEach((vuln) => {
      // Aggregate packages
      const pkg = vuln.package;
      if (!packageMap.has(pkg)) {
        packageMap.set(pkg, { count: 0, maxSeverity: vuln.severity, group: vuln.groupName });
      }
      const pkgData = packageMap.get(pkg)!;
      pkgData.count++;

      // Update max severity
      const currentWeight = SEVERITY_ORDER[pkgData.maxSeverity.toLowerCase()] || 0;
      const newWeight = SEVERITY_ORDER[vuln.severity.toLowerCase()] || 0;
      if (newWeight > currentWeight) {
        pkgData.maxSeverity = vuln.severity;
      }

      // Aggregate groups
      if (vuln.groupName) {
        if (!groupMap.has(vuln.groupName)) {
          groupMap.set(vuln.groupName, { count: 0, maxSeverity: vuln.severity });
        }
        const grpData = groupMap.get(vuln.groupName)!;
        grpData.count++;

        const currentGrpWeight = SEVERITY_ORDER[grpData.maxSeverity.toLowerCase()] || 0;
        if (newWeight > currentGrpWeight) {
          grpData.maxSeverity = vuln.severity;
        }
      }
    });

    // Sort packages by count and limit to top N
    const topPackages = Array.from(packageMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, maxNodes);

    // Create nodes
    const nodes: GraphNode[] = [];
    const nodeIds = new Set<string>();

    // Add group nodes
    topPackages.forEach(([pkg, pkgData]) => {
      if (pkgData.group && !nodeIds.has(pkgData.group)) {
        const grpData = groupMap.get(pkgData.group);
        if (grpData) {
          nodes.push({
            id: pkgData.group,
            label: pkgData.group,
            count: grpData.count,
            severity: grpData.maxSeverity,
            type: 'group',
          });
          nodeIds.add(pkgData.group);
        }
      }
    });

    // Add package nodes
    topPackages.forEach(([pkg, pkgData]) => {
      nodes.push({
        id: pkg,
        label: pkg,
        count: pkgData.count,
        severity: pkgData.maxSeverity,
        type: 'package',
      });
      nodeIds.add(pkg);
    });

    // Create links
    const links: GraphLink[] = [];
    topPackages.forEach(([pkg, pkgData]) => {
      if (pkgData.group && nodeIds.has(pkgData.group)) {
        links.push({
          source: pkgData.group,
          target: pkg,
          value: pkgData.count,
        });
      }
    });

    return { nodes, links };
  }, [data, maxNodes, selectedSeverity]);

  // Render D3 graph function (reusable for both normal and fullscreen)
  const renderGraph = useCallback((
    svgElement: SVGSVGElement,
    width: number,
    height: number
  ) => {
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove(); // Clear previous render

    // Create simulation
    const simulation = d3
      .forceSimulation<GraphNode>(graphData.nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(graphData.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => Math.sqrt(d.count) * 5 + 10));

    // Create container group
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Draw links
    const link = g
      .append('g')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    // Draw nodes
    const node = g
      .append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('r', (d) => Math.sqrt(d.count) * 3 + 5)
      .attr('fill', (d) => getSeverityColorHex(d.severity))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any
      );

    // Add labels
    const label = g
      .append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .join('text')
      .text((d) => d.label.length > 25 ? d.label.substring(0, 25) + '...' : d.label)
      .attr('font-size', 12)
      .attr('dx', 12)
      .attr('dy', 4)
      .style('pointer-events', 'none');

    // Add tooltips
    node.append('title').text((d) => `${d.label}\nVulnerabilities: ${d.count}\nSeverity: ${d.severity}`);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);

      label.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  // D3 visualization for normal view
  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;
    const cleanup = renderGraph(svgRef.current, 600, 450);
    return cleanup;
  }, [graphData, renderGraph]);

  // D3 visualization for fullscreen view
  useEffect(() => {
    if (!fullscreenSvgRef.current || !isFullscreen || graphData.nodes.length === 0) return;
    const width = window.innerWidth - 100;
    const height = window.innerHeight - 200;
    const cleanup = renderGraph(fullscreenSvgRef.current, width, height);
    return cleanup;
  }, [graphData, isFullscreen, renderGraph]);

  if (!data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dependency Network
        </Typography>
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            No data available for visualization
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Package Dependency Network
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Interactive graph showing relationships between packages and groups
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter Severity</InputLabel>
            <Select
              value={selectedSeverity}
              label="Filter Severity"
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <IconButton
            onClick={() => setIsFullscreen(true)}
            color="primary"
            title="View in fullscreen"
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <FullscreenIcon />
          </IconButton>
        </Box>
      </Box>

      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
        <Chip label={`${graphData.nodes.length} nodes`} size="small" />
        <Chip label={`${graphData.links.length} connections`} size="small" />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          Drag nodes to rearrange • Zoom with scroll
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: 450,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <svg ref={svgRef} width="100%" height="100%" />
      </Box>

      {/* Legend */}
      <Box mt={2} display="flex" gap={2} flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          Node size = vulnerability count
        </Typography>
        <Box display="flex" gap={1}>
          <Box width={12} height={12} bgcolor={getSeverityColorHex('Critical')} borderRadius="50%" />
          <Typography variant="caption">Critical</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Box width={12} height={12} bgcolor={getSeverityColorHex('High')} borderRadius="50%" />
          <Typography variant="caption">High</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Box width={12} height={12} bgcolor={getSeverityColorHex('Medium')} borderRadius="50%" />
          <Typography variant="caption">Medium</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Box width={12} height={12} bgcolor={getSeverityColorHex('Low')} borderRadius="50%" />
          <Typography variant="caption">Low</Typography>
        </Box>
      </Box>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        sx={{ zIndex: 1400 }}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Package Dependency Network - Fullscreen View
            </Typography>

            <FormControl size="small" sx={{ minWidth: 150, mr: 2, backgroundColor: 'white', borderRadius: 1 }}>
              <InputLabel>Filter Severity</InputLabel>
              <Select
                value={selectedSeverity}
                label="Filter Severity"
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setIsFullscreen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            p: 3,
            backgroundColor: 'background.default',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            <Chip label={`${graphData.nodes.length} nodes`} size="small" />
            <Chip label={`${graphData.links.length} connections`} size="small" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              Drag nodes to rearrange • Zoom with scroll
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              backgroundColor: 'background.paper',
            }}
          >
            <svg ref={fullscreenSvgRef} width="100%" height="100%" />
          </Box>

          {/* Legend */}
          <Box mt={2} display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            <Typography variant="caption" color="text.secondary">
              Node size = vulnerability count
            </Typography>
            <Box display="flex" gap={1}>
              <Box width={12} height={12} bgcolor={getSeverityColorHex('Critical')} borderRadius="50%" />
              <Typography variant="caption">Critical</Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Box width={12} height={12} bgcolor={getSeverityColorHex('High')} borderRadius="50%" />
              <Typography variant="caption">High</Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Box width={12} height={12} bgcolor={getSeverityColorHex('Medium')} borderRadius="50%" />
              <Typography variant="caption">Medium</Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Box width={12} height={12} bgcolor={getSeverityColorHex('Low')} borderRadius="50%" />
              <Typography variant="caption">Low</Typography>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Paper>
  );
};

export default React.memo(DependencyNetworkGraph);
