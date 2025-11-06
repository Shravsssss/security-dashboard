import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { VulnerabilityData } from '../../types/vulnerability.types';
import { SEVERITY_WEIGHTS } from '../../constants/severity';

interface RiskScoringDashboardProps {
  data: VulnerabilityData[];
}

interface PackageRisk {
  package: string;
  riskScore: number;
  vulnerabilityCount: number;
  criticalCount: number;
  highCount: number;
  avgCvss: number;
  riskFactorCount: number;
}

const calculateRiskScore = (vuln: VulnerabilityData): number => {
  const severityScore = SEVERITY_WEIGHTS[vuln.severity.toLowerCase() as keyof typeof SEVERITY_WEIGHTS] || 1;
  const cvssScore = vuln.cvss || 5; // Default to 5 if no CVSS
  const riskFactorMultiplier = Math.min((vuln.riskFactors?.length || 0) * 0.2 + 1, 2);

  return severityScore * cvssScore * riskFactorMultiplier;
};

const getRiskLevel = (score: number): { level: string; color: string } => {
  if (score >= 80) return { level: 'Critical', color: '#d32f2f' };
  if (score >= 60) return { level: 'High', color: '#f57c00' };
  if (score >= 40) return { level: 'Medium', color: '#ffa726' };
  if (score >= 20) return { level: 'Low', color: '#66bb6a' };
  return { level: 'Minimal', color: '#9e9e9e' };
};

/**
 * Risk Scoring Dashboard - Provides comprehensive risk analysis with prioritization
 */
export const RiskScoringDashboard: React.FC<RiskScoringDashboardProps> = ({ data }) => {
  const riskAnalysis = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Calculate overall organization risk score
    const totalRiskScore = data.reduce((sum, vuln) => sum + calculateRiskScore(vuln), 0);
    const avgRiskScore = totalRiskScore / data.length;
    const orgRiskScore = Math.min((avgRiskScore / 100) * 100, 100); // Normalize to 0-100

    // Calculate package-level risks
    const packageRiskMap = new Map<string, PackageRisk>();

    data.forEach((vuln) => {
      const pkg = vuln.package;
      if (!packageRiskMap.has(pkg)) {
        packageRiskMap.set(pkg, {
          package: pkg,
          riskScore: 0,
          vulnerabilityCount: 0,
          criticalCount: 0,
          highCount: 0,
          avgCvss: 0,
          riskFactorCount: 0,
        });
      }

      const pkgRisk = packageRiskMap.get(pkg)!;
      pkgRisk.riskScore += calculateRiskScore(vuln);
      pkgRisk.vulnerabilityCount++;
      if (vuln.severity.toLowerCase() === 'critical') pkgRisk.criticalCount++;
      if (vuln.severity.toLowerCase() === 'high') pkgRisk.highCount++;
      pkgRisk.avgCvss += vuln.cvss || 5;
      pkgRisk.riskFactorCount += vuln.riskFactors?.length || 0;
    });

    // Calculate averages and sort
    const topRiskyPackages = Array.from(packageRiskMap.values())
      .map((pkg) => ({
        ...pkg,
        avgCvss: pkg.avgCvss / pkg.vulnerabilityCount,
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    // Risk distribution
    const riskDistribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      minimal: 0,
    };

    Array.from(packageRiskMap.values()).forEach((pkg) => {
      const { level } = getRiskLevel(pkg.riskScore);
      const key = level.toLowerCase() as keyof typeof riskDistribution;
      if (key in riskDistribution) {
        riskDistribution[key]++;
      }
    });

    return {
      orgRiskScore,
      topRiskyPackages,
      riskDistribution,
      totalPackages: packageRiskMap.size,
    };
  }, [data]);

  if (!riskAnalysis || !data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Risk Scoring Dashboard
        </Typography>
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            No data available for risk analysis
          </Typography>
        </Box>
      </Paper>
    );
  }

  const { level: orgLevel, color: orgColor } = getRiskLevel(riskAnalysis.orgRiskScore);

  const riskDistData = [
    { name: 'Critical', value: riskAnalysis.riskDistribution.critical, color: '#d32f2f' },
    { name: 'High', value: riskAnalysis.riskDistribution.high, color: '#f57c00' },
    { name: 'Medium', value: riskAnalysis.riskDistribution.medium, color: '#ffa726' },
    { name: 'Low', value: riskAnalysis.riskDistribution.low, color: '#66bb6a' },
    { name: 'Minimal', value: riskAnalysis.riskDistribution.minimal, color: '#9e9e9e' },
  ].filter((d) => d.value > 0);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Risk Scoring & Prioritization Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Composite risk assessment based on severity, CVSS scores, and risk factors
      </Typography>

      <Grid container spacing={3}>
        {/* Organization Risk Score Gauge */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Overall Risk Score
              </Typography>
              <Box display="flex" alignItems="center" gap={2} my={2}>
                <Typography variant="h2" fontWeight="bold" color={orgColor}>
                  {Math.round(riskAnalysis.orgRiskScore)}
                </Typography>
                <Box flexGrow={1}>
                  <Chip label={orgLevel} sx={{ bgcolor: orgColor, color: 'white' }} size="small" />
                  <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                    Out of 100
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={riskAnalysis.orgRiskScore}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: orgColor,
                  },
                }}
              />
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Based on {data.length.toLocaleString()} vulnerabilities across{' '}
                  {riskAnalysis.totalPackages} packages
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Distribution Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Package Risk Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={riskDistData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    labelLine={false}
                  >
                    {riskDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Quick Stats
              </Typography>
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {riskAnalysis.topRiskyPackages[0]?.package.substring(0, 15)}...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Highest risk package
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {riskAnalysis.topRiskyPackages.filter((p) => p.criticalCount > 0).length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Packages with critical vulnerabilities
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top 10 Risky Packages */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Top 10 Highest Risk Packages
              </Typography>
              <List dense>
                {riskAnalysis.topRiskyPackages.map((pkg, index) => {
                  const { color } = getRiskLevel(pkg.riskScore);
                  return (
                    <ListItem
                      key={pkg.package}
                      sx={{
                        borderLeft: `4px solid ${color}`,
                        mb: 1,
                        backgroundColor: 'action.hover',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight="bold">
                              #{index + 1}
                            </Typography>
                            <Typography variant="body2" noWrap>
                              {pkg.package}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                            <Chip
                              label={`Score: ${Math.round(pkg.riskScore)}`}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <Chip
                              label={`${pkg.vulnerabilityCount} vulns`}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            {pkg.criticalCount > 0 && (
                              <Chip
                                label={`${pkg.criticalCount} critical`}
                                size="small"
                                color="error"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Score Breakdown Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Risk Score Breakdown (Top 10)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={riskAnalysis.topRiskyPackages}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="package"
                    tick={{ fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="riskScore" fill="#f57c00" name="Risk Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(RiskScoringDashboard);
