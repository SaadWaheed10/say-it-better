import React, {useMemo} from 'react';
import {Text, View, useWindowDimensions} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import {useAppTheme} from '../../hooks/useAppTheme';
import {TestAttempt} from '../../types';
import {rp, rf, rr} from '../../theme/useScaledStyles';

type Props = {
  attempts: TestAttempt[];
  maxPoints?: number;
};

export function ScoreTrendChart({attempts, maxPoints = 8}: Props) {
  const {colors} = useAppTheme();
  const {width: windowWidth} = useWindowDimensions();
  const chartWidth = Math.min(windowWidth - rp(64), rp(320));

  const data = useMemo(() => {
    return [...attempts]
      .filter(a => a.maxScore > 0)
      .slice(0, maxPoints)
      .reverse()
      .map((attempt, index) => {
        const pct = Math.round((attempt.score / attempt.maxScore) * 100);
        return {
          value: pct,
          label: `${index + 1}`,
          dataPointText: `${pct}`,
        };
      });
  }, [attempts, maxPoints]);

  if (data.length === 0) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.borderSoft,
          backgroundColor: colors.surfaceSolid,
          borderRadius: rr(16),
          padding: rp(16),
          marginBottom: rp(12),
        }}>
        <Text style={{color: colors.secondaryText, fontSize: rf(13)}}>
          Complete a test to see your score trend.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.borderSoft,
        backgroundColor: colors.surfaceSolid,
        borderRadius: rr(16),
        paddingVertical: rp(14),
        paddingHorizontal: rp(10),
        marginBottom: rp(12),
        overflow: 'hidden',
      }}>
      <Text
        style={{
          color: colors.primaryText,
          fontSize: rf(14),
          fontWeight: '700',
          marginBottom: rp(10),
          paddingHorizontal: rp(6),
        }}>
        Score trend
      </Text>
      <LineChart
        data={data}
        width={chartWidth}
        height={rp(160)}
        spacing={data.length <= 2 ? rp(80) : undefined}
        initialSpacing={rp(16)}
        endSpacing={rp(16)}
        thickness={3}
        color={colors.primaryAccent}
        hideRules={false}
        rulesColor={colors.borderSoft}
        rulesType="solid"
        yAxisColor={colors.borderSoft}
        xAxisColor={colors.borderSoft}
        yAxisTextStyle={{color: colors.secondaryText, fontSize: rf(10)}}
        xAxisLabelTextStyle={{color: colors.secondaryText, fontSize: rf(10)}}
        dataPointsColor={colors.accentWarm}
        dataPointsRadius={5}
        textColor={colors.primaryText}
        textFontSize={rf(10)}
        textShiftY={-8}
        maxValue={100}
        noOfSections={4}
        yAxisLabelSuffix="%"
        curved
        areaChart
        startFillColor={`${colors.primaryAccent}55`}
        endFillColor={`${colors.primaryAccent}05`}
        startOpacity={0.35}
        endOpacity={0.05}
        isAnimated
        animationDuration={700}
        backgroundColor={colors.surfaceSolid}
      />
      <Text
        style={{
          color: colors.secondaryText,
          fontSize: rf(11),
          marginTop: rp(4),
          paddingHorizontal: rp(6),
        }}>
        Last {data.length} attempt{data.length === 1 ? '' : 's'} · % score
        (oldest → newest)
      </Text>
    </View>
  );
}
