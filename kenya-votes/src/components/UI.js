import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

export const COLORS = {
  primary: '#1565C0',
  primaryLight: '#E3F2FD',
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#E65100',
  warningLight: '#FFF3E0',
  danger: '#C62828',
  dangerLight: '#FFEBEE',
  surface: '#FFFFFF',
  bg: '#F5F6FA',
  border: '#E0E0E0',
  text: '#1A1A2E',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  green: '#1B5E20',
  greenLight: '#E8F5E9',
};

export function AppButton({ title, onPress, variant = 'primary', disabled, loading, style }) {
  const bg = disabled
    ? '#D1D5DB'
    : variant === 'primary' ? COLORS.primary
    : variant === 'success' ? COLORS.success
    : variant === 'outline' ? 'transparent'
    : variant === 'danger' ? COLORS.danger
    : '#6B7280';

  const textColor = variant === 'outline' ? COLORS.primary : '#FFFFFF';
  const border = variant === 'outline' ? { borderWidth: 1, borderColor: COLORS.primary } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, { backgroundColor: bg }, border, style]}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={[styles.btnText, { color: textColor }]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({ label, type = 'info' }) {
  const map = {
    info: { bg: COLORS.primaryLight, color: COLORS.primary },
    success: { bg: COLORS.successLight, color: COLORS.success },
    warning: { bg: COLORS.warningLight, color: COLORS.warning },
    danger: { bg: COLORS.dangerLight, color: COLORS.danger },
    muted: { bg: '#F3F4F6', color: COLORS.textMuted },
  };
  const c = map[type] || map.info;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.color }]}>{label}</Text>
    </View>
  );
}

export function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function ProgressBar({ percent, color = COLORS.primary }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export function MetricCard({ label, value, color }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontSize: 15, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 12, fontWeight: '500' },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  sectionSubtitle: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  progressTrack: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  metricCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4, textAlign: 'center' },
  metricValue: { fontSize: 22, fontWeight: '600', color: COLORS.text },
});
