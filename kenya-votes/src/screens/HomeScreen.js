import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { AppButton, Badge, COLORS } from '../components/UI';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.emblemCircle}>
          <Text style={styles.emblemText}>🇰🇪</Text>
        </View>
        <Text style={styles.title}>Kenya General Elections</Text>
        <Text style={styles.subtitle}>Independent Electoral and Boundaries Commission</Text>
        <View style={styles.badgeRow}>
          <Badge label="✓ Polls Open" type="success" />
          <Badge label="ID-Verified Voting" type="info" />
          <Badge label="5 Races" type="muted" />
        </View>
      </View>

      <View style={styles.raceList}>
        <Text style={styles.raceTitle}>Races on this ballot</Text>
        {[
          { icon: '🏛️', race: 'President', scope: 'National' },
          { icon: '🏢', race: 'Governor', scope: 'County level' },
          { icon: '📜', race: 'Senator', scope: 'County level' },
          { icon: '🗳️', race: 'Member of Parliament', scope: 'Constituency level' },
          { icon: '🏘️', race: 'Member of County Assembly', scope: 'Ward level' },
        ].map((r, i) => (
          <View key={i} style={styles.raceRow}>
            <Text style={styles.raceIcon}>{r.icon}</Text>
            <View>
              <Text style={styles.raceName}>{r.race}</Text>
              <Text style={styles.raceScope}>{r.scope}</Text>
            </View>
          </View>
        ))}
      </View>

      <AppButton
        title="Verify ID & Vote"
        onPress={() => navigation.navigate('Verify')}
        style={{ marginBottom: 12 }}
      />
      <AppButton
        title="Admin Dashboard"
        onPress={() => navigation.navigate('AdminPin')}
        variant="outline"
      />
      <Text style={styles.disclaimer}>
        This is a demonstration system. Not for official use.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 28, paddingTop: 12 },
  emblemCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  emblemText: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  raceList: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 20,
  },
  raceTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  raceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 12 },
  raceIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  raceName: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  raceScope: { fontSize: 12, color: COLORS.textMuted },
  disclaimer: { fontSize: 11, color: COLORS.textLight, textAlign: 'center', marginTop: 20 },
});
