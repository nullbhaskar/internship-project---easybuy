import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ADMIN_THEME, REPLICA_THEME } from './ReplicaTheme';

const { width } = Dimensions.get('window');

export interface AdminLineChartProps {
  revenueData?: number[];
  timeFilter?: 'Monthly' | 'Weekly' | 'Today';
}

// ─── 1. REVENUE LINE CHART (Connected Line & Real Revenue Sync) ───
export const AdminLineChart: React.FC<AdminLineChartProps> = ({
  revenueData = [0, 0, 0, 0, 0, 0, 0],
  timeFilter = 'Weekly',
}) => {
  const xLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const maxVal = Math.max(...revenueData, 100);

  // Generate 5 Y-axis ticks e.g. 100, 75, 50, 25, 0 or maxVal scaled
  const yTicks = [
    Math.round(maxVal),
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ];

  const formatTick = (val: number) => {
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000)   return `${(val / 1000).toFixed(1)}K`;
    return `${val}`;
  };

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBody}>
        {/* Y Axis Labels */}
        <View style={styles.yAxis}>
          {yTicks.map((lbl, idx) => (
            <Text key={idx} style={styles.yAxisText}>{formatTick(lbl)}</Text>
          ))}
        </View>

        {/* Chart Canvas Area with Horizontal Grid Lines */}
        <View style={styles.canvasArea}>
          <View style={styles.gridContainer}>
            {yTicks.map((_, idx) => (
              <View key={idx} style={styles.gridLine} />
            ))}
          </View>

          {/* Connected Data Points & Vertical Bars */}
          <View style={styles.columnsContainer}>
            {xLabels.map((day, idx) => {
              const val = revenueData[idx] || 0;
              const pct = maxVal > 0 ? Math.min(92, Math.max(8, (val / maxVal) * 85 + 8)) : 8;
              const hasRev = val > 0;

              return (
                <View key={idx} style={styles.chartCol}>
                  <View style={styles.colLineTrack}>
                    {/* Vertical connecting accent bar */}
                    <View
                      style={[
                        styles.revenueBarTrack,
                        {
                          height: `${pct}%`,
                          backgroundColor: hasRev ? 'rgba(236, 72, 153, 0.15)' : 'rgba(241, 245, 249, 0.6)',
                        },
                      ]}
                    />

                    {/* Glowing Data Point Dot */}
                    <View
                      style={[
                        styles.pinkDot,
                        { bottom: `${pct}%` },
                        hasRev && styles.pinkDotActive,
                      ]}
                    >
                      {/* Active tooltip badge on non-zero revenue */}
                      {hasRev && (
                        <View style={styles.revTooltip}>
                          <Text style={styles.revTooltipTxt}>₹{val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* X Axis Labels */}
      <View style={styles.xAxis}>
        <View style={{ width: 32 }} />
        <View style={styles.xAxisRow}>
          {xLabels.map((day, idx) => (
            <Text key={idx} style={styles.xAxisText}>{day}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export interface AdminAreaChartProps {
  ordersData?: number[];
}

// ─── 2. ANALYTICS AREA CHART (Real Orders Volume Sync & Filled Mountain Wave) ───
export const AdminAreaChart: React.FC<AdminAreaChartProps> = ({
  ordersData = [0, 0, 0, 0, 0, 0, 0],
}) => {
  const xLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const maxVal = Math.max(...ordersData, 5);

  const yTicks = [
    Math.round(maxVal),
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ];

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBody}>
        {/* Y Axis */}
        <View style={styles.yAxis}>
          {yTicks.map((lbl, idx) => (
            <Text key={idx} style={styles.yAxisText}>{lbl}</Text>
          ))}
        </View>

        {/* Canvas Area */}
        <View style={styles.canvasArea}>
          <View style={styles.gridContainer}>
            {yTicks.map((_, idx) => (
              <View key={idx} style={styles.gridLine} />
            ))}
          </View>

          {/* Dual Area Wave Columns */}
          <View style={styles.columnsContainer}>
            {xLabels.map((_, idx) => {
              const val = ordersData[idx] || 0;
              const pct = maxVal > 0 ? Math.min(92, Math.max(10, (val / maxVal) * 85 + 10)) : 10;
              const hasOrders = val > 0;

              return (
                <View key={idx} style={styles.areaCol}>
                  {/* Light Grey Back Wave */}
                  <View
                    style={[
                      styles.greyAreaBar,
                      { height: `${Math.min(95, pct + 15)}%` },
                    ]}
                  />
                  {/* Dark Black Front Wave */}
                  <View
                    style={[
                      styles.blackAreaBar,
                      { height: `${pct}%` },
                      hasOrders && { backgroundColor: ADMIN_THEME.textDark },
                    ]}
                  >
                    {hasOrders && (
                      <View style={styles.areaTooltip}>
                        <Text style={styles.areaTooltipTxt}>{val}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* X Axis */}
      <View style={styles.xAxis}>
        <View style={{ width: 32 }} />
        <View style={styles.xAxisRow}>
          {xLabels.map((day, idx) => (
            <Text key={idx} style={styles.xAxisText}>{day}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export interface OrderDateGroup {
  label: string;
  black: number;
  pink: number;
}

export interface AdminBarChartProps {
  datesData?: OrderDateGroup[];
}

// ─── 3. ORDERS BAR CHART (Dual Vertical Grouped Bars: Black & Pink) ───
export const AdminBarChart: React.FC<AdminBarChartProps> = ({
  datesData = [
    { label: 'Aug 14', black: 0, pink: 0 },
    { label: 'Aug 15', black: 0, pink: 0 },
    { label: 'Aug 16', black: 0, pink: 0 },
    { label: 'Aug 17', black: 0, pink: 0 },
  ],
}) => {
  const allValues = datesData.flatMap(d => [d.black, d.pink]);
  const maxVal = Math.max(...allValues, 5);

  const yTicks = [
    Math.round(maxVal),
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ];

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBody}>
        {/* Y Axis */}
        <View style={styles.yAxis}>
          {yTicks.map((lbl, idx) => (
            <Text key={idx} style={styles.yAxisText}>{lbl}</Text>
          ))}
        </View>

        {/* Canvas Area */}
        <View style={styles.canvasArea}>
          <View style={styles.gridContainer}>
            {yTicks.map((_, idx) => (
              <View key={idx} style={styles.gridLine} />
            ))}
          </View>

          {/* Grouped Bars */}
          <View style={styles.barGroupContainer}>
            {datesData.map((item, idx) => {
              const bPct = maxVal > 0 ? Math.min(100, Math.max(5, (item.black / maxVal) * 100)) : 5;
              const pPct = maxVal > 0 ? Math.min(100, Math.max(5, (item.pink / maxVal) * 100)) : 5;

              return (
                <View key={idx} style={styles.barPairWrap}>
                  <View style={styles.barTrack}>
                    <View style={[styles.blackBar, { height: `${bPct}%` }]} />
                    <View style={[styles.pinkBar, { height: `${pPct}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* X Axis */}
      <View style={styles.xAxis}>
        <View style={{ width: 32 }} />
        <View style={styles.barXAxisRow}>
          {datesData.map((item, idx) => (
            <Text key={idx} style={styles.barXAxisText}>{item.label}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 8,
  },
  chartBody: {
    flexDirection: 'row',
    height: 155,
  },
  yAxis: {
    width: 24,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  yAxisText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'right',
  },
  canvasArea: {
    flex: 1,
    marginLeft: 8,
    position: 'relative',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  columnsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  colLineTrack: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  revenueBarTrack: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    borderRadius: 3,
    alignSelf: 'center',
  },
  pinkDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: REPLICA_THEME.accentPink,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignSelf: 'center',
    marginBottom: -4,
  },
  pinkDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: -6,
    shadowColor: REPLICA_THEME.accentPink,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  revTooltip: {
    position: 'absolute',
    top: -22,
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  revTooltipTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  areaTooltip: {
    position: 'absolute',
    top: -18,
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  areaTooltipTxt: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  waveOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  pinkWaveCurve: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(244, 114, 182, 0.4)',
    borderRadius: 4,
  },
  blackWaveCurve: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 4,
  },
  areaCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 2,
    position: 'relative',
  },
  greyAreaBar: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 0,
  },
  blackAreaBar: {
    width: '75%',
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'absolute',
    bottom: 0,
  },
  barGroupContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barPairWrap: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barTrack: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: '100%',
  },
  blackBar: {
    width: 14,
    backgroundColor: '#0F172A',
    borderRadius: 3,
  },
  pinkBar: {
    width: 14,
    backgroundColor: '#F472B6',
    borderRadius: 3,
  },
  xAxis: {
    flexDirection: 'row',
    marginTop: 6,
  },
  xAxisRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  xAxisText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
    width: 20,
  },
  barXAxisRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  barXAxisText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export const ReplicaLineChart = AdminLineChart;
export const ReplicaAreaChart = AdminAreaChart;
export const ReplicaBarChart = AdminBarChart;
