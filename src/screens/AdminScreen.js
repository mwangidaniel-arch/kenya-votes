import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  COUNTIES, PRESIDENTIAL_CANDIDATES,
  getCountyCandidates, getMPCandidates, getMCACandidates,
} from '../data/kenyaData';
import { useElection } from '../context/ElectionContext';
import { AppButton, Card, Badge, MetricCard, ProgressBar, COLORS } from '../components/UI';

const TABS = ['Results', 'Counties', 'Audit Log'];
const CAND_COLORS = ['#1565C0', '#2E7D32', '#6A1B9A', '#E65100'];

function CandidateResult({ candidate, votes, total, color }) {
  const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
  return (
    <View style={styles.resultRow}>
      <View style={styles.resultMeta}>
        <Text style={styles.resultName}>{candidate.name}</Text>
        <Text style={styles.resultParty}>{candidate.party || candidate.short}</Text>
      </View>
      <View style={styles.resultRight}>
        <Text style={styles.resultVotes}>{votes} · {pct}%</Text>
        <ProgressBar percent={pct} color={color} />
      </View>
    </View>
  );
}

export default function AdminScreen({ navigation }) {
  const { state } = useElection();
  const [tab, setTab] = useState(0);
  const [selectedCounty, setSelectedCounty] = useState('nairobi');

  const totalVotes = state.auditLog.length;

  function getVotes(raceId, candidateId) {
    return state.votes[raceId]?.[candidateId] || 0;
  }

  function getTotalForRace(candidates, racePrefix) {
    return candidates.reduce((sum, c) => sum + getVotes(racePrefix, c.id), 0);
  }

  async function exportCSV() {
    try {
      let csv = 'KENYA ELECTIONS DEMO - RESULTS EXPORT\n\n';
      csv += 'PRESIDENTIAL RESULTS\nCandidate,Party,Votes\n';
      PRESIDENTIAL_CANDIDATES.forEach(c => {
        csv += `"${c.name}","${c.party}",${getVotes('president', c.id)}\n`;
      });
      csv += '\nAUDIT LOG\nTime,Voter (masked),County,Constituency,Ward\n';
      state.auditLog.forEach(e => {
        csv += `${e.time},${e.maskedId},"${e.county}","${e.constituency}","${e.ward}"\n`;
      });

      const path = FileSystem.documentDirectory + 'kenya_votes_results.csv';
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export Election Results' });
    } catch (e) {
      Alert.alert('Export Failed', e.message);
    }
  }

  const countyData = getCountyCandidates(selectedCounty);
  const presTotal = getTotalForRace(PRESIDENTIAL_CANDIDATES, 'president');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Badge label="Admin View" type="warning" />
          <Text style={styles.headerTitle}>Election Dashboard</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={exportCSV} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>⬇ CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metrics}>
        <MetricCard label="Total Votes" value={totalVotes} />
        <MetricCard label="Counties Active" value={new Set(state.auditLog.map(e => e.county)).size} color={COLORS.primary} />
        <MetricCard label="Status" value="Open" color={COLORS.success} />
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} style={[styles.tab, tab === i && styles.tabActive]} onPress={() => setTab(i)}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>

        {/* RESULTS TAB */}
        {tab === 0 && (
          <>
            <Card>
              <Text style={styles.cardTitle}>🏛️ Presidential Race</Text>
              {PRESIDENTIAL_CANDIDATES.map((c, i) => (
                <CandidateResult
                  key={c.id} candidate={c}
                  votes={getVotes('president', c.id)}
                  total={presTotal}
                  color={CAND_COLORS[i % CAND_COLORS.length]}
                />
              ))}
              {presTotal === 0 && <Text style={styles.noData}>No votes recorded yet</Text>}
            </Card>

            <Card>
              <Text style={styles.cardTitle}>County results — </Text>
              <View style={styles.pickerRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {COUNTIES.slice(0, 12).map(c => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setSelectedCounty(c.id)}
                      style={[styles.countyChip, selectedCounty === c.id && styles.countyChipActive]}
                    >
                      <Text style={[styles.countyChipText, selectedCounty === c.id && styles.countyChipTextActive]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <Text style={styles.subLabel}>Governor</Text>
              {countyData.governor.map((c, i) => {
                const raceId = `${selectedCounty}_governor`;
                const t = getTotalForRace(countyData.governor, `${selectedCounty}_governor`);
                return <CandidateResult key={c.id} candidate={c} votes={getVotes(raceId, c.id)} total={t} color={CAND_COLORS[i]} />;
              })}
              <Text style={[styles.subLabel, { marginTop: 12 }]}>Senator</Text>
              {countyData.senator.map((c, i) => {
                const raceId = `${selectedCounty}_senator`;
                const t = getTotalForRace(countyData.senator, `${selectedCounty}_senator`);
                return <CandidateResult key={c.id} candidate={c} votes={getVotes(raceId, c.id)} total={t} color={CAND_COLORS[i]} />;
              })}
            </Card>
          </>
        )}

        {/* COUNTIES TAB */}
        {tab === 1 && (
          <>
            <Text style={styles.sectionNote}>Votes cast by county</Text>
            {COUNTIES.map(county => {
              const count = state.auditLog.filter(e => e.county === county.id).length;
              return (
                <View key={county.id} style={styles.countyRow}>
                  <Text style={styles.countyName}>{county.name}</Text>
                  <View style={styles.countyBar}>
                    <View style={[styles.countyFill, { width: count > 0 ? Math.max(20, (count / Math.max(totalVotes, 1)) * 200) : 0 }]} />
                  </View>
                  <Text style={styles.countyCount}>{count}</Text>
                </View>
              );
            })}
            {totalVotes === 0 && <Text style={styles.noData}>No votes cast yet</Text>}
          </>
        )}

        {/* AUDIT LOG TAB */}
        {tab === 2 && (
          <Card>
            <Text style={styles.cardTitle}>Audit Log</Text>
            <Text style={styles.auditNote}>Voter IDs are masked. Vote choices are not recorded here.</Text>
            {state.auditLog.length === 0 && <Text style={styles.noData}>No votes recorded yet</Text>}
            {state.auditLog.map((entry, i) => (
              <View key={i} style={styles.logEntry}>
                <Text style={styles.logTime}>{entry.time}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logId}>{entry.maskedId}</Text>
                  <Text style={styles.logLocation}>{entry.ward} · {entry.constituency} · {entry.county}</Text>
                </View>
                <Badge label="Recorded" type="success" />
              </View>
            ))}
          </Card>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    backgroundColor: COLORS.surface, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  iconBtnText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  metrics: {
    flexDirection: 'row', gap: 10, padding: 12,
    backgroundColor: COLORS.surface, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontWeight: '600' },
  body: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  subLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  resultRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  resultMeta: { width: 120 },
  resultName: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  resultParty: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  resultRight: { flex: 1 },
  resultVotes: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginBottom: 2 },
  noData: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', padding: 16 },
  pickerRow: {},
  countyChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, marginRight: 8, backgroundColor: '#FAFAFA',
  },
  countyChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  countyChipText: { fontSize: 12, color: COLORS.textMuted },
  countyChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  sectionNote: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  countyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  countyName: { fontSize: 13, color: COLORS.text, width: 110 },
  countyBar: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  countyFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  countyCount: { fontSize: 13, fontWeight: '600', color: COLORS.text, width: 24, textAlign: 'right' },
  logEntry: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  logTime: { fontSize: 11, color: COLORS.textLight, fontFamily: 'monospace', width: 68 },
  logId: { fontSize: 13, fontWeight: '600', color: COLORS.text, fontFamily: 'monospace' },
  logLocation: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  auditNote: { fontSize: 12, color: COLORS.textLight, marginBottom: 12, fontStyle: 'italic' },
});
