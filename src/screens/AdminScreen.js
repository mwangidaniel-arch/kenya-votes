import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from '../lib/supabase';
import { COUNTIES, PRESIDENTIAL_CANDIDATES, getCountyCandidates } from '../data/kenyaData';
import { useElectionSettings } from '../hooks/useElectionSettings';
import { AppButton, Card, Badge, MetricCard, COLORS } from '../components/UI';

const TABS = ['Results', 'Counties', 'Audit Log'];
const CAND_COLORS = ['#1565C0', '#2E7D32', '#6A1B9A', '#E65100'];

function ProgressBar({ percent, color }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: Math.min(percent, 100) + '%', backgroundColor: color }]} />
    </View>
  );
}

export default function AdminScreen({ navigation }) {
  const [tab, setTab] = useState(0);
  const [votes, setVotes] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState('nairobi');
  const [loading, setLoading] = useState(true);
  const { settings, togglePolls } = useElectionSettings();
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchData();
    const votesSub = supabase.channel('votes-channel', { config: { broadcast: { self: true } } });
    votesSub.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, payload => {
      setVotes(prev => [...prev, payload.new]);
    }).subscribe();
    const auditSub = supabase.channel('audit-channel', { config: { broadcast: { self: true } } });
    auditSub.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_log' }, payload => {
      setAuditLog(prev => [payload.new, ...prev]);
    }).subscribe();
    return () => { supabase.removeChannel(votesSub); supabase.removeChannel(auditSub); };
  }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: v }, { data: a }] = await Promise.all([
      supabase.from('votes').select('*').order('created_at', { ascending: false }),
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }),
    ]);
    setVotes(v || []);
    setAuditLog(a || []);
    setLoading(false);
  }

  function countVotes(candidateId, field) {
    return votes.filter(v => v[field] === candidateId).length;
  }

  async function exportCSV() {
    try {
      let csv = 'KENYA ELECTIONS - RESULTS EXPORT\n\nPRESIDENTIAL RESULTS\nCandidate,Party,Votes\n';
      PRESIDENTIAL_CANDIDATES.forEach(c => {
        csv += '"' + c.name + '","' + c.party + '",' + countVotes(c.id, 'president') + '\n';
      });
      csv += '\nAUDIT LOG\nTime,Voter (masked),County,Constituency,Ward\n';
      auditLog.forEach(e => {
        csv += new Date(e.created_at).toLocaleTimeString() + ',' + e.masked_id + ',"' + e.county + '","' + e.constituency + '","' + e.ward + '"\n';
      });
      const path = FileSystem.documentDirectory + 'kenya_votes_results.csv';
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export Results' });
    } catch (e) { Alert.alert('Export Failed', e.message); }
  }

  const totalVotes = votes.length;
  const countiesActive = new Set(votes.map(v => v.county)).size;
  const presTotal = PRESIDENTIAL_CANDIDATES.reduce((s, c) => s + countVotes(c.id, 'president'), 0);
  const countyData = getCountyCandidates(selectedCounty);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Badge label="Admin View" type="warning" />
          <Text style={styles.headerTitle}>Election Dashboard</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={async () => {
          if (!settings) return;
          setToggling(true);
          const { data } = await supabase.auth.getUser();
          await togglePolls(settings.polls_open, data.user?.email);
          setToggling(false);
        }} style={[styles.iconBtn, { backgroundColor: settings?.polls_open ? '#FFEBEE' : '#E8F5E9' }]}>
          <Text style={[styles.iconBtnText, { color: settings?.polls_open ? '#C62828' : '#2E7D32' }]}>
            {toggling ? '...' : settings?.polls_open ? 'Close Polls' : 'Open Polls'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={exportCSV} style={styles.iconBtn}><Text style={styles.iconBtnText}>Export CSV</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('VoterImport')} style={styles.iconBtn}><Text style={styles.iconBtnText}>Import Voters</Text></TouchableOpacity>
          <TouchableOpacity onPress={async () => { await supabase.auth.signOut(); navigation.navigate('Home'); }} style={styles.iconBtn}><Text style={styles.iconBtnText}>Exit</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.metrics}>
        <MetricCard label="Total Votes" value={totalVotes} />
        <MetricCard label="Counties" value={countiesActive} color={COLORS.primary} />
        <MetricCard label="Status" value="Live" color={COLORS.success} />
      </View>
      <View style={styles.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} style={[styles.tab, tab === i && styles.tabActive]} onPress={() => setTab(i)}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {loading && <Text style={styles.noData}>Loading results...</Text>}

        {tab === 0 && !loading && (
          <Card>
            <Text style={styles.cardTitle}>Presidential Race</Text>
            {PRESIDENTIAL_CANDIDATES.map((c, i) => {
              const v = countVotes(c.id, 'president');
              const pct = presTotal > 0 ? Math.round((v / presTotal) * 100) : 0;
              return (
                <View key={c.id} style={styles.resultRow}>
                  <View style={styles.resultMeta}>
                    <Text style={styles.resultName}>{c.name}</Text>
                    <Text style={styles.resultParty}>{c.short}</Text>
                  </View>
                  <View style={styles.resultRight}>
                    <Text style={styles.resultVotes}>{v} · {pct}%</Text>
                    <ProgressBar percent={pct} color={CAND_COLORS[i]} />
                  </View>
                </View>
              );
            })}
            {presTotal === 0 && <Text style={styles.noData}>No votes recorded yet</Text>}
          </Card>
        )}

        {tab === 1 && !loading && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {COUNTIES.slice(0, 12).map(c => (
                <TouchableOpacity key={c.id} onPress={() => setSelectedCounty(c.id)}
                  style={[styles.countyChip, selectedCounty === c.id && styles.countyChipActive]}>
                  <Text style={[styles.countyChipText, selectedCounty === c.id && styles.countyChipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {COUNTIES.map(county => {
              const count = votes.filter(v => v.county === county.id).length;
              return (
                <View key={county.id} style={styles.countyRow}>
                  <Text style={styles.countyName}>{county.name}</Text>
                  <View style={styles.countyBar}>
                    <View style={[styles.countyFill, { width: count > 0 ? Math.max(10, (count / Math.max(totalVotes, 1)) * 150) : 0 }]} />
                  </View>
                  <Text style={styles.countyCount}>{count}</Text>
                </View>
              );
            })}
          </>
        )}

        {tab === 2 && !loading && (
          <Card>
            <Text style={styles.cardTitle}>Audit Log</Text>
            <Text style={styles.auditNote}>Voter IDs masked. Vote choices not recorded here.</Text>
            {auditLog.length === 0 && <Text style={styles.noData}>No votes recorded yet</Text>}
            {auditLog.map((entry, i) => (
              <View key={i} style={styles.logEntry}>
                <Text style={styles.logTime}>{new Date(entry.created_at).toLocaleTimeString()}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logId}>{entry.masked_id}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: COLORS.surface, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  iconBtnText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  metrics: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: COLORS.surface, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontWeight: '600' },
  body: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  resultRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  resultMeta: { width: 120 },
  resultName: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  resultParty: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  resultRight: { flex: 1 },
  resultVotes: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginBottom: 2 },
  progressTrack: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginTop: 5 },
  progressFill: { height: '100%', borderRadius: 4 },
  noData: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', padding: 16 },
  countyChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, backgroundColor: '#FAFAFA' },
  countyChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  countyChipText: { fontSize: 12, color: COLORS.textMuted },
  countyChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  countyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  countyName: { fontSize: 13, color: COLORS.text, width: 110 },
  countyBar: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  countyFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  countyCount: { fontSize: 13, fontWeight: '600', color: COLORS.text, width: 24, textAlign: 'right' },
  logEntry: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  logTime: { fontSize: 11, color: COLORS.textLight, fontFamily: 'monospace', width: 75 },
  logId: { fontSize: 13, fontWeight: '600', color: COLORS.text, fontFamily: 'monospace' },
  logLocation: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  auditNote: { fontSize: 12, color: COLORS.textLight, marginBottom: 12, fontStyle: 'italic' },
});
