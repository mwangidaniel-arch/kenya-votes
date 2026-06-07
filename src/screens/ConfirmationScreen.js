import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useElection } from '../context/ElectionContext';
import { AppButton, Card, COLORS } from '../components/UI';

export default function ConfirmationScreen({ navigation }) {
  const { state } = useElection();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successCircle}>
        <Text style={styles.checkmark}>✓</Text>
      </View>
      <Text style={styles.title}>Vote Cast Successfully</Text>
      <Text style={styles.subtitle}>
        Your vote has been recorded. Thank you for exercising your democratic right.
      </Text>

      <Card style={styles.receiptCard}>
        <Text style={styles.receiptLabel}>Ballot Receipt ID</Text>
        <Text style={styles.receiptId}>{state.lastReceipt || 'RCT-XXXXXXXX'}</Text>
        <Text style={styles.receiptNote}>
          Keep this for your records. It does not reveal your vote choices.
        </Text>
      </Card>

      <Card>
        <Text style={styles.infoTitle}>What happens next?</Text>
        {[
          'Your vote has been anonymously recorded in the system.',
          'Results are tallied in real time on the admin dashboard.',
          'Official results are announced after polls close.',
        ].map((item, i) => (
          <View key={i} style={styles.infoRow}>
            <Text style={styles.infoDot}>•</Text>
            <Text style={styles.infoText}>{item}</Text>
          </View>
        ))}
      </Card>

      <AppButton
        title="Back to Home"
        onPress={() => navigation.navigate('Home')}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 48, alignItems: 'center' },
  successCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#E8F5E9',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, marginTop: 12,
  },
  checkmark: { fontSize: 32, color: '#2E7D32' },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 16 },
  receiptCard: { width: '100%', alignItems: 'center', marginBottom: 12 },
  receiptLabel: { fontSize: 12, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  receiptId: { fontSize: 20, fontWeight: '700', color: '#1565C0', fontFamily: 'monospace', marginBottom: 8 },
  receiptNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A2E', marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  infoDot: { color: '#6B7280', fontSize: 14 },
  infoText: { fontSize: 13, color: '#6B7280', flex: 1, lineHeight: 18 },
});
